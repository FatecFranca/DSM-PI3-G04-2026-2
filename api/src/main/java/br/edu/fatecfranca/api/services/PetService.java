package br.edu.fatecfranca.api.services;

import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import br.edu.fatecfranca.api.models.Pet;
import br.edu.fatecfranca.api.repositories.PetRepository;
import br.edu.fatecfranca.api.repositories.TutorRepository;

@Service
public class PetService {
    
    private final PetRepository repository;
    private final TutorRepository tutorRepository;

    public PetService(PetRepository repository, TutorRepository tutorRepository) {
        this.repository = repository;
        this.tutorRepository = tutorRepository;
    }

    private void verificarTutor(String tutorId) {
        if (tutorId == null || tutorId.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                "O identificador do tutor é obrigatório."
            );
        }
        if (!tutorRepository.existsById(tutorId)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, 
                "Tutor não encontrado."
            );
        }
    }

    public List<Pet> listarTodos() {
        return repository.findAll();
    }

    public Optional<Pet> buscarPorId(String id) {
        return repository.findById(id);
    }

    public List<Pet> listarPorTutor(String tutorId) {
        verificarTutor(tutorId);
        return repository.findByTutorId(tutorId);
    }

    public Pet salvar(Pet pet) {
        verificarTutor(pet.getTutorId());
        return repository.save(pet);
    }

    public void excluir(String id) {
        repository.deleteById(id);
    }
}