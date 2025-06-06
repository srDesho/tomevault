package com.cristianml.TomeVault.repository;

import com.cristianml.TomeVault.entity.BookEntity;
import com.cristianml.TomeVault.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<BookEntity, Long> {
    Page<BookEntity> findAllByUser(UserEntity user, Pageable pageable);

    Optional<BookEntity> findByIdAndUser(Long id, UserEntity user);

    boolean existsByGoogleBookIdAndUser(String googleBookId, UserEntity user);
}
