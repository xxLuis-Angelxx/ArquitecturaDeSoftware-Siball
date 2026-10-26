package com.epiis.Siball.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> datosInvalidos(IllegalArgumentException ex) {
        return respuesta(HttpStatus.BAD_REQUEST, mensajeSeguro(ex, "Solicitud inválida"));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> conflictoDeEstado(IllegalStateException ex) {
        return respuesta(HttpStatus.CONFLICT, mensajeSeguro(ex, "La operación no se puede completar"));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> conflictoDeDatos(DataIntegrityViolationException ex) {
        return respuesta(HttpStatus.CONFLICT, "Existe un registro duplicado o una relación no válida");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validacion(MethodArgumentNotValidException ex) {
        String mensaje = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + ": valor obligatorio o inválido")
                .orElse("La solicitud contiene datos inválidos");
        return respuesta(HttpStatus.BAD_REQUEST, mensaje);
    }

    private ResponseEntity<Map<String, String>> respuesta(HttpStatus estado, String mensaje) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("mensaje", mensaje);
        return ResponseEntity.status(estado).body(body);
    }

    private String mensajeSeguro(RuntimeException ex, String alternativa) {
        String mensaje = ex.getMessage();
        return mensaje == null || mensaje.isBlank() ? alternativa : mensaje;
    }
}
