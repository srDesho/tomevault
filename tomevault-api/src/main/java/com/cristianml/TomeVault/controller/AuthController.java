package com.cristianml.TomeVault.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping() // Base path for all endpoints in this controller.
public class AuthController {

    /**
     * Handles user login.
     * If this endpoint is reached, Spring Security has successfully authenticated
     * the user based on the 'Authorization' header (Basic Auth).
    */
    @PostMapping("/login")
    public ResponseEntity<String> login(Authentication authentication) {
        // User is already authenticated by Spring Security.
        // Returns a success confirmation to the frontend.
        return ResponseEntity.ok("Login exitoso para el usuario: " + authentication.getName());
    }
}
