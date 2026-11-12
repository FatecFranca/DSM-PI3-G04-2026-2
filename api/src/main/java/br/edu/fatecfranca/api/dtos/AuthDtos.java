package br.edu.fatecfranca.api.dtos;

import br.edu.fatecfranca.api.models.Tutor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Contratos de autenticação. A senha viaja em texto puro só aqui (HTTPS na
 * produção); o que é armazenado é o hash BCrypt.
 */
public final class AuthDtos {

    public record LoginRequest(
            @NotBlank(message = "O e-mail é obrigatório.")
            @Email(message = "O e-mail informado é inválido.")
            String email,

            @NotBlank(message = "A senha é obrigatória.")
            String senha) {
    }

    public record CadastroRequest(
            @NotBlank(message = "O nome é obrigatório.")
            @Size(min = 3, message = "Informe seu nome completo.")
            String name,

            @NotBlank(message = "O e-mail é obrigatório.")
            @Email(message = "O e-mail informado é inválido.")
            String email,

            @NotBlank(message = "A senha é obrigatória.")
            @Size(min = 6, message = "A senha precisa ter pelo menos 6 caracteres.")
            String password) {
    }

    public record AuthResponse(Tutor user) {
    }

    private AuthDtos() {
    }
}
