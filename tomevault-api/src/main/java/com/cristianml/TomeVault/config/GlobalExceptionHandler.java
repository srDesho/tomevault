package com.cristianml.TomeVault.config;

import com.cristianml.TomeVault.exceptions.AccessDeniedException;
import com.cristianml.TomeVault.exceptions.AccountDeletedException;
import com.cristianml.TomeVault.exceptions.AccountDisabledException;
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
}