package br.edu.fatecfranca.api.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import br.edu.fatecfranca.api.dtos.PasseioDtos.SolicitacaoRequest;
import br.edu.fatecfranca.api.exceptions.RegraNegocioException;
import br.edu.fatecfranca.api.models.BookingStateMachine;
import br.edu.fatecfranca.api.models.BookingStatus;
import br.edu.fatecfranca.api.models.Passeio;
import br.edu.fatecfranca.api.models.Pet;
import br.edu.fatecfranca.api.models.Tutor;
import br.edu.fatecfranca.api.models.Walker;
import br.edu.fatecfranca.api.repositories.PasseioRepository;
import br.edu.fatecfranca.api.repositories.PetRepository;
import br.edu.fatecfranca.api.repositories.TutorRepository;
import br.edu.fatecfranca.api.repositories.WalkerRepository;

/**
 * Regras de negócio do passeio (Fase 4): port literal das funções puras do
 * bookingService.js do front — validação de solicitação, máquina de transições
 * por ator, pagamento em 2 parcelas (50%/50% + taxa de 15%), código de retirada
 * e avaliação. O tracking permanece simulação do front: aqui não é tocado.
 */
@Service
public class PasseioService {

    /** Espelha PLATFORM_FEE_RATE do front (src/utils/constants.js): 15%. */
    private static final double PLATFORM_FEE_RATE = 0.15;

    /** Janela de resposta da solicitação (48 h), espelha o front. */
    private static final long JANELA_RESPOSTA_MS = 48 * 3600_000L;

    /** Horários reserváveis da plataforma — espelha DAY_SLOTS de src/utils/dates.js. */
    private static final List<String> DAY_SLOTS = List.of(
            "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
            "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00");

    /** Espelha DOG_SIZE_LABEL de src/utils/constants.js. */
    private static final Map<String, String> DOG_SIZE_LABEL = Map.of(
            "mini", "Mini", "pequeno", "Pequeno", "medio", "Médio",
            "grande", "Grande", "gigante", "Gigante");

    /** Passeios fechados liberam o horário do walker (isClosed do front). */
    private static final Set<String> STATUS_FECHADOS = Set.of(
            BookingStatus.DECLINED, BookingStatus.EXPIRED, BookingStatus.CANCELED);

    private final PasseioRepository repository;
    private final WalkerRepository walkerRepository;
    private final PetRepository petRepository;
    private final TutorRepository tutorRepository;

    public PasseioService(PasseioRepository repository, WalkerRepository walkerRepository,
            PetRepository petRepository, TutorRepository tutorRepository) {
        this.repository = repository;
        this.walkerRepository = walkerRepository;
        this.petRepository = petRepository;
        this.tutorRepository = tutorRepository;
    }

    // ------------------------------------------------------------------
    // CRUD cru (usado pelo seed e pelas rotas genéricas)
    // ------------------------------------------------------------------

    private void verificarVinculos(String ownerId, String walkerId, String petId) {
        if (!tutorRepository.existsById(ownerId)) {
            throw new RegraNegocioException(HttpStatus.NOT_FOUND, "Tutor não encontrado.");
        }
        if (!walkerRepository.existsById(walkerId)) {
            throw new RegraNegocioException(HttpStatus.NOT_FOUND, "Walker não encontrado.");
        }
        if (!petRepository.existsById(petId)) {
            throw new RegraNegocioException(HttpStatus.NOT_FOUND, "Pet não encontrado.");
        }
    }

