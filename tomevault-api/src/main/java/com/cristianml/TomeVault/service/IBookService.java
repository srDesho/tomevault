package com.cristianml.TomeVault.service;

import com.cristianml.TomeVault.dto.request.BookRequestDTO;
import com.cristianml.TomeVault.dto.response.BookResponseDTO;
import com.cristianml.TomeVault.entity.UserEntity;
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
}
