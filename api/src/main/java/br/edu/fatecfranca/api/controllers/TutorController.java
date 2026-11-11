package br.edu.fatecfranca.api.controllers;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.edu.fatecfranca.api.models.Tutor;
import br.edu.fatecfranca.api.services.TutorService;

@RestController
@RequestMapping("/tutores")
public class TutorController {
    
    private final TutorService service;

    public TutorController(TutorService service) {
        this.service = service;
    }

    @GetMapping
    public List<Tutor> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tutor> buscarPorId(@PathVariable String id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Tutor> criar(@RequestBody Tutor tutor) {
        Tutor tutorSalvo = service.salvar(tutor);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(tutorSalvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tutor> atualizar(@PathVariable String id, @RequestBody Tutor tutor) {
        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        tutor.setId(id);
        Tutor tutorAtualizado = service.salvar(tutor);
        return ResponseEntity.ok(tutorAtualizado);
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