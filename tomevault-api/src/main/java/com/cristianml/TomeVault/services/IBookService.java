package com.cristianml.TomeVault.services;

import com.cristianml.TomeVault.dtos.requests.BookRequestDTO;
import com.cristianml.TomeVault.dtos.responses.BookResponseDTO;
import com.cristianml.TomeVault.entities.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IBookService {

    Page<BookResponseDTO> getBooksByUser(UserEntity user, Pageable pageable);

    BookResponseDTO saveBook(BookRequestDTO request, UserEntity user);

    BookResponseDTO saveBookFromGoogle(String googleBookId, UserEntity user);

    List<BookResponseDTO> searchBooksFromGoogle(String query);

    BookResponseDTO updateBook(Long bookId, BookRequestDTO request, UserEntity user);

    void deleteBook(Long bookId, UserEntity user);

    BookResponseDTO getBookByGoogleIdForUser(String googleBookId, UserEntity user);

    BookResponseDTO getBookFromGoogleBookApi(String googleBookId);

    BookResponseDTO incrementBookReadCount(Long bookId, UserEntity user);
    BookResponseDTO decrementBookReadCount(Long bookId, UserEntity user);
}
