package br.edu.fatecfranca.api.controllers;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.edu.fatecfranca.api.models.Pet;
import br.edu.fatecfranca.api.services.PetService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/pets")
public class PetController {
    
    private final PetService service;

    public PetController(PetService service) {
        this.service = service;
    }

    @GetMapping
    public List<Pet> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pet> buscarPorId(@PathVariable String id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tutor/{tutorId}")
    public List<Pet> listarPorTutor(@PathVariable String tutorId) {
        return service.listarPorTutor(tutorId);
    }
    @PostMapping
    public ResponseEntity<Pet> criar(@Valid @RequestBody Pet pet) {
        Pet petSalvo = service.salvar(pet);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(petSalvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pet> atualizar(@PathVariable String id, @Valid @RequestBody Pet pet) {
        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        pet.setId(id);
        Pet petAtualizado = service.salvar(pet);
        return ResponseEntity.ok(petAtualizado);
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