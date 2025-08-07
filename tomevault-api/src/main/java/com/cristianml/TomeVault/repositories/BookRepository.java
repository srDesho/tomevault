package com.cristianml.TomeVault.repositories;

import com.cristianml.TomeVault.entities.BookEntity;
import com.cristianml.TomeVault.entities.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<BookEntity, Long> {
    Page<BookEntity> findAllByUserAndIsActiveTrue(UserEntity user, Pageable pageable);

    Optional<BookEntity> findByIdAndUser(Long id, UserEntity user);

    boolean existsByGoogleBookIdAndUser(String googleBookId, UserEntity user);
    Optional<BookEntity> findByGoogleBookIdAndUser(String googleBookId, UserEntity user);

    // Increment book's read count
    @Modifying
    @Transactional
    @Query("UPDATE BookEntity b SET b.readCount = b.readCount + 1 WHERE b.id = :bookId AND b.user = :user")
    int incrementReadCount(@Param("bookId") Long bookId, @Param("user") UserEntity user);

    @Modifying
    @Transactional
    @Query("UPDATE BookEntity b SET b.readCount = b.readCount - 1 WHERE b.id = :bookId AND b.user = :user AND b.readCount > 0")
    int decrementReadCount(@Param("bookId") Long bookId, @Param("user") UserEntity user);

    Optional<BookEntity> findByGoogleBookIdAndUserAndIsActiveFalse(String googleBookId, UserEntity user);

    boolean existsByGoogleBookIdAndUserAndIsActiveTrue(String googleBookId, UserEntity user);

    boolean existsByGoogleBookIdAndUserAndIsActiveFalse(String googleBookId, UserEntity userEntity);

    long countByUserAndIsActiveTrue(UserEntity user);

    @Query("SELECT DISTINCT b FROM BookEntity b LEFT JOIN FETCH b.tags WHERE b.user = :user ORDER BY b.addedAt ASC")
    List<BookEntity> findAllByUserWithTags(@Param("user") UserEntity user);

    List<BookEntity> findAllByUserAndIsActiveFalse(UserEntity user);

}
