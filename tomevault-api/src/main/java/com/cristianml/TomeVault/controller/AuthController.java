package com.cristianml.TomeVault.controller;

import com.cristianml.TomeVault.dto.request.UserRegistrationRequestDTO;
import com.cristianml.TomeVault.security.dto.AuthLoginRequest;
import com.cristianml.TomeVault.security.dto.AuthResponse;
import com.cristianml.TomeVault.service.impl.AuthServiceImpl;
import com.cristianml.TomeVault.service.IAuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
