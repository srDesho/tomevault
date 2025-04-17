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
    Page<BookEntity> findAllByUserEntity(UserEntity user, Pageable pageable);

    Optional<BookEntity> findByIdAndUserEntity(Long id, UserEntity user);
}
