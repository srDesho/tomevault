package com.cristianml.TomeVault.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/books")
public class BookController {

    @GetMapping
    public ResponseEntity<String> getBooks() {
        return ResponseEntity.ok("Lista de libros");
    }

    @PostMapping
    public ResponseEntity<String> addBook() {
        return ResponseEntity.ok("Libro agregado");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> editBook(@PathVariable Long id) {
        return ResponseEntity.ok("Libro editado con ID: " + id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBook(@PathVariable Long id) {
        return ResponseEntity.ok("Libro eliminado con ID: " + id);
    }

}
