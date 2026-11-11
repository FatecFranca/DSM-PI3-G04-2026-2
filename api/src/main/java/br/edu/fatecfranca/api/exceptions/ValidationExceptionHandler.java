package br.edu.fatecfranca.api.exceptions;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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
}