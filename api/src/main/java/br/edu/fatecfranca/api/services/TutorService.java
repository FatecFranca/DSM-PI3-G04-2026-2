package br.edu.fatecfranca.api.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import br.edu.fatecfranca.api.models.Tutor;
import br.edu.fatecfranca.api.repositories.TutorRepository;
import br.edu.fatecfranca.api.repositories.WalkerRepository;

@Service
public class TutorService {

    private final TutorRepository repository;
    private final WalkerRepository walkerRepository;
    private final PasswordService passwordService;

    public TutorService(TutorRepository repository, WalkerRepository walkerRepository, PasswordService passwordService) {
        this.repository = repository;
        this.walkerRepository = walkerRepository;
        this.passwordService = passwordService;
    }

    public List<Tutor> listarTodos() {
        return repository.findAll();
    }

    public Optional<Tutor> buscarPorId(String id) {
        return repository.findById(id);
    }

    public Optional<Tutor> buscarPorEmail(String email) {
        return repository.findByEmail(email);
    }

    public Tutor salvar(Tutor tutor) {
        verificarEmailUnico(tutor);
        aplicarSenha(tutor);
        return repository.save(tutor);
    }

    /** Liga/desliga um walker na lista de favoritos do usuário. */
    public Tutor alternarFavorito(String id, String walkerId) {
        Tutor tutor = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutor não encontrado."));
        if (!walkerRepository.existsById(walkerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Walker não encontrado.");
        }
        List<String> favoritos = new ArrayList<>(tutor.getFavorites() == null ? List.of() : tutor.getFavorites());
        if (!favoritos.remove(walkerId)) {
            favoritos.add(0, walkerId);
        }
        tutor.setFavorites(favoritos);
        return repository.save(tutor);
    }

    public void excluir(String id) {
        repository.deleteById(id);
    }

    private void verificarEmailUnico(Tutor tutor) {
        if (tutor.getEmail() == null || tutor.getEmail().isBlank()) {
            return;
        }
        repository.findByEmail(tutor.getEmail())
                .filter(outro -> !outro.getId().equals(tutor.getId()))
                .ifPresent(outro -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma conta com este e-mail.");
                });
    }

    /** Faz o hash da senha nova; em atualização sem senha, preserva o hash existente. */
    private void aplicarSenha(Tutor tutor) {
        if (tutor.getPassword() != null && !tutor.getPassword().isBlank()) {
            tutor.setPasswordHash(passwordService.encode(tutor.getPassword()));
        } else if (tutor.getId() != null) {
            repository.findById(tutor.getId()).ifPresent(atual -> tutor.setPasswordHash(atual.getPasswordHash()));
        }
        tutor.setPassword(null);
    }
}
