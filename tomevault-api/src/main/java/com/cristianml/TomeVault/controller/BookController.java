package com.cristianml.TomeVault.controller;

import com.cristianml.TomeVault.dto.request.BookRequestDTO;
import com.cristianml.TomeVault.dto.response.BookResponseDTO;
import com.cristianml.TomeVault.exception.ResourceNotFoundException;
import com.cristianml.TomeVault.security.config.CustomUserDetails;
import com.cristianml.TomeVault.service.IBookService;
import com.cristianml.TomeVault.utilities.Utilities;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * REST controller for managing book-related operations.
 */
@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {

    private final IBookService bookService;

    /**
     * Retrieves a paginated list of books owned by the authenticated user.
     */
    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<Page<BookResponseDTO>> getBooks(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                          Pageable pageable) {
        Page<BookResponseDTO> books = this.bookService.getBooksByUser(customUserDetails.getUserEntity(), pageable);
        return ResponseEntity.ok(books);
    }

    /**
     * Adds a new book to the system for the authenticated user.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponseDTO> addBook(@AuthenticationPrincipal CustomUserDetails customUserDetails, @RequestBody BookRequestDTO bookRequestDTO) {
        BookResponseDTO saved = this.bookService.saveBook(bookRequestDTO, customUserDetails.getUserEntity());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).body(saved);
    }

    /**
     * Deletes a specific book, ensuring user ownership and handling various exceptions.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Object> deleteBook(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable("id") Long id) {
        try {
            this.bookService.deleteBook(id, customUserDetails.getUserEntity());
            return Utilities.generateResponse(HttpStatus.OK, "Book deleted successfully.");
        } catch (ResourceNotFoundException e) {
            return Utilities.generateResponse(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (RuntimeException e) {
            return Utilities.generateResponse(HttpStatus.BAD_REQUEST, "Failed to delete book." + e.getMessage());
        } catch (Exception e) {
            return Utilities.generateResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred during deletion.");
        }
    }

    /**
     * Updates an existing book for the authenticated user.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADD_BOOK')")
    public ResponseEntity<BookResponseDTO> updateBook(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                      @RequestBody BookRequestDTO requestDTO, @PathVariable("id") Long id) {
        BookResponseDTO updatedBook = this.bookService.updateBook(id, requestDTO, customUserDetails.getUserEntity());
        return ResponseEntity.ok(updatedBook);
    }

    /**
     * Saves a book to the user's collection by importing its details from Google Books using its Google Book ID.
     */
    @PostMapping("/from-google/{googleBookId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<BookResponseDTO> saveBookFromGoogle(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                              @PathVariable("googleBookId") String googleBookId) {
        BookResponseDTO savedBook = this.bookService.saveBookFromGoogle(googleBookId, customUserDetails.getUserEntity());
        return ResponseEntity.ok(savedBook);
    }

    /**
     * Searches for books using the Google Books API based on a query string.
     */
    @GetMapping("/search-google")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookResponseDTO>> searchBooksFromGoogle(@RequestParam String query) {
        List<BookResponseDTO> searchResults = bookService.searchBooksFromGoogle(query);
        return ResponseEntity.ok(searchResults);
    }
}
