package br.edu.fatecfranca.api.controllers;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import br.edu.fatecfranca.api.models.Walker;
import br.edu.fatecfranca.api.services.WalkerService;

@RestController
@RequestMapping("/walkers")
public class WalkerController {
    
    private final WalkerService service;

    public WalkerController(WalkerService service) {
        this.service = service;
    }

    @GetMapping
    public List<Walker> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Walker> buscarPorId(@PathVariable String id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Walker> criar(@Valid @RequestBody Walker walker) {
        Walker walkerSalvo = service.salvar(walker);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(walkerSalvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Walker> atualizar(@PathVariable String id, @Valid @RequestBody Walker walker) {
        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        walker.setId(id);
        Walker walkerAtualizado = service.salvar(walker);
        return ResponseEntity.ok(walkerAtualizado);
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