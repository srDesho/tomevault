package com.cristianml.TomeVault.service;

import com.cristianml.TomeVault.dto.request.BookRequestDTO;
import com.cristianml.TomeVault.dto.response.BookResponseDTO;
import com.cristianml.TomeVault.entity.BookEntity;
import com.cristianml.TomeVault.entity.UserEntity;
import com.cristianml.TomeVault.mapper.BookMapper;
import com.cristianml.TomeVault.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final BookMapper bookMapper;

    public Page<BookResponseDTO> getBookByUser(UserEntity userEntity, Pageable pageable) {
        Page<BookEntity> books = this.bookRepository.findAllByUserEntity(userEntity, pageable);
        return books.map(bookMapper::toResponseDTO);
    }

    public BookResponseDTO saveBook(BookRequestDTO bookRequestDTO, UserEntity userEntity) {
        BookEntity bookEntity = this.bookMapper.toEntity(bookRequestDTO);
        bookEntity.setUser(userEntity);
        BookEntity saved = this.bookRepository.save(bookEntity);
        return bookMapper.toResponseDTO(saved);
    }

    public void deleteBook(Long bookId, UserEntity userEntity) {
        BookEntity delete = bookRepository.findByIdAndUserEntity(bookId, userEntity)
                .orElseThrow(() -> new RuntimeException("Book not found or does not belong to the user."));
        this.bookRepository.delete(delete);
    }

    public BookResponseDTO updateBook(Long bookId, BookRequestDTO bookRequestDTO, UserEntity userEntity) {
        BookEntity existing = this.bookRepository.findByIdAndUserEntity(bookId, userEntity)
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

}
