package com.cristianml.TomeVault.service;

import com.cristianml.TomeVault.dto.request.BookRequestDTO;
import com.cristianml.TomeVault.dto.request.WishlistBookRequestDTO;
import com.cristianml.TomeVault.dto.response.WishlistBookResponseDTO;
import com.cristianml.TomeVault.entity.UserEntity;
import com.cristianml.TomeVault.entity.WishlistBookEntity;
import com.cristianml.TomeVault.mapper.WishlistBookMapper;
import com.cristianml.TomeVault.repository.WishlistBooksRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WishlistBookService {

    private final WishlistBooksRepository wishlistBooksRepository;
    private final WishlistBookMapper wishlistBookMapper;

    public Page<WishlistBookResponseDTO> getWishlistBookByUser(UserEntity userEntity, Pageable pageable) {
        Page<WishlistBookEntity> wishlistBooks = this.wishlistBooksRepository.findAllByUserEntity(userEntity, pageable);
        return wishlistBooks.map(wishlistBookMapper::toResponseDTO);
    }

    public WishlistBookResponseDTO saveWishlistBook(WishlistBookRequestDTO wishlistBookRequestDTO, UserEntity userEntity) {
        WishlistBookEntity book = this.wishlistBookMapper.toEntity(wishlistBookRequestDTO);
        book.setUser(userEntity);
        WishlistBookEntity saved = this.wishlistBooksRepository.save(book);
        return this.wishlistBookMapper.toResponseDTO(saved);
    }

    public void deleteBook(Long bookId, UserEntity userEntity) {
        WishlistBookEntity delete = wishlistBooksRepository.findByIdAndUserEntity(bookId, userEntity)
                .orElseThrow(() -> new RuntimeException("Book not found or does not belong to the user."));
        this.wishlistBooksRepository.delete(delete);
    }

    public WishlistBookResponseDTO updateBook(Long bookId, BookRequestDTO bookRequestDTO, UserEntity userEntity) {
        WishlistBookEntity existing = this.wishlistBooksRepository.findByIdAndUserEntity(bookId, userEntity)
                .orElseThrow(() -> new RuntimeException("Book not found or does not belong to the user."));
        // Update fields
        existing.setTitle(bookRequestDTO.getTitle());
        existing.setAuthor(bookRequestDTO.getAuthor());
        existing.setDescription(bookRequestDTO.getDescription());
        existing.setThumbnail(bookRequestDTO.getThumbnail());
        // Saved
        WishlistBookEntity updated = this.wishlistBooksRepository.save(existing);
        return wishlistBookMapper.toResponseDTO(updated);
    }
}
