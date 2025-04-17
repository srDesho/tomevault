package com.cristianml.TomeVault.repository;

import com.cristianml.TomeVault.entity.UserEntity;
import com.cristianml.TomeVault.entity.WishlistBookEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WishlistBooksRepository extends JpaRepository<WishlistBookEntity, Long> {
    Page<WishlistBookEntity> findAllByUserEntity(UserEntity user, Pageable pageable);

    Optional<WishlistBookEntity> findByIdAndUserEntity(Long id, UserEntity user);
}
