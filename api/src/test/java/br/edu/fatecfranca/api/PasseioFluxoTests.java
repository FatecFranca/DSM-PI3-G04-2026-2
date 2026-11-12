package br.edu.fatecfranca.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import br.edu.fatecfranca.api.dtos.PasseioDtos.SolicitacaoRequest;
import br.edu.fatecfranca.api.exceptions.RegraNegocioException;
import br.edu.fatecfranca.api.models.BookingStatus;
import br.edu.fatecfranca.api.models.Passeio;
import br.edu.fatecfranca.api.models.Pet;
import br.edu.fatecfranca.api.models.Tutor;
import br.edu.fatecfranca.api.models.Walker;
import br.edu.fatecfranca.api.repositories.PasseioRepository;
import br.edu.fatecfranca.api.repositories.PetRepository;
import br.edu.fatecfranca.api.repositories.TutorRepository;
import br.edu.fatecfranca.api.repositories.WalkerRepository;
import br.edu.fatecfranca.api.services.PasseioService;

/**
 * Testa o fluxo completo do passeio contra o Atlas real (o projeto não usa
 * banco em memória): solicitação com validações, pagamento em 2 parcelas,
 * código de retirada, transições por ator, conclusão e avaliação.
 * Cria documentos temporários com ids únicos e os remove no fim.
 */
@SpringBootTest
class PasseioFluxoTests {

    @Autowired
    private PasseioService passeioService;

    @Autowired
    private PasseioRepository passeioRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private WalkerRepository walkerRepository;

    @Autowired
    private PetRepository petRepository;

    /** Data de amanhã (evita a validação de horário passado). */
    private static String dataDeAmanha() {
        return LocalDate.now().plusDays(1).toString();
    }

    private static int diaDaSemanaDeAmanha() {
        return LocalDate.now().plusDays(1).getDayOfWeek().getValue() % 7; // 0 = domingo (front)
    }

    private Walker novoWalker(String sufixo) {
        Walker walker = new Walker();
        walker.setId("test-walker-" + sufixo);
        walker.setName("Teste Walker");
        walker.setSizes(List.of("medio"));
        walker.setPrices(Map.of(30, 100.0, 60, 150.0));
        walker.setAvailability(Map.of(diaDaSemanaDeAmanha(), List.of("08:00", "10:00")));
        walker.setWalksCount(0);
        walker.setRating(4.0);
        walker.setReviewsCount(1);
        return walkerRepository.save(walker);
    }

    private Tutor novoTutor(String sufixo) {
        Tutor tutor = new Tutor();
        tutor.setId("test-tutor-" + sufixo);
        tutor.setName("Teste Tutor");
        tutor.setEmail("teste-passeio-" + sufixo + "@roledepet.demo");
        tutor.setRoles(List.of("owner"));
        tutor.setAddress(new Tutor.Address("Rua do Teste, 123", "Vila Teste", "São Paulo", null, ""));
        return tutorRepository.save(tutor);
    }

    private Pet novoPet(String sufixo, String tutorId) {
        Pet pet = new Pet();
        pet.setId("test-pet-" + sufixo);
        pet.setOwnerId(tutorId);
        pet.setName("Thor");
        pet.setSize("medio");
        pet.setHealth(new Pet.Health("", "", "", "", "", 60, ""));
        return petRepository.save(pet);
    }

    @Test
    void fluxoCompletoComPagamentoRetiradaEAvaliacao() {
        String sufixo = UUID.randomUUID().toString().substring(0, 8);
        Tutor tutor = novoTutor(sufixo);
        Walker walker = novoWalker(sufixo);
        Pet pet = novoPet(sufixo, tutor.getId());
        try {
            SolicitacaoRequest pedido = new SolicitacaoRequest(
                    tutor.getId(), walker.getId(), pet.getId(), dataDeAmanha(), "10:00", 30, "");

            Passeio passeio = passeioService.criarSolicitacao(pedido);
            String passeioId = passeio.getId();
            assertEquals(BookingStatus.REQUESTED, passeio.getStatus());
            assertEquals(4, passeio.getPickupCode().length());
            assertEquals(15.0, passeio.getFee());
            assertEquals(85.0, passeio.getWalkerEarnings());
            assertEquals(1, passeio.getHistory().size());
            assertEquals("Rua do Teste, 123 — Vila Teste", passeio.getAddress());
            assertEquals("none", passeio.getPayment().status());

            // duração não oferecida pelo walker
            RegraNegocioException erroDuracao = assertThrows(RegraNegocioException.class,
                    () -> passeioService.criarSolicitacao(new SolicitacaoRequest(
                            tutor.getId(), walker.getId(), pet.getId(), dataDeAmanha(), "10:00", 45, "")));
            assertEquals("duration", erroDuracao.getField());

            // pagamento antes do aceite é recusado
            assertThrows(RegraNegocioException.class, () -> passeioService.pagar(passeioId, "pm1"));

            passeio = passeioService.transicionar(passeioId, BookingStatus.ACCEPTED, "walker");
            assertEquals(BookingStatus.ACCEPTED, passeio.getStatus());
            assertEquals(2, passeio.getHistory().size());

            passeio = passeioService.pagar(passeioId, "pm1");
            assertEquals(BookingStatus.PAID, passeio.getStatus());
            assertEquals("partial", passeio.getPayment().status());
            assertEquals("pm1", passeio.getPayment().methodId());

            // owner não pode conduzir a etapa operacional
            assertThrows(RegraNegocioException.class,
                    () -> passeioService.transicionar(passeioId, BookingStatus.ON_THE_WAY, "owner"));

            passeio = passeioService.transicionar(passeioId, BookingStatus.ON_THE_WAY, "walker");

            // código de retirada errado
            RegraNegocioException erroCodigo = assertThrows(RegraNegocioException.class,
                    () -> passeioService.confirmarRetirada(passeioId, "0000"));
            assertEquals("code", erroCodigo.getField());

            passeio = passeioService.confirmarRetirada(passeioId, passeio.getPickupCode());
            assertEquals(BookingStatus.PICKED_UP, passeio.getStatus());

            passeioService.transicionar(passeioId, BookingStatus.WALKING, "walker");
            passeioService.transicionar(passeioId, BookingStatus.RETURNING, "walker");
            passeio = passeioService.transicionar(passeioId, BookingStatus.COMPLETED, "walker");
            assertEquals("released", passeio.getPayment().status());
            assertEquals(1, walkerRepository.findById(walker.getId()).orElseThrow().getWalksCount());

            Passeio avaliado = passeioService.avaliar(passeioId, 5, "Ótimo passeio");
            assertEquals(BookingStatus.REVIEWED, avaliado.getStatus());
            assertEquals(5, avaliado.getReview().rating());
            Walker avaliadoWalker = walkerRepository.findById(walker.getId()).orElseThrow();
            assertEquals(2, avaliadoWalker.getReviewsCount());
            assertEquals(4.5, avaliadoWalker.getRating());
        } finally {
            passeioRepository.findByWalkerIdAndDate(walker.getId(), dataDeAmanha())
                    .forEach(p -> passeioRepository.deleteById(p.getId()));
            walkerRepository.deleteById(walker.getId());
            petRepository.deleteById(pet.getId());
            tutorRepository.deleteById(tutor.getId());
        }
    }

