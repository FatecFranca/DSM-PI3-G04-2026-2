package br.edu.fatecfranca.api.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.edu.fatecfranca.api.dtos.AuthDtos;
import br.edu.fatecfranca.api.services.AuthService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return new AuthDtos.AuthResponse(service.login(request.email(), request.senha()));
    }

    @PostMapping("/cadastro")
    public ResponseEntity<AuthDtos.AuthResponse> cadastrar(@Valid @RequestBody AuthDtos.CadastroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthDtos.AuthResponse(service.cadastrar(request)));
    }
}
