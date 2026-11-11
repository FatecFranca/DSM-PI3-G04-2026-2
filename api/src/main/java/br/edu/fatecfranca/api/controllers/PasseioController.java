package br.edu.fatecfranca.api.controllers;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import br.edu.fatecfranca.api.dtos.PasseioResponse;
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
    public List<PasseioResponse> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PasseioResponse> buscarPorId(@PathVariable String id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PasseioResponse> criar(@Valid @RequestBody Passeio passeio) {
        PasseioResponse passeioSalvo = service.salvar(passeio);
        return ResponseEntity.status(HttpStatus.CREATED).body(passeioSalvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PasseioResponse> atualizar(@PathVariable String id, @Valid @RequestBody Passeio passeio) {
        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        passeio.setId(id);
        PasseioResponse passeioAtualizado = service.salvar(passeio);
        return ResponseEntity.ok(passeioAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable String id) {
        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}