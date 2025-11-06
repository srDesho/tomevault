package com.cristianml.TomeVault.config;

import com.cristianml.TomeVault.exceptions.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles invalid login credentials - wrong username or password
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Credenciales inválidas. Por favor, inténtelo de nuevo.");
        error.put("errorCode", "invalid_credentials");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // Handles login attempts with disabled accounts
    @ExceptionHandler(AccountDisabledException.class)
    public ResponseEntity<Map<String, String>> handleAccountDisabled(AccountDisabledException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Tu cuenta está desactivada. Contacta al administrador.");
        error.put("errorCode", "account_disabled");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // Handles login attempts with deleted accounts
    @ExceptionHandler(AccountDeletedException.class)
    public ResponseEntity<Map<String, String>> handleAccountDeleted(AccountDeletedException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Tu cuenta ha sido eliminada.");
        error.put("errorCode", "account_deleted");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // Handles illegal arguments in requests - validation errors
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Handles access denied scenarios - user lacks required permissions
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        error.put("errorCode", "access_denied");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    // Handles demo user exceeded limit.
    @ExceptionHandler(DemoLimitExceededException.class)
    public ResponseEntity<Map<String, String>> handleDemoLimitExceeded(DemoLimitExceededException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Handles email or username in use.
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {

        Map<String, String> error = new HashMap<>();

        String message = "Error de integridad de datos";

        // Detect specific unique constraint violations
        String causeMessage = ex.getMostSpecificCause().getMessage().toLowerCase();

        if (causeMessage.contains("username")) {
            message = "El nombre de usuario ya está en uso.";
        } else if (causeMessage.contains("email")) {
            message = "El correo electrónico ya está registrado.";
        }

        error.put("message", message);
        error.put("errorCode", "data_integrity_violation");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}