package com.cristianml.TomeVault.controllers;

import com.cristianml.TomeVault.dtos.requests.UserRegistrationRequestDTO;
import com.cristianml.TomeVault.security.dtos.AuthLoginRequest;
import com.cristianml.TomeVault.security.dtos.AuthResponse;
import com.cristianml.TomeVault.services.IAuthService;
import com.cristianml.TomeVault.services.impl.AuthServiceImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for user authentication and registration.
 * Provides endpoints for logging in and signing up, returning JWTs upon success.
 */

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final IAuthService authService;

    public AuthController(AuthServiceImpl authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid AuthLoginRequest userRequest) {
        AuthResponse authResponse = this.authService.loginUser(userRequest);
        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }

    @PostMapping("/sign-up")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid UserRegistrationRequestDTO userRequestDTO) {
        AuthResponse authResponse = this.authService.registerUser(userRequestDTO);
        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }
}
