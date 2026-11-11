package br.edu.fatecfranca.api.services;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import br.edu.fatecfranca.api.models.Tutor;
import br.edu.fatecfranca.api.repositories.TutorRepository;

@Service
public class TutorService {
    private final TutorRepository repository;

    public TutorService(TutorRepository repository) {
        this.repository = repository;
    }

    public List<Tutor> listarTodos() {
        return repository.findAll();
    }

    public Optional<Tutor> buscarPorId(String id) {
        return repository.findById(id);
    }

    public Tutor salvar(Tutor tutor) {
        return repository.save(tutor);
    }

    public void excluir(String id) {
        repository.deleteById(id);
    }
}