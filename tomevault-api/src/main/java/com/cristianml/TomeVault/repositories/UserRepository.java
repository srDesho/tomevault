package com.cristianml.TomeVault.repositories;

import com.cristianml.TomeVault.entities.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findUserEntityByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    Optional<UserEntity> findUserEntityByEmail(String email);
    Page<UserEntity> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String Username, String email, Pageable pageable);
}
