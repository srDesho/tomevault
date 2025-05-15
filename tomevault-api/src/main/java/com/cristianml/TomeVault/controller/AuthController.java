package com.cristianml.TomeVault.controller;

import com.cristianml.TomeVault.security.dto.AuthCreateUserRequest;
import com.cristianml.TomeVault.security.dto.AuthLoginRequest;
import com.cristianml.TomeVault.security.dto.AuthResponse;
import com.cristianml.TomeVault.security.service.UserDetailsServiceImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for user authentication and registration.
 * Provides endpoints for logging in and signing up, returning JWTs upon success.
 */

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserDetailsServiceImpl userDetailsService;

    public AuthController(UserDetailsServiceImpl userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid AuthLoginRequest userRequest) {
        AuthResponse authResponse = this.userDetailsService.loginUser(userRequest);
        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }

    @PostMapping("/sign-up")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid AuthCreateUserRequest authCreateUser) {
        AuthResponse authResponse = this.userDetailsService.createUser(authCreateUser);
        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }
}
