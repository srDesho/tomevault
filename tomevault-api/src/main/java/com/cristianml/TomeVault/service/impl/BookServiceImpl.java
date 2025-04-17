package com.cristianml.TomeVault.service.impl;

import com.cristianml.TomeVault.dto.request.BookRequestDTO;
import com.cristianml.TomeVault.dto.response.BookResponseDTO;
import com.cristianml.TomeVault.entity.BookEntity;
import com.cristianml.TomeVault.entity.UserEntity;
import com.cristianml.TomeVault.mapper.BookMapper;
import com.cristianml.TomeVault.repository.BookRepository;
import com.cristianml.TomeVault.service.IBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements IBookService {

    private final BookRepository bookRepository;
    private final BookMapper bookMapper;

    @Override
    public Page<BookResponseDTO> getBooksByUser(UserEntity userEntity, Pageable pageable) {
        Page<BookEntity> books = this.bookRepository.findAllByUser(userEntity, pageable);
        return books.map(bookMapper::toResponseDTO);
    }

    @Override
    public BookResponseDTO saveBook(BookRequestDTO bookRequestDTO, UserEntity userEntity) {
        BookEntity bookEntity = this.bookMapper.toEntity(bookRequestDTO);
        bookEntity.setUser(userEntity);
        BookEntity saved = this.bookRepository.save(bookEntity);
        return bookMapper.toResponseDTO(saved);
    }

    @Override
    public void deleteBook(Long bookId, UserEntity userEntity) {
        BookEntity delete = bookRepository.findByIdAndUser(bookId, userEntity)
                .orElseThrow(() -> new RuntimeException("Book not found or does not belong to the user."));
        this.bookRepository.delete(delete);
    }

    @Override
    public BookResponseDTO updateBook(Long bookId, BookRequestDTO bookRequestDTO, UserEntity userEntity) {
        BookEntity existing = this.bookRepository.findByIdAndUser(bookId, userEntity)
                .orElseThrow(() -> new RuntimeException("Book not found or does not belong to the user."));
        // Update fields
        existing.setTitle(bookRequestDTO.getTitle());
        existing.setAuthor(bookRequestDTO.getAuthor());
        existing.setDescription(bookRequestDTO.getDescription());
        existing.setThumbnail(bookRequestDTO.getThumbnail());
        // Saved
        BookEntity updated = this.bookRepository.save(existing);
        return bookMapper.toResponseDTO(updated);
    }

    @Override
    public BookResponseDTO saveBookFromGoogle(String googleBookId, UserEntity user) {
        return null;
    }

    @Override
    public List<BookResponseDTO> searchBooksFromGoogle(String query) {
        return List.of();
    }
}