    @Test
    void cancelamentoAposPagamentoEstorna() {
        String sufixo = UUID.randomUUID().toString().substring(0, 8);
        Tutor tutor = novoTutor(sufixo);
        Walker walker = novoWalker(sufixo);
        Pet pet = novoPet(sufixo, tutor.getId());
        try {
            Passeio passeio = passeioService.criarSolicitacao(new SolicitacaoRequest(
                    tutor.getId(), walker.getId(), pet.getId(), dataDeAmanha(), "08:00", 30, ""));
            String passeioId = passeio.getId();
            passeioService.transicionar(passeioId, BookingStatus.ACCEPTED, "walker");
            passeioService.pagar(passeioId, "pm2");

            Passeio canceladoPeloTutor = passeioService.transicionar(passeioId, BookingStatus.CANCELED, "owner");
            assertEquals("partially_refunded", canceladoPeloTutor.getPayment().status());

            // cancelar de novo é impossível (status terminal)
            assertThrows(RegraNegocioException.class,
                    () -> passeioService.transicionar(passeioId, BookingStatus.CANCELED, "owner"));
        } finally {
            passeioRepository.findByWalkerIdAndDate(walker.getId(), dataDeAmanha())
                    .forEach(p -> passeioRepository.deleteById(p.getId()));
            walkerRepository.deleteById(walker.getId());
            petRepository.deleteById(pet.getId());
            tutorRepository.deleteById(tutor.getId());
        }
    }

    @Test
    void passeioVencidoExpiraComoSystem() {
        String sufixo = UUID.randomUUID().toString().substring(0, 8);
        Tutor tutor = novoTutor(sufixo);
        Walker walker = novoWalker(sufixo);
        Pet pet = novoPet(sufixo, tutor.getId());
        try {
            Passeio antigo = new Passeio();
            antigo.setId("test-passeio-" + sufixo);
            antigo.setOwnerId(tutor.getId());
            antigo.setWalkerId(walker.getId());
            antigo.setPetId(pet.getId());
            antigo.setDate(dataDeAmanha());
            antigo.setTime("10:00");
            antigo.setDuration(30);
            antigo.setPrice(100.0);
            antigo.setStatus(BookingStatus.REQUESTED);
            antigo.setPickupCode("1234");
            antigo.setExpiresAt(System.currentTimeMillis() - 1000);
            passeioRepository.save(antigo);

            passeioService.expirarVencidos();
            Passeio expirado = passeioRepository.findById(antigo.getId()).orElseThrow();
            assertEquals(BookingStatus.EXPIRED, expirado.getStatus());
            List<Passeio.HistoryEntry> historico = expirado.getHistory();
            assertEquals("system", historico.get(historico.size() - 1).actor());
        } finally {
            passeioRepository.deleteById("test-passeio-" + sufixo);
            walkerRepository.deleteById(walker.getId());
            petRepository.deleteById(pet.getId());
            tutorRepository.deleteById(tutor.getId());
        }
    }

    @Test
    void horarioOcupadoPorOutroPasseioAtivoERecusado() {
        String sufixo = UUID.randomUUID().toString().substring(0, 8);
        Tutor tutor = novoTutor(sufixo);
        Walker walker = novoWalker(sufixo);
        Pet pet = novoPet(sufixo, tutor.getId());
        try {
            passeioService.criarSolicitacao(new SolicitacaoRequest(
                    tutor.getId(), walker.getId(), pet.getId(), dataDeAmanha(), "10:00", 30, ""));
            RegraNegocioException erro = assertThrows(RegraNegocioException.class,
                    () -> passeioService.criarSolicitacao(new SolicitacaoRequest(
                            tutor.getId(), walker.getId(), pet.getId(), dataDeAmanha(), "10:00", 30, "")));
            assertEquals("time", erro.getField());
            assertTrue(erro.getMessage().contains("não está mais disponível"));
        } finally {
            passeioRepository.findByWalkerIdAndDate(walker.getId(), dataDeAmanha())
                    .forEach(p -> passeioRepository.deleteById(p.getId()));
            walkerRepository.deleteById(walker.getId());
            petRepository.deleteById(pet.getId());
            tutorRepository.deleteById(tutor.getId());
        }
    }
}
