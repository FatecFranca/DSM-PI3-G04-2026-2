package br.edu.fatecfranca.api.services;

import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import br.edu.fatecfranca.api.models.Walker;
import br.edu.fatecfranca.api.repositories.WalkerRepository;

@Service
public class WalkerService {

    private final WalkerRepository repository;
    private final PasswordService passwordService;

    public WalkerService(WalkerRepository repository, PasswordService passwordService) {
        this.repository = repository;
        this.passwordService = passwordService;
    }

    public List<Walker> listarTodos() {
        return repository.findAll();
    }

    public Optional<Walker> buscarPorId(String id) {
        return repository.findById(id);
    }

    public Optional<Walker> buscarPorEmail(String email) {
        return repository.findByEmail(email);
    }

    public Walker salvar(Walker walker) {
        verificarEmailUnico(walker);
        preservarEmail(walker);
        aplicarSenha(walker);
        return repository.save(walker);
    }

    public void excluir(String id) {
        repository.deleteById(id);
    }

    private void verificarEmailUnico(Walker walker) {
        if (walker.getEmail() == null || walker.getEmail().isBlank()) {
            return;
        }
        repository.findByEmail(walker.getEmail())
                .filter(outro -> !outro.getId().equals(walker.getId()))
                .ifPresent(outro -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma conta com este e-mail.");
                });
    }

    /** Faz o hash da senha nova; em atualização sem senha, preserva o hash existente. */
    private void aplicarSenha(Walker walker) {
        if (walker.getPassword() != null && !walker.getPassword().isBlank()) {
            walker.setPasswordHash(passwordService.encode(walker.getPassword()));
        } else if (walker.getId() != null) {
            repository.findById(walker.getId()).ifPresent(atual -> walker.setPasswordHash(atual.getPasswordHash()));
        }
        walker.setPassword(null);
    }

    /**
     * O front edita o perfil mandando o objeto local, que não carrega o e-mail da
     * conta — sem isto, um PUT zeraria o e-mail do documento.
     */
    private void preservarEmail(Walker walker) {
        if ((walker.getEmail() == null || walker.getEmail().isBlank()) && walker.getId() != null) {
            repository.findById(walker.getId()).ifPresent(atual -> walker.setEmail(atual.getEmail()));
        }
    }
}
