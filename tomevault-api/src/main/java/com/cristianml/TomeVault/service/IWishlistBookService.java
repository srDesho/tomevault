package com.cristianml.TomeVault.service;

import com.cristianml.TomeVault.dto.request.WishlistBookRequestDTO;
import com.cristianml.TomeVault.dto.response.BookResponseDTO;
import com.cristianml.TomeVault.dto.response.WishlistBookResponseDTO;
import com.cristianml.TomeVault.entity.UserEntity;
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
