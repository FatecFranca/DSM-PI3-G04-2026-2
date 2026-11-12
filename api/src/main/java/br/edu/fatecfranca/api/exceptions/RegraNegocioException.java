package br.edu.fatecfranca.api.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Erro de regra de negócio com mensagem pronta para o usuário (pt-BR) e,
 * opcionalmente, o campo do formulário responsável — espelha o BookingError do
 * front, que usa `field` para mostrar o erro no lugar certo.
 */
public class RegraNegocioException extends RuntimeException {

    private final HttpStatus status;
    private final String field;

    public RegraNegocioException(HttpStatus status, String message, String field) {
        super(message);
        this.status = status;
        this.field = field;
    }

    public RegraNegocioException(HttpStatus status, String message) {
        this(status, message, null);
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getField() {
        return field;
    }
}
