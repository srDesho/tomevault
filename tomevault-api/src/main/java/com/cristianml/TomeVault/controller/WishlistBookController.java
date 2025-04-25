package com.cristianml.TomeVault.controller;

import com.cristianml.TomeVault.dto.request.WishlistBookRequestDTO;
import com.cristianml.TomeVault.dto.response.BookResponseDTO;
import com.cristianml.TomeVault.dto.response.WishlistBookResponseDTO;
import com.cristianml.TomeVault.exception.ResourceNotFoundException;
import com.cristianml.TomeVault.security.config.CustomUserDetails;
import com.cristianml.TomeVault.service.IWishlistBookService;
import com.cristianml.TomeVault.utilities.Utilities;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing operations related to a user's book wishlist.
 */
@RestController
@RequestMapping("/wishlist-books")
@RequiredArgsConstructor
public class WishlistBookController {

    private final IWishlistBookService wishlistBookService;

    /**
     * Adds a book to the authenticated user's wishlist by importing its details from the Google Books API.
     */
    @PostMapping("/from-google/{googleBookId}")
    @PreAuthorize("isAuthenticated()") // Corregido: isAuthenticated()
    public ResponseEntity<WishlistBookResponseDTO> addToWishlistFromGoogle(
            @AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable("googleBookId") String googleBookId) { // ¡Cambio aquí!

        WishlistBookResponseDTO addedBook = this.wishlistBookService.addToWishlistFromGoogle(googleBookId, customUserDetails.getUserEntity()); // Accede a UserEntity
        return new ResponseEntity<>(addedBook, HttpStatus.CREATED);
    }

    /**
     * Moves a book from the wishlist to the user's main collection of read books.
     */
    @PostMapping("/move-to-books/{wishlistId}")
    @PreAuthorize("isAuthenticated()") // Corregido: isAuthenticated()
    public ResponseEntity<BookResponseDTO> moveToBookCollections(
            @AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable("wishlistId") Long id) { // ¡Cambio aquí!
        BookResponseDTO movedBook = this.wishlistBookService.moveToBooks(id, customUserDetails.getUserEntity()); // Accede a UserEntity
        return ResponseEntity.ok(movedBook);
    }

    /**
     * Retrieves a paginated list of wishlist books for the authenticated user.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<WishlistBookResponseDTO>> getWishlistByUser(
            @AuthenticationPrincipal CustomUserDetails customUserDetails, Pageable pageable) { // ¡Cambio aquí!
        Page<WishlistBookResponseDTO> wishlistBooks = this.wishlistBookService.getWishlistByUser(customUserDetails.getUserEntity(), pageable); // Accede a UserEntity
        return ResponseEntity.ok(wishlistBooks);
    }

    /**
     * Saves a new wishlist book based on a direct request DTO (manual entry).
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WishlistBookResponseDTO> saveWishlistBook(
            @AuthenticationPrincipal CustomUserDetails customUserDetails, @RequestBody WishlistBookRequestDTO requestDTO) { // ¡Cambio aquí!
        WishlistBookResponseDTO saved = this.wishlistBookService.saveWishlistBook(requestDTO, customUserDetails.getUserEntity()); // Accede a UserEntity
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /**
     * Deletes a specific wishlist book, handling various exceptions.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Object> deleteWishlistBook(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable("id") Long id) { // ¡Cambio aquí!
        try {
            this.wishlistBookService.deleteBook(id, customUserDetails.getUserEntity()); // Accede a UserEntity
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
     * Updates an existing wishlist book for the authenticated user.
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WishlistBookResponseDTO> updatedBook(@AuthenticationPrincipal CustomUserDetails customUserDetails, // ¡Cambio aquí!
                                                               @PathVariable("id") Long id,
                                                               @RequestBody WishlistBookRequestDTO requestDTO) {
        WishlistBookResponseDTO updated = this.wishlistBookService.updateBook(id, requestDTO, customUserDetails.getUserEntity()); // Accede a UserEntity
        return ResponseEntity.ok(updated);
    }
}
