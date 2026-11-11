package br.edu.fatecfranca.api.services;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import br.edu.fatecfranca.api.models.Walker;
import br.edu.fatecfranca.api.repositories.WalkerRepository;

@Service
public class WalkerService {
    
    private final WalkerRepository repository;

    public WalkerService(WalkerRepository repository) {
        this.repository = repository;
    }

    public List<Walker> listarTodos() {
        return repository.findAll();
    }

    public Optional<Walker> buscarPorId(String id) {
        return repository.findById(id);
    }

    public Walker salvar(Walker walker) {
        return repository.save(walker);
    }

    public void excluir(String id) {
        repository.deleteById(id);
    }
}