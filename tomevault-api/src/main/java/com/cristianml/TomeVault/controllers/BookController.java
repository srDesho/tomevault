package com.cristianml.TomeVault.controllers;

import com.cristianml.TomeVault.dtos.requests.BookRequestDTO;
import com.cristianml.TomeVault.dtos.responses.BookResponseDTO;
import com.cristianml.TomeVault.exceptions.ResourceNotFoundException;
import com.cristianml.TomeVault.repositories.BookRepository;
import com.cristianml.TomeVault.security.config.CustomUserDetails;
import com.cristianml.TomeVault.services.IBookService;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {

    private final IBookService bookService;
    private final BookRepository bookRepository;

    // Get book details by its Google Book ID (String) for the authenticated user.
    @GetMapping("/{googleBookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookResponseDTO> getBookByGoogleId(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                             @PathVariable("googleBookId") String googleBookId) {
        BookResponseDTO book = this.bookService.getBookByGoogleIdForUser(googleBookId, customUserDetails.getUserEntity());
        return ResponseEntity.ok(book);
    }

    // Get book details directly from Google Books API (public access).
    @GetMapping("/google-api/{googleBookId}")
    public ResponseEntity<BookResponseDTO> getBookFromGoogleApi(@PathVariable("googleBookId") String googleBookId) {
        return ResponseEntity.ok(this.bookService.getBookFromGoogleBookApi(googleBookId));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<BookResponseDTO>> getBooks(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                          Pageable pageable) {
        Page<BookResponseDTO> books = this.bookService.getBooksByUser(customUserDetails.getUserEntity(), pageable);
        return ResponseEntity.ok(books);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponseDTO> addBook(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                   @RequestBody BookRequestDTO bookRequestDTO) {
        BookResponseDTO saved = this.bookService.saveBook(bookRequestDTO, customUserDetails.getUserEntity());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Object> deleteBook(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                             @PathVariable("id") Long id) {
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

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADD_BOOK')")
    public ResponseEntity<BookResponseDTO> updateBook(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                      @RequestBody BookRequestDTO requestDTO,
                                                      @PathVariable("id") Long id) {
        BookResponseDTO updatedBook = this.bookService.updateBook(id, requestDTO, customUserDetails.getUserEntity());
        return ResponseEntity.ok(updatedBook);
    }

    @PostMapping("/from-google/{googleBookId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'SUPER_ADMIN')")
    public ResponseEntity<BookResponseDTO> saveBookFromGoogle(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                              @PathVariable("googleBookId") String googleBookId) {
        BookResponseDTO savedBook = this.bookService.saveBookFromGoogle(googleBookId, customUserDetails.getUserEntity());
        return ResponseEntity.ok(savedBook);
    }

    @GetMapping("/search-google")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<BookResponseDTO>> searchBooksFromGoogle(@RequestParam String query) {
        List<BookResponseDTO> searchResults = bookService.searchBooksFromGoogle(query);
        return ResponseEntity.ok(searchResults);
    }

    @PostMapping("/increment-read/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookResponseDTO> incrementBookReadCount(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long bookId) {
        try {
            BookResponseDTO updatedBook = this.bookService.incrementBookReadCount(bookId, customUserDetails.getUserEntity());
            return ResponseEntity.ok(updatedBook);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Decrement read count
    @PostMapping("/decrement-read/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookResponseDTO> decrementBookReadCount(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long bookId) {
        BookResponseDTO updatedBook = this.bookService.decrementBookReadCount(bookId, customUserDetails.getUserEntity());
        return ResponseEntity.ok(updatedBook);
    }

    // Reactivate book
    @PostMapping("activate/{googleBookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookResponseDTO> activateBook(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable("googleBookId") String googleBookId,
            @RequestBody(required = false) Map<String, Object> request) {

        boolean keepProgress = true; // Por defecto mantener progreso
        if (request != null && request.containsKey("keepProgress")) {
            Object value = request.get("keepProgress");
            if (value instanceof Boolean) {
                keepProgress = (Boolean) value;
            } else if (value instanceof String) {
                keepProgress = Boolean.parseBoolean((String) value);
            }
        }

        try {
            BookResponseDTO bookResponseDTO = this.bookService.activateBook(
                    googleBookId,
                    customUserDetails.getUserEntity(),
                    keepProgress
            );
            return ResponseEntity.ok(bookResponseDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/status/{googleBookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getBookStatus(
        @AuthenticationPrincipal CustomUserDetails customUserDetails,
        @PathVariable("googleBookId") String googleBookId) {

        // Busca si existe activo
        boolean existsActive = bookRepository.existsByGoogleBookIdAndUserAndIsActiveTrue(googleBookId, customUserDetails.getUserEntity());

        // Busca si existe inactivo (eliminado)
        boolean existsInactive = bookRepository.existsByGoogleBookIdAndUserAndIsActiveFalse(googleBookId, customUserDetails.getUserEntity());

        Map<String, Object> response = new HashMap<>();
        response.put("existsActive", existsActive);
        response.put("existsInactive", existsInactive);

        if (existsActive) {
            response.put("message", "El libro ya está en tu colección.");
        } else if (existsInactive) {
            response.put("message", "El libro fue eliminado anteriormente.");
        } else {
            response.put("message", "El libro no existe en tu colección.");
        }

        return ResponseEntity.ok(response);
    }
}