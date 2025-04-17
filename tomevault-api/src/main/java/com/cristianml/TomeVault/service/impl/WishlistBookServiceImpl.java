package com.cristianml.TomeVault.service.impl;

import com.cristianml.TomeVault.dto.request.BookRequestDTO;
import com.cristianml.TomeVault.dto.request.WishlistBookRequestDTO;
import com.cristianml.TomeVault.dto.response.BookResponseDTO;
import com.cristianml.TomeVault.dto.response.WishlistBookResponseDTO;
import com.cristianml.TomeVault.entity.UserEntity;
import com.cristianml.TomeVault.entity.WishlistBookEntity;
import com.cristianml.TomeVault.mapper.WishlistBookMapper;
import com.cristianml.TomeVault.repository.WishlistBookRepository;
import com.cristianml.TomeVault.service.IWishlistBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WishlistBookServiceImpl implements IWishlistBookService {

    private final WishlistBookRepository wishlistBookRepository;
    private final WishlistBookMapper wishlistBookMapper;

    @Override
    public WishlistBookResponseDTO addToWishlistFromGoogle(String googleBookId, UserEntity user) {
        return null;
    }

    @Override
    public BookResponseDTO moveToBooks(Long wishlistId, UserEntity user) {
        return null;
    }


    @Override
    public Page<WishlistBookResponseDTO> getWishlistByUser(UserEntity userEntity, Pageable pageable) {
        Page<WishlistBookEntity> wishlistBooks = this.wishlistBookRepository.findAllByUser(userEntity, pageable);
        return wishlistBooks.map(wishlistBookMapper::toResponseDTO);
    }

    @Override
    public WishlistBookResponseDTO saveWishlistBook(WishlistBookRequestDTO wishlistBookRequestDTO, UserEntity userEntity) {
        WishlistBookEntity book = this.wishlistBookMapper.toEntity(wishlistBookRequestDTO);
        book.setUser(userEntity);
        WishlistBookEntity saved = this.wishlistBookRepository.save(book);
        return this.wishlistBookMapper.toResponseDTO(saved);
    }

    @Override
    public void deleteBook(Long bookId, UserEntity userEntity) {
        WishlistBookEntity delete = wishlistBookRepository.findByIdAndUser(bookId, userEntity)
                .orElseThrow(() -> new RuntimeException("Book not found or does not belong to the user."));
        this.wishlistBookRepository.delete(delete);
    }

    @Override
    public WishlistBookResponseDTO updateBook(Long bookId, BookRequestDTO bookRequestDTO, UserEntity userEntity) {
        WishlistBookEntity existing = this.wishlistBookRepository.findByIdAndUser(bookId, userEntity)
                .orElseThrow(() -> new RuntimeException("Book not found or does not belong to the user."));
        // Update fields
        existing.setTitle(bookRequestDTO.getTitle());
        existing.setAuthor(bookRequestDTO.getAuthor());
        existing.setDescription(bookRequestDTO.getDescription());
        existing.setThumbnail(bookRequestDTO.getThumbnail());
        // Saved
        WishlistBookEntity updated = this.wishlistBookRepository.save(existing);
        return wishlistBookMapper.toResponseDTO(updated);
    }
}
