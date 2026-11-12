package br.edu.fatecfranca.api.controllers;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.edu.fatecfranca.api.dtos.PasseioDtos.AvaliacaoRequest;
import br.edu.fatecfranca.api.dtos.PasseioDtos.PagamentoRequest;
import br.edu.fatecfranca.api.dtos.PasseioDtos.RetiradaRequest;
import br.edu.fatecfranca.api.dtos.PasseioDtos.SolicitacaoRequest;
import br.edu.fatecfranca.api.dtos.PasseioDtos.TransicaoRequest;
import br.edu.fatecfranca.api.models.Passeio;
import br.edu.fatecfranca.api.services.PasseioService;

@RestController
@RequestMapping("/passeios")
public class PasseioController {

    private final PasseioService service;

    public PasseioController(PasseioService service) {
        this.service = service;
    }

    @GetMapping
    public List<Passeio> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Passeio> buscarPorId(@PathVariable String id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Solicitação do tutor: valida regras de negócio e nasce com status "requested". */
    @PostMapping
    public ResponseEntity<Passeio> solicitar(@RequestBody SolicitacaoRequest request) {
        Passeio passeio = service.criarSolicitacao(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(passeio);
    }

    /** Salva o passeio como veio (usado pelo seed; não passa pelas regras de solicitação). */
    @PostMapping("/importar")
    public ResponseEntity<Passeio> importar(@RequestBody Passeio passeio) {
        Passeio passeioSalvo = service.salvar(passeio);
        return ResponseEntity.status(HttpStatus.CREATED).body(passeioSalvo);
    }

    /** Transição genérica validada pela máquina de estados ({to, actor}). */
    @PostMapping("/{id}/transicoes")
    public Passeio transicionar(@PathVariable String id, @RequestBody TransicaoRequest request) {
        return service.transicionar(id, request.to(), request.actor());
    }

    /** Pagamento (status "accepted" → "paid", com a 1ª parcela liberada). */
    @PostMapping("/{id}/pagamento")
    public Passeio pagar(@PathVariable String id, @RequestBody PagamentoRequest request) {
        return service.pagar(id, request.methodId());
    }

    /** Confirmação de retirada com o código de 4 dígitos. */
    @PostMapping("/{id}/retirada")
    public Passeio confirmarRetirada(@PathVariable String id, @RequestBody RetiradaRequest request) {
        return service.confirmarRetirada(id, request.code());
    }

    /** Avaliação do tutor (status "completed" → "reviewed"); atualiza o walker. */
    @PostMapping("/{id}/avaliacao")
    public Passeio avaliar(@PathVariable String id, @RequestBody AvaliacaoRequest request) {
        return service.avaliar(id, request.rating(), request.comment());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Passeio> atualizar(@PathVariable String id, @RequestBody Passeio passeio) {
        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        passeio.setId(id);
        return ResponseEntity.ok(service.salvar(passeio));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable String id) {
        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    /** Verificação manual da expiração (o scheduler roda a cada minuto). */
    @PostMapping("/expirar-vencidos")
    public Map<String, Integer> expirarVencidos() {
        return Map.of("expirados", service.expirarVencidos());
    }
}
