package br.edu.fatecfranca.api.exceptions;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ValidationExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, List<String>>> tratarValidacao(
            MethodArgumentNotValidException exception) {
        
        Map<String, List<String>> erros = new LinkedHashMap<>();
        
        for (var erro : exception.getBindingResult().getFieldErrors()) {
            String campo = erro.getField();
            if (!erros.containsKey(campo)) {
                erros.put(campo, new ArrayList<>());
            }
            erros.get(campo).add(erro.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(erros);
    }

    /** Faz a mensagem da exceção chegar ao front (o padrão do Boot omite o motivo). */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> tratarStatus(ResponseStatusException exception) {
        String motivo = exception.getReason() != null
                ? exception.getReason()
                : exception.getBody().getDetail();
        return ResponseEntity.status(exception.getStatusCode())
                .body(Map.of("message", motivo));
    }

    /** Regra de negócio: {"message": "...", "field": "time"}. */
    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<Map<String, String>> tratarRegraNegocio(RegraNegocioException exception) {
        if (exception.getField() == null) {
            return ResponseEntity.status(exception.getStatus())
                    .body(Map.of("message", exception.getMessage()));
        }
        return ResponseEntity.status(exception.getStatus())
                .body(Map.of("message", exception.getMessage(), "field", exception.getField()));
    }
}