package com.cristianml.TomeVault.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping
    public ResponseEntity<String> getUsers() {
        return ResponseEntity.ok("Lista de usuarios");
    }

    @PostMapping
    public ResponseEntity<String> addUser() {
        return ResponseEntity.ok("Usuario agregado");
    }

}
