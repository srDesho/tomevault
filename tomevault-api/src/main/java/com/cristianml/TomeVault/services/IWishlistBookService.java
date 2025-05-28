package com.cristianml.TomeVault.services;

import com.cristianml.TomeVault.dtos.requests.WishlistBookRequestDTO;
import com.cristianml.TomeVault.dtos.responses.BookResponseDTO;
import com.cristianml.TomeVault.dtos.responses.WishlistBookResponseDTO;
import com.cristianml.TomeVault.entities.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IWishlistBookService {

    WishlistBookResponseDTO addToWishlistFromGoogle(String googleBookId, UserEntity user);

    BookResponseDTO moveToBooks(Long wishlistId, UserEntity user);

    Page<WishlistBookResponseDTO> getWishlistByUser(UserEntity userEntity, Pageable pageable);

    WishlistBookResponseDTO saveWishlistBook(WishlistBookRequestDTO wishlistBookRequestDTO, UserEntity userEntity);

    void deleteBook(Long bookId, UserEntity userEntity);

    WishlistBookResponseDTO updateBook(Long bookId, WishlistBookRequestDTO bookRequestDTO, UserEntity userEntity);
}
