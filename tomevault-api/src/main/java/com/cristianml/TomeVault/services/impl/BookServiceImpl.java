package com.cristianml.TomeVault.services.impl;

import com.cristianml.TomeVault.dtos.google.GoogleBookItem;
import com.cristianml.TomeVault.dtos.requests.BookRequestDTO;
import com.cristianml.TomeVault.dtos.responses.BookResponseDTO;
import com.cristianml.TomeVault.entities.BookEntity;
import com.cristianml.TomeVault.entities.UserEntity;
import com.cristianml.TomeVault.exceptions.BookAlreadyExistsException;
import com.cristianml.TomeVault.exceptions.BookPreviouslyDeletedException;
import com.cristianml.TomeVault.exceptions.ResourceNotFoundException;
import com.cristianml.TomeVault.mappers.BookMapper;
import com.cristianml.TomeVault.repositories.BookRepository;
import com.cristianml.TomeVault.services.IBookService;
import com.cristianml.TomeVault.services.IGoogleBooksIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

// Main service for handling all book operations including Google Books integration
@Service
@RequiredArgsConstructor
public class BookServiceImpl implements IBookService {

    private final BookRepository bookRepository; // Database operations for books
    private final BookMapper bookMapper; // Converts between entities and DTOs
    private final IGoogleBooksIntegrationService googleBooksIntegrationService; // Google Books API integration

    // Get paginated list of active books for a specific user
    @Override
    public Page<BookResponseDTO> getBooksByUser(UserEntity userEntity, Pageable pageable) {
        Page<BookEntity> books = this.bookRepository.findAllByUserAndIsActiveTrue(userEntity, pageable);
        return books.map(bookMapper::toResponseDTO);
    }

    // Save a new book from manual input
    @Override
    @Transactional
    public BookResponseDTO saveBook(BookRequestDTO bookRequestDTO, UserEntity userEntity) {
        BookEntity bookEntity = this.bookMapper.toEntity(bookRequestDTO);
        bookEntity.setUser(userEntity);
        BookEntity saved = this.bookRepository.save(bookEntity);
        return bookMapper.toResponseDTO(saved);
    }

