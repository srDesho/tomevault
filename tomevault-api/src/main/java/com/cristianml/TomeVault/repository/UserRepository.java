package com.cristianml.TomeVault.repository;

import com.cristianml.TomeVault.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findUserEntityByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

}
