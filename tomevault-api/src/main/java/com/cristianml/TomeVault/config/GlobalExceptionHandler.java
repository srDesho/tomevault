package com.cristianml.TomeVault.config;

import com.cristianml.TomeVault.exceptions.AccountDeletedException;
import com.cristianml.TomeVault.exceptions.AccountDisabledException;
import org.apache.logging.log4j.util.Strings;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Credenciales inválidas. Por favor, inténtelo de nuevo.");
        error.put("errorCode", "invalid_credentials");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(AccountDisabledException.class)
    public ResponseEntity<Map<String, String>> handleAccountDisabled(AccountDisabledException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Tu cuenta está desactivada. Contacta al administrador.");
        error.put("errorCode", "account_disabled");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(AccountDeletedException.class)
    public ResponseEntity<Map<String, String>> handleAccountDeleted(AccountDeletedException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Tu cuenta ha sido eliminada.");
        error.put("errorCode", "account_deleted");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
