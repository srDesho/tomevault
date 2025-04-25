package com.cristianml.TomeVault.service.impl;

import com.cristianml.TomeVault.dto.google.GoogleBookItem;
import com.cristianml.TomeVault.dto.request.BookRequestDTO;
import com.cristianml.TomeVault.dto.request.WishlistBookRequestDTO;
import com.cristianml.TomeVault.dto.response.BookResponseDTO;
import com.cristianml.TomeVault.dto.response.WishlistBookResponseDTO;
import com.cristianml.TomeVault.entity.BookEntity;
import com.cristianml.TomeVault.entity.UserEntity;
import com.cristianml.TomeVault.entity.WishlistBookEntity;
import com.cristianml.TomeVault.exception.BookAlreadyExistsException;
import com.cristianml.TomeVault.exception.ResourceNotFoundException;
import com.cristianml.TomeVault.mapper.BookMapper;
import com.cristianml.TomeVault.mapper.WishlistBookMapper;
import com.cristianml.TomeVault.repository.BookRepository;
import com.cristianml.TomeVault.repository.WishlistBookRepository;
import com.cristianml.TomeVault.service.IGoogleBooksIntegrationService;
import com.cristianml.TomeVault.service.IWishlistBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for managing user wishlist operations, including Google Books API integration.
 */
@Service
@RequiredArgsConstructor
public class WishlistBookServiceImpl implements IWishlistBookService { // Assumed IWishlistService is the interface

    private final IGoogleBooksIntegrationService googleBooksIntegrationService; // Handles Google Books API calls.
    private final WishlistBookRepository wishlistBookRepository; // Manages wishlist data persistence.
    private final WishlistBookMapper wishlistBookMapper; // Converts between wishlist DTOs and entities.
    private final BookRepository bookRepository; // Used for checks against the main book collection.
    private final BookMapper bookMapper; // Used for mapping when moving books to the main collection.

    /**
     * Adds a book to the user's wishlist by fetching details from Google Books.
     */
    @Override
    @Transactional // Ensures atomicity for database operations.
    public WishlistBookResponseDTO addToWishlistFromGoogle(String googleBookId, UserEntity user) {
        // Prevents adding duplicates to the wishlist.
        if (wishlistBookRepository.existsByGoogleBookIdAndUser(googleBookId, user)) {
            throw new BookAlreadyExistsException("Book with ID " + googleBookId + " already exists in your collection");
        }

        // Prevents adding to wishlist if already present in the main book collection.
        if (bookRepository.existsByGoogleBookIdAndUser(googleBookId, user)) {
            throw new BookAlreadyExistsException("Book with ID " + googleBookId + " already exists in your collection");
        }

        GoogleBookItem googleBook = this.googleBooksIntegrationService.getBookById(googleBookId); // Fetches book data from Google.
        WishlistBookEntity wishlistBook = wishlistBookMapper.toEntity(googleBook); // Maps Google DTO to wishlist entity.
        wishlistBook.setUser(user); // Sets the book owner.

        return wishlistBookMapper.toResponseDTO(wishlistBookRepository.save(wishlistBook)); // Saves and returns DTO.
    }

    /**
     * Moves a book from the wishlist to the main book collection.
     */
    @Override
    @Transactional // Ensures atomicity for database operations.
    public BookResponseDTO moveToBooks(Long wishlistId, UserEntity user) {
        WishlistBookEntity wishlistBook = this.wishlistBookRepository.findByIdAndUser(wishlistId, user)
                // Throws if wishlist item not found or unauthorized.
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found"));

        BookEntity book = new BookEntity(); // Creates a new BookEntity.
        // Transfers relevant data from the wishlist item to the new book.
        book.setGoogleBookId(wishlistBook.getGoogleBookId());
        book.setTitle(wishlistBook.getTitle());
        book.setAuthor(wishlistBook.getAuthor());
        book.setDescription(wishlistBook.getDescription());
        book.setThumbnail(wishlistBook.getThumbnail());
        book.setTags(wishlistBook.getTags());
        book.setUser(user);

        BookEntity savedBook = bookRepository.save(book); // Saves the new book to the main collection.
        wishlistBookRepository.delete(wishlistBook); // Deletes the item from the wishlist.
        return this.bookMapper.toResponseDTO(savedBook); // Returns the newly created book DTO.
    }

    /**
     * Retrieves a paginated list of wishlist books for a specific user.
     */
    @Override
    public Page<WishlistBookResponseDTO> getWishlistByUser(UserEntity userEntity, Pageable pageable) {
        Page<WishlistBookEntity> wishlistBooks = this.wishlistBookRepository.findAllByUser(userEntity, pageable);
        return wishlistBooks.map(wishlistBookMapper::toResponseDTO); // Maps entities to response DTOs.
    }

    /**
     * Saves a new wishlist book from a request DTO.
     */
    @Override
    @Transactional // Ensures atomicity for database operations.
    public WishlistBookResponseDTO saveWishlistBook(WishlistBookRequestDTO wishlistBookRequestDTO, UserEntity userEntity) {

        validateWishlistRequest(wishlistBookRequestDTO); // Validates the incoming request data.

        WishlistBookEntity book = this.wishlistBookMapper.toEntity(wishlistBookRequestDTO); // Maps request DTO to entity.
        book.setUser(userEntity); // Sets the book owner.
        WishlistBookEntity saved = this.wishlistBookRepository.save(book); // Saves the entity.
        return this.wishlistBookMapper.toResponseDTO(saved); // Returns the saved book as DTO.
    }

    /**
     * Deletes a wishlist book by its ID, ensuring user ownership.
     */
    @Override
    @Transactional // Ensures atomicity for database operations.
    public void deleteBook(Long bookId, UserEntity userEntity) {
        WishlistBookEntity delete = wishlistBookRepository.findByIdAndUser(bookId, userEntity)
                // Throws error if book not found or unauthorized.
                .orElseThrow(() -> new ResourceNotFoundException("Book not found or does not belong to the user."));
        this.wishlistBookRepository.delete(delete); // Deletes the wishlist item.
    }

    /**
     * Updates an existing wishlist book's details.
     */
    @Override
    public WishlistBookResponseDTO updateBook(Long bookId, WishlistBookRequestDTO bookRequestDTO, UserEntity userEntity) {
        WishlistBookEntity existing = this.wishlistBookRepository.findByIdAndUser(bookId, userEntity)
                // Throws error if book not found or unauthorized.
                .orElseThrow(() -> new RuntimeException("Book not found or does not belong to the user."));
        // Updates specific fields of the existing wishlist entity from the request DTO.
        existing.setTitle(bookRequestDTO.getTitle());
        existing.setAuthor(bookRequestDTO.getAuthor());
        existing.setDescription(bookRequestDTO.getDescription());
        existing.setThumbnail(bookRequestDTO.getThumbnail());
        // Saves the updated entity.
        WishlistBookEntity updated = this.wishlistBookRepository.save(existing);
        return wishlistBookMapper.toResponseDTO(updated); // Returns the updated book as DTO.
    }

    /**
     * Private helper method for validating incoming wishlist request data.
     */
    private void validateWishlistRequest(WishlistBookRequestDTO request) {
        // Ensures the title field is not null or empty.
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Tittle can't be empty.");
        }
    }
}
