package com.cristianml.TomeVault.service.impl;

import com.cristianml.TomeVault.dto.request.UserRequestDTO;
import com.cristianml.TomeVault.dto.response.UserResponseDTO;
import com.cristianml.TomeVault.entity.UserEntity;
import com.cristianml.TomeVault.exception.ResourceNotFoundException;
import com.cristianml.TomeVault.mapper.UserMapper;
import com.cristianml.TomeVault.repository.UserRepository;
import com.cristianml.TomeVault.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service implementation for managing user-related operations.
 * This class handles the business logic for creating, retrieving, updating, and deleting users.
 */
@Service
@Primary
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final UserMapper userMapper;

    /**
     * Creates a new user.
     */
    @Override
    public UserResponseDTO createUser(UserRequestDTO userRequestDTO) {
        if (this.userRepository.existsByEmail(userRequestDTO.getEmail())) {
            throw new IllegalArgumentException("Email already registered.");
        }

        UserEntity userEntity = this.userMapper.toEntity(userRequestDTO);
        userEntity.setPassword(passwordEncoder.encode(userRequestDTO.getPassword()));
        userEntity.setEnabled(true);
        userEntity.setAccountNonExpired(true);
        userEntity.setAccountNonLocked(true);
        userEntity.setCredentialsNonExpired(true);

        return this.userMapper.toResponse(this.userRepository.save(userEntity));
    }

    /**
     * Retrieves a user by ID.
     */
    @Override
    public UserResponseDTO getUserById(Long id) {
        return this.userRepository.findById(id)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    /**
     * Retrieves a paginated list of all users.
     */
    @Override
    public Page<UserResponseDTO> getAllUsers(Pageable pageable) {
        return this.userRepository.findAll(pageable)
                .map(userMapper::toResponse);
    }

    /**
     * Updates an existing user's information.
     */
    @Override
    public UserResponseDTO updateUser(Long id, UserRequestDTO userRequestDTO) {
        UserEntity userEntity = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        modelMapper.map(userRequestDTO, userEntity);
        if (userRequestDTO.getPassword() != null) {
            userEntity.setPassword(passwordEncoder.encode(userRequestDTO.getPassword()));
        }

        if (userRequestDTO.getEmail() != null && !userRequestDTO.getEmail().equals(userEntity.getEmail())) {
            if (this.userRepository.existsByEmail(userRequestDTO.getEmail())) {
                throw new IllegalArgumentException("Email already registered.");
            }
        }
        return this.userMapper.toResponse(this.userRepository.save(userEntity));
    }

    /**
     * Deletes a user by ID.
     */
    @Override
    public void deleteUserById(Long id) {
        if (!this.userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found.");
        }
        this.userRepository.deleteById(id);
    }

    /**
     * Retrieves the current authenticated user's details.
     */
    @Override
    public UserResponseDTO getCurrentUser(UserEntity userEntity) {
        return this.userMapper.toResponse(userEntity);
    }
}