    // Soft delete a book - marks as inactive instead of removing from database
    @Override
    @Transactional
    public void deleteBook(Long bookId, UserEntity userEntity) {
        BookEntity delete = bookRepository.findByIdAndUser(bookId, userEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found or does not belong to the user."));
        delete.setActive(false);
        this.bookRepository.save(delete);
    }

    // Reactivate a previously deleted book with option to keep reading progress
    @Override
    @Transactional
    public BookResponseDTO activateBook(String googleBookId, UserEntity userEntity, boolean keepProgress) {
        BookEntity deactivatedBook = this.bookRepository
                .findByGoogleBookIdAndUserAndIsActiveFalse(googleBookId, userEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found or does not belong to the user."));

        deactivatedBook.setActive(true);
        deactivatedBook.setAddedAt(LocalDate.now());

        // Reset reading counter if user doesn't want to keep progress
        if (!keepProgress) {
            deactivatedBook.setReadCount(0);
        }
        // If keepProgress is true, maintain current readCount

        BookEntity savedBook = bookRepository.save(deactivatedBook);
        return bookMapper.toResponseDTO(savedBook);
    }

    // Get a specific book from user's collection by Google Books ID
    @Override
    public BookResponseDTO getBookByGoogleIdForUser(String googleBookId, UserEntity user) {
        BookEntity book = this.bookRepository.findByGoogleBookIdAndUser(googleBookId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Book with Google ID " + googleBookId + " not found in your collection or does not belong to user."));
        return this.bookMapper.toResponseDTO(book);
    }

    // Fetch book details directly from Google Books API
    @Override
    public BookResponseDTO getBookFromGoogleBookApi(String googleBookId) {
        GoogleBookItem googleBookItem = this.googleBooksIntegrationService.getBookById(googleBookId);
        BookEntity book = this.bookMapper.toEntity(googleBookItem);
        return this.bookMapper.toResponseDTO(book);
    }

    // Increase the read counter for a book
    @Override
    @Transactional
    public BookResponseDTO incrementBookReadCount(Long bookId, UserEntity user) {
        int updateRows = this.bookRepository.incrementReadCount(bookId, user);
        if (updateRows == 0) {
            // Check if book exists at all or just not owned by user
            bookRepository.findById(bookId)
                    .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + bookId));
            throw new ResourceNotFoundException("Book not found or not owned by user with ID: " + bookId);
        }
        // Fetch updated book to return with new count
        BookEntity updatedBook = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found after update with ID: " + bookId));
        return bookMapper.toResponseDTO(updatedBook);
    }

    // Decrease the read counter for a book, prevents going below zero
    @Override
    public BookResponseDTO decrementBookReadCount(Long bookId, UserEntity user) {
        int updateRows = this.bookRepository.decrementReadCount(bookId, user);

        if (updateRows == 0) {
            // Check if book exists or if read count is already at zero
            BookEntity book = bookRepository.findById(bookId)
                    .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + bookId));
            if (book.getReadCount() == 0) {
                throw new IllegalArgumentException("Cannot decrement read count below zero for book ID: " + bookId);
            } else {
                throw new ResourceNotFoundException("Book not found or not owned by user with ID: " + bookId);
            }
        }
        // Fetch updated book to return with new count
        BookEntity book = this.bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found after with ID: " + bookId));
        return bookMapper.toResponseDTO(book);
    }

    // Update book details like title, author, description, etc.
    @Override
    @Transactional
    public BookResponseDTO updateBook(Long bookId, BookRequestDTO bookRequestDTO, UserEntity userEntity) {
        BookEntity existing = this.bookRepository.findByIdAndUser(bookId, userEntity)
                .orElseThrow(() -> new RuntimeException("Book not found or does not belong to the user."));
        // Update all fields from the DTO
        existing.setTitle(bookRequestDTO.getTitle());
        existing.setAuthor(bookRequestDTO.getAuthor());
        existing.setDescription(bookRequestDTO.getDescription());
        existing.setThumbnail(bookRequestDTO.getThumbnail());
        existing.setAddedAt(bookRequestDTO.getAddedAt());
        existing.setFinishedAt(bookRequestDTO.getFinishedAt());
        BookEntity updated = this.bookRepository.save(existing);
        return bookMapper.toResponseDTO(updated);
    }

    // Import and save a book from Google Books API to user's collection
    @Override
    @Transactional
    public BookResponseDTO saveBookFromGoogle(String googleBookId, UserEntity user) {
        // Check if this book was previously deleted by the user
        Optional<BookEntity> deletedBook = bookRepository.findByGoogleBookIdAndUserAndIsActiveFalse(googleBookId, user);
        if (deletedBook.isPresent()) {
            throw new BookPreviouslyDeletedException("Book was previously deleted. Please use activate endpoint.");
        }

        // Check if user already has this book active in their collection
        if (bookRepository.existsByGoogleBookIdAndUserAndIsActiveTrue(googleBookId, user)) {
            throw new BookAlreadyExistsException("Book already exists in your collection");
        }

        // Fetch book data from Google Books API
        GoogleBookItem googleBook = this.googleBooksIntegrationService.getBookById(googleBookId);
        BookEntity book = this.bookMapper.toEntity(googleBook);

        // Set default author if none provided
        if (book.getAuthor() == null || book.getAuthor().isBlank()) {
            book.setAuthor("Autor desconocido");
        }
        book.setUser(user);
        book.setAddedAt(LocalDate.now());
        book.setActive(true);
        return bookMapper.toResponseDTO(bookRepository.save(book));
    }

    // Search for books using Google Books API
    @Override
    public List<BookResponseDTO> searchBooksFromGoogle(String query) {
        List<GoogleBookItem> googleResults = googleBooksIntegrationService.searchBooks(query);

        List<BookResponseDTO> finalResults = googleResults.stream()
                .map(bookMapper::toEntity)
                .map(bookMapper::toResponseDTO)
                .toList();
        return finalResults;
    }

    // Validate book data before processing - currently unused but kept for future validation
    private void validateBookRequest(BookResponseDTO request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Title can't be empty.");
        }
        if (request.getTags() != null && request.getTags().size() > 10) {
            throw new IllegalArgumentException("Maximum 10 tags allowed");
        }
    }
}