    private void validarStatus(String status) {
        if (status == null || !BookingStatus.ALL.contains(status)) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "Status inválido. Valores aceitos: " + String.join(", ", BookingStatus.ALL) + ".");
        }
    }

    /** Se veio só o preço, deriva taxa (15%) e ganho líquido do walker. */
    private void calcularValores(Passeio passeio) {
        if (passeio.getPrice() != null && passeio.getFee() == null) {
            passeio.setFee(arredondar2(passeio.getPrice() * PLATFORM_FEE_RATE));
            passeio.setWalkerEarnings(arredondar2(passeio.getPrice() - passeio.getFee()));
        }
    }

    public List<Passeio> listarTodos() {
        return repository.findAll();
    }

    public Optional<Passeio> buscarPorId(String id) {
        return repository.findById(id);
    }

    /** Salva o passeio como veio (o seed envia objetos completos com status arbitrário). */
    public Passeio salvar(Passeio passeio) {
        verificarVinculos(passeio.getOwnerId(), passeio.getWalkerId(), passeio.getPetId());
        validarStatus(passeio.getStatus());
        calcularValores(passeio);
        return repository.save(passeio);
    }

    public void excluir(String id) {
        repository.deleteById(id);
    }

    // ------------------------------------------------------------------
    // Solicitação (POST /passeios) — porta validateBookingInput + createBooking
    // ------------------------------------------------------------------

    public Passeio criarSolicitacao(SolicitacaoRequest request) {
        if (request == null || request.ownerId() == null || request.ownerId().isBlank()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Informe o tutor da solicitação.");
        }
        Walker walker = request.walkerId() == null
                ? null
                : walkerRepository.findById(request.walkerId()).orElse(null);
        if (walker == null) {
            throw new RegraNegocioException(HttpStatus.NOT_FOUND, "Dog walker não encontrado.");
        }
        if (request.petId() == null || request.petId().isBlank()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Selecione qual pet vai passear.", "petId");
        }
        Pet pet = petRepository.findById(request.petId())
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND,
                        "Pet não encontrado. Cadastre o pet antes de solicitar.", "petId"));
        if (request.date() == null || request.date().isBlank()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Escolha a data do passeio.", "date");
        }
        if (request.time() == null || request.time().isBlank()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Escolha um horário disponível.", "time");
        }
        LocalDate data = interpretarData(request.date());
        LocalTime hora = interpretarHora(request.time());
        Integer duracao = request.duration();
        Double preco = duracao == null || walker.getPrices() == null ? null : walker.getPrices().get(duracao);
        if (preco == null) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "Escolha uma duração oferecida por este profissional.", "duration");
        }
        Integer limite = pet.getHealth() == null ? null : pet.getHealth().maxWalkMinutes();
        if (limite != null && duracao > limite) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    String.format("O perfil de %s limita passeios a %d min.", pet.getName(), limite), "duration");
        }
        if (!estaDisponivel(walker, data, request.time())) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "Este horário não está mais disponível. Escolha outro.", "time");
        }
        String avisoDePorte = incompatibilidadeDePorte(walker, pet);
        if (avisoDePorte != null) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, avisoDePorte, "petId");
        }

        Tutor tutor = tutorRepository.findById(request.ownerId()).orElse(null);
        long agora = System.currentTimeMillis();
        double fee = arredondar2(preco * PLATFORM_FEE_RATE);
        String rua = tutor != null && tutor.getAddress() != null && tutor.getAddress().street() != null
                ? tutor.getAddress().street().split(",")[0]
                : "Endereço do tutor";
        String bairro = tutor != null && tutor.getAddress() != null ? tutor.getAddress().neighborhood() : null;

        Passeio passeio = new Passeio();
        passeio.setId("b" + UUID.randomUUID());
        passeio.setOwnerId(request.ownerId());
        passeio.setWalkerId(walker.getId());
        passeio.setPetId(pet.getId());
        passeio.setDate(request.date());
        passeio.setTime(request.time());
        passeio.setDuration(duracao);
        passeio.setPrice(preco);
        passeio.setFee(fee);
        passeio.setWalkerEarnings(arredondar2(preco - fee));
        passeio.setStatus(BookingStatus.REQUESTED);
        passeio.setHistory(List.of(new Passeio.HistoryEntry(BookingStatus.REQUESTED, agora, "owner")));
        passeio.setPickupCode(codigoDeRetirada());
        passeio.setPayment(new Passeio.Payment("none", null, null, null, null, null));
        passeio.setTracking(new Passeio.Tracking(0, 0, 0, 0, null, null,
                rua + " → rota pelo bairro → retorno"));
        passeio.setReview(null);
        passeio.setNotes(request.notes());
        passeio.setAddress(bairro == null ? rua : String.format("%s — %s", tutor.getAddress().street(), bairro));
        passeio.setCreatedAt(agora);
        passeio.setUpdatedAt(agora);
        passeio.setExpiresAt(Math.min(agora + JANELA_RESPOSTA_MS,
                carimboDeTempo(data, hora)));
        return repository.save(passeio);
    }

    // ------------------------------------------------------------------
    // Transições (máquina de estados do front)
    // ------------------------------------------------------------------

    /** Transição genérica validada: aceitar/recusar/cancelar/etapas do passeio. */
    public Passeio transicionar(String id, String to, String actor) {
        validarStatus(to);
        if (actor == null || !Set.of("owner", "walker", "system").contains(actor)) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "Ator inválido. Valores aceitos: owner, walker, system.");
        }
        Passeio passeio = buscar(id);
        if (!BookingStateMachine.podeTransicionar(passeio.getStatus(), to, actor)) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    BookingStateMachine.mensagemTransicaoInvalida(passeio.getStatus(), to));
        }
        return aplicarTransicao(passeio, to, actor, null);
    }

    /** Pagamento simulado: só depois do aceite; 50% é liberado ao walker na hora. */
    public Passeio pagar(String id, String methodId) {
        Passeio passeio = buscar(id);
        if (!BookingStatus.ACCEPTED.equals(passeio.getStatus())) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "O pagamento só pode ser feito depois que o dog walker aceitar.");
        }
        if (methodId == null || methodId.isBlank()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Escolha uma forma de pagamento.", "methodId");
        }
        long agora = System.currentTimeMillis();
        Passeio.Payment pagamento = new Passeio.Payment("partial", methodId, agora, agora, null, null);
        return aplicarTransicao(passeio, BookingStatus.PAID, "owner", pagamento);
    }

    /** Walker confirma a retirada com o código de 4 dígitos exibido ao tutor. */
    public Passeio confirmarRetirada(String id, String code) {
        Passeio passeio = buscar(id);
        if (code == null || passeio.getPickupCode() == null || !code.trim().equals(passeio.getPickupCode())) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "Código incorreto. Peça ao tutor o código exibido no app.", "code");
        }
        return aplicarTransicao(passeio, BookingStatus.PICKED_UP, "walker", null);
    }

    /** Tutor avalia um passeio concluído; a nota atualiza o walker no banco. */
    public Passeio avaliar(String id, Integer rating, String comment) {
        Passeio passeio = buscar(id);
        if (!BookingStatus.COMPLETED.equals(passeio.getStatus())) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Só é possível avaliar passeios concluídos.");
        }
        if (rating == null || rating < 1 || rating > 5) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Escolha de 1 a 5 estrelas.", "rating");
        }
        passeio.setReview(new Passeio.Review(rating, comment == null ? "" : comment.trim(), System.currentTimeMillis()));
        Passeio avaliado = aplicarTransicao(passeio, BookingStatus.REVIEWED, "owner", null);
        atualizarAvaliacaoDoWalker(avaliado, rating);
        return avaliado;
    }

    /** Expira solicitações/aceites vencidos (ator system). Retorna quantos expirou. */
    public int expirarVencidos() {
        long agora = System.currentTimeMillis();
        List<Passeio> vencidos = new ArrayList<>();
        for (Passeio passeio : repository.findAll()) {
            boolean janelaAberta = BookingStatus.REQUESTED.equals(passeio.getStatus())
                    || BookingStatus.ACCEPTED.equals(passeio.getStatus());
            if (janelaAberta && passeio.getExpiresAt() != null && passeio.getExpiresAt() < agora) {
                vencidos.add(passeio);
            }
        }
        for (Passeio passeio : vencidos) {
            aplicarTransicao(passeio, BookingStatus.EXPIRED, "system", null);
        }
        return vencidos.size();
    }

    // ------------------------------------------------------------------
    // Internos
    // ------------------------------------------------------------------

    private Passeio buscar(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Passeio não encontrado."));
    }

    /** Aplica o novo status ao passeio com os efeitos colaterais de negócio. */
    private Passeio aplicarTransicao(Passeio passeio, String to, String actor, Passeio.Payment pagamento) {
        long agora = System.currentTimeMillis();
        if (pagamento != null) {
            passeio.setPayment(pagamento);
        }
        // 2ª parcela: liberada quando o walker finaliza o passeio
        if (BookingStatus.COMPLETED.equals(to) && "partial".equals(paymentStatus(passeio))) {
            Passeio.Payment atual = passeio.getPayment();
            passeio.setPayment(new Passeio.Payment("released", atual.methodId(), atual.paidAt(),
                    atual.firstReleaseAt(), agora, null));
        }
        // Cancelamento após pagamento: tutor → metade retida estornada; walker → estorno total
        if (BookingStatus.CANCELED.equals(to) && "partial".equals(paymentStatus(passeio))) {
            Passeio.Payment atual = passeio.getPayment();
            String novoStatus = "owner".equals(actor) ? "partially_refunded" : "refunded";
            passeio.setPayment(new Passeio.Payment(novoStatus, atual.methodId(), atual.paidAt(),
                    atual.firstReleaseAt(), null, agora));
        }
        passeio.setStatus(to);
        passeio.setUpdatedAt(agora);
        List<Passeio.HistoryEntry> historico = new ArrayList<>(
                passeio.getHistory() == null ? List.of() : passeio.getHistory());
        historico.add(new Passeio.HistoryEntry(to, agora, actor));
        passeio.setHistory(historico);
        Passeio salvo = repository.save(passeio);
        if (BookingStatus.COMPLETED.equals(to)) {
            somarPasseioConcluido(salvo.getWalkerId());
        }
        return salvo;
    }

    private String paymentStatus(Passeio passeio) {
        return passeio.getPayment() == null ? "none" : passeio.getPayment().status();
    }

    /** walksCount+1 quando o passeio é concluído (efeito do front, agora persistido). */
    private void somarPasseioConcluido(String walkerId) {
        walkerRepository.findById(walkerId).ifPresent(walker -> {
            int atual = walker.getWalksCount() == null ? 0 : walker.getWalksCount();
            walker.setWalksCount(atual + 1);
            walkerRepository.save(walker);
        });
    }

    /** Média ponderada do walker com a nova nota (mesma fórmula do front). */
    private void atualizarAvaliacaoDoWalker(Passeio passeio, int rating) {
        walkerRepository.findById(passeio.getWalkerId()).ifPresent(walker -> {
            int antigoCount = walker.getReviewsCount() == null ? 0 : walker.getReviewsCount();
            double antigaNota = walker.getRating() == null ? rating : walker.getRating();
            int novoCount = antigoCount + 1;
            walker.setReviewsCount(novoCount);
            walker.setRating(arredondar2((antigaNota * antigoCount + rating) / novoCount));
            walkerRepository.save(walker);
        });
    }

    /**
     * Disponibilidade = template do dia da semana − bloqueios − horários
     * ocupados por passeios ativos − horário já passado (getDaySlots do front).
     */
    private boolean estaDisponivel(Walker walker, LocalDate data, String time) {
        if (!DAY_SLOTS.contains(time)) {
            return false;
        }
        int diaDaSemana = data.getDayOfWeek().getValue() % 7; // 0 = domingo (front)
        List<String> bloqueados = walker.getBlockedSlots() == null
                ? List.of()
                : walker.getBlockedSlots().getOrDefault(data.toString(), List.of());
        if (bloqueados.contains("*")) {
            return false;
        }
        List<String> template = walker.getAvailability() == null
                ? List.of()
                : walker.getAvailability().getOrDefault(diaDaSemana, List.of());
        if (!template.contains(time) || bloqueados.contains(time)) {
            return false;
        }
        for (Passeio passeio : repository.findByWalkerIdAndDate(walker.getId(), data.toString())) {
            if (!STATUS_FECHADOS.contains(passeio.getStatus()) && time.equals(passeio.getTime())) {
                return false;
            }
        }
        return !(data.equals(LocalDate.now()) && minutos(horaDeAgora()) <= minutos(time));
    }

    /** Porte incompatível é bloqueante; os demais avisos são apenas informativos (front). */
    private String incompatibilidadeDePorte(Walker walker, Pet pet) {
        List<String> portes = walker.getSizes() == null ? List.of() : walker.getSizes();
        if (portes.contains(pet.getSize())) {
            return null;
        }
        String porte = DOG_SIZE_LABEL.getOrDefault(pet.getSize(), pet.getSize()).toLowerCase();
        return String.format("%s não atende cães de porte %s.", primeiroNome(walker.getName()), porte);
    }

    private String primeiroNome(String nome) {
        if (nome == null || nome.isBlank()) {
            return "O profissional";
        }
        return nome.trim().split("\\s+")[0];
    }

    private String codigoDeRetirada() {
        return String.valueOf(1000 + (int) (Math.random() * 9000));
    }

    private long carimboDeTempo(LocalDate data, LocalTime hora) {
        return data.atTime(hora).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }

    private LocalDate interpretarData(String iso) {
        try {
            return LocalDate.parse(iso);
        } catch (DateTimeParseException exception) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Escolha a data do passeio.", "date");
        }
    }

    private LocalTime interpretarHora(String hhmm) {
        try {
            return LocalTime.parse(hhmm);
        } catch (DateTimeParseException exception) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Escolha um horário disponível.", "time");
        }
    }

    private LocalTime horaDeAgora() {
        return LocalDateTime.now().toLocalTime();
    }

    private int minutos(LocalTime hora) {
        return hora.getHour() * 60 + hora.getMinute();
    }

    private int minutos(String hhmm) {
        String[] partes = hhmm.split(":");
        return Integer.parseInt(partes[0]) * 60 + (partes.length > 1 ? Integer.parseInt(partes[1]) : 0);
    }

    private double arredondar2(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }
}
