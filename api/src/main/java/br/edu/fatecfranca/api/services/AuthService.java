package br.edu.fatecfranca.api.services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import br.edu.fatecfranca.api.dtos.AuthDtos.CadastroRequest;
import br.edu.fatecfranca.api.models.Tutor;

/**
 * Login e cadastro com e-mail + senha (BCrypt via {@link PasswordService}).
 * A coleção de tutores guarda TODAS as contas (tutores e dog walkers, com
 * roles:['walker']), então o login busca só nela.
 */
@Service
public class AuthService {

    private final TutorService tutorService;
    private final PasswordService passwordService;

    public AuthService(TutorService tutorService, PasswordService passwordService) {
        this.tutorService = tutorService;
        this.passwordService = passwordService;
    }

    public Tutor login(String email, String senha) {
        Tutor conta = tutorService.buscarPorEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos."));
        if (conta.getPasswordHash() == null || !passwordService.matches(senha, conta.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos.");
        }
        return conta;
    }

    public Tutor cadastrar(CadastroRequest request) {
        Tutor novo = new Tutor();
        novo.setName(request.name().trim());
        novo.setEmail(request.email().trim().toLowerCase());
        novo.setPassword(request.password());
        // Cadastro nasce como tutor; o perfil de dog walker é criado depois,
        // pelo próprio usuário ("Quero ser dog walker"), como no protótipo.
        novo.setRoles(new ArrayList<>(List.of("owner")));
        novo.setFavorites(new ArrayList<>());
        novo.setEmergencyContacts(new ArrayList<>());
        novo.setSettings(new Tutor.Settings(true, false, false));
        novo.setAddress(new Tutor.Address("", "", "", null, ""));
        novo.setCreatedAt(LocalDate.now().toString());
        return tutorService.salvar(novo);
    }
}
