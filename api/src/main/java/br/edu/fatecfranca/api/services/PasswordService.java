package br.edu.fatecfranca.api.services;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Hash de senha (BCrypt). Usado no salvamento de contas e, na Fase 2, no login.
 */
@Service
public class PasswordService {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public String encode(String senha) {
        return encoder.encode(senha);
    }

    public boolean matches(String senha, String hash) {
        return encoder.matches(senha, hash);
    }
}
