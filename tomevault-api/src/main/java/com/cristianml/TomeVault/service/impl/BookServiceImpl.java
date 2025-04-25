package com.cristianml.TomeVault.service.impl;

import com.cristianml.TomeVault.dto.google.GoogleBookItem;
import com.cristianml.TomeVault.dto.request.BookRequestDTO;
import com.cristianml.TomeVault.dto.response.BookResponseDTO;
import com.cristianml.TomeVault.entity.BookEntity;
import com.cristianml.TomeVault.entity.UserEntity;
import com.cristianml.TomeVault.exception.BookAlreadyExistsException;
import com.cristianml.TomeVault.exception.ResourceNotFoundException;
import com.cristianml.TomeVault.mapper.BookMapper;
import com.cristianml.TomeVault.repository.BookRepository;
import com.cristianml.TomeVault.service.IBookService;
import com.cristianml.TomeVault.service.IGoogleBooksIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Manages user book operations, including Google Books API integration.
 */
@Service
@RequiredArgsConstructor
public class BookServiceImpl implements IBookService {

    private final BookRepository bookRepository; // Handles database interactions for books.
    private final BookMapper bookMapper; // Converts between DTOs and entities.
    private final IGoogleBooksIntegrationService googleBooksIntegrationService; // Integrates with Google Books API.

    /**
     * Retrieves a paginated list of books owned by a user.
     */
    @Override
    public Page<BookResponseDTO> getBooksByUser(UserEntity userEntity, Pageable pageable) {
        Page<BookEntity> books = this.bookRepository.findAllByUser(userEntity, pageable);
        return books.map(bookMapper::toResponseDTO);
    }

    /**
     * Saves a new book based on provided DTO.
     */
    @Override
    @Transactional
    public BookResponseDTO saveBook(BookRequestDTO bookRequestDTO, UserEntity userEntity) {
        BookEntity bookEntity = this.bookMapper.toEntity(bookRequestDTO);
        bookEntity.setUser(userEntity);
        BookEntity saved = this.bookRepository.save(bookEntity);
        return bookMapper.toResponseDTO(saved);
    }

    /**
     * Deletes a specific book, ensuring user ownership.
     */
    @Override
    @Transactional
    public void deleteBook(Long bookId, UserEntity userEntity) {
        BookEntity delete = bookRepository.findByIdAndUser(bookId, userEntity)
                // Throws error if book not found or unauthorized.
                .orElseThrow(() -> new ResourceNotFoundException("Book not found or does not belong to the user."));
        this.bookRepository.delete(delete);
    }

    /**
     * Updates an existing book's details.
     */
    @Override
    @Transactional
    public BookResponseDTO updateBook(Long bookId, BookRequestDTO bookRequestDTO, UserEntity userEntity) {
        BookEntity existing = this.bookRepository.findByIdAndUser(bookId, userEntity)
                // Throws error if book not found or unauthorized.
                .orElseThrow(() -> new RuntimeException("Book not found or does not belong to the user."));
        // Update fields directly from DTO.
        existing.setTitle(bookRequestDTO.getTitle());
        existing.setAuthor(bookRequestDTO.getAuthor());
        existing.setDescription(bookRequestDTO.getDescription());
        existing.setThumbnail(bookRequestDTO.getThumbnail());
        existing.setAddedAt(bookRequestDTO.getAddedAt());
        existing.setFinishedAt(bookRequestDTO.getFinishedAt());
        // Saves updated entity.
        BookEntity updated = this.bookRepository.save(existing);
        return bookMapper.toResponseDTO(updated);
    }

    /**
     * Saves a book imported from Google Books API.
     */
    @Override
    @Transactional
    public BookResponseDTO saveBookFromGoogle(String googleBookId, UserEntity user) {
        // Checks if book already exists for the user.
        if (bookRepository.existsByGoogleBookIdAndUser(googleBookId, user)) {
            throw new BookAlreadyExistsException("Book with ID " + googleBookId + " already exists in your collection");
        }

        GoogleBookItem googleBook = this.googleBooksIntegrationService.getBookById(googleBookId); // Fetches from Google.
        BookEntity book = this.bookMapper.toEntity(googleBook); // Maps to entity.
        book.setUser(user); // Sets book owner.
        book.setAddedAt(LocalDate.now());
        return bookMapper.toResponseDTO(bookRepository.save(book)); // Saves and returns DTO.
    }

    /**
     * Searches Google Books API for books.
     */
    @Override
    public List<BookResponseDTO> searchBooksFromGoogle(String query) {
        return googleBooksIntegrationService.searchBooks(query).stream()
                .map(bookMapper::toEntity) // Converts Google DTOs to entities.
                .map(bookMapper::toResponseDTO) // Converts entities to response DTOs.
                .toList();
    }

    /**
     * Validates incoming book request data.
     */
    private void validateBookRequest(BookResponseDTO request) { // This parameter type might be incorrect; typically validates RequestDTO.
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Title can't be empty.");
        }
        if (request.getTags() != null && request.getTags().size() > 10) {
            throw new IllegalArgumentException("Maximum 10 tags allowed");
        }
    }
}
