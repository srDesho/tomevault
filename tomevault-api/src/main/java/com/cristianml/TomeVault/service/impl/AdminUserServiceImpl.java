package com.cristianml.TomeVault.service.impl;

import com.cristianml.TomeVault.dto.request.UserCreateRequestDTO;
import com.cristianml.TomeVault.dto.request.UserProfileUpdateRequestDTO;
import com.cristianml.TomeVault.dto.response.UserProfileResponseDTO;
import com.cristianml.TomeVault.entity.UserEntity;
import com.cristianml.TomeVault.exception.ResourceNotFoundException;
import com.cristianml.TomeVault.mapper.UserMapper;
import com.cristianml.TomeVault.repository.RoleRepository;
import com.cristianml.TomeVault.repository.UserRepository;
import com.cristianml.TomeVault.security.entity.RoleEntity;
import com.cristianml.TomeVault.security.entity.RoleEnum;
import com.cristianml.TomeVault.service.IAdminUserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements IAdminUserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponseDTO getUserById(Long id) {
        UserEntity user = userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("User not found."));
        return this.userMapper.toProfileResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserProfileResponseDTO> getAllUsers(Pageable pageable) {
        Page<UserEntity> users = this.userRepository.findAll(pageable);
        return users.map(userMapper::toProfileResponse);
    }

    @Override
    @Transactional
    public UserProfileResponseDTO createUser(UserCreateRequestDTO userCreateRequestDTO) {

        // Validate email uniqueness.
        if (this.userRepository.existsByEmail(userCreateRequestDTO.getEmail())) {
            throw new IllegalArgumentException("Email is already in use: " + userCreateRequestDTO.getEmail());
        }
        // Validate username uniqueness.
        if (this.userRepository.existsByUsername(userCreateRequestDTO.getUsername())) {
            throw new IllegalArgumentException("Username is already in use: " + userCreateRequestDTO.getUsername());
        }

        UserEntity user = userMapper.toEntity(userCreateRequestDTO);
        user.setPassword(passwordEncoder.encode(userCreateRequestDTO.getPassword()));

        // Sets default user status.
        user.setEnabled(true);
        user.setAccountNonExpired(true);
        user.setAccountNonLocked(true);
        user.setCredentialsNonExpired(true);

        // Assigns default USER role if no roles specified.
        if (user.getRoleList() == null || user.getRoleList().isEmpty()) {
            RoleEntity defaultRole = this.roleRepository.findByRoleEnum(RoleEnum.USER)
                    .orElseThrow(() -> new ResourceNotFoundException("Default USER role not found"));
            Set<RoleEntity> defaultRoles = new HashSet<>();
            defaultRoles.add(defaultRole);
            user.setRoleList(defaultRoles);
        }
        UserEntity savedUser = userRepository.save(user);
        return this.userMapper.toProfileResponse(savedUser);
    }

    @Override
    @Transactional
    public UserProfileResponseDTO updateUser(Long id, UserProfileUpdateRequestDTO userUpdateRequestDTO) {

        UserEntity existingUser = this.userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("User not found with ID: " + id));

        if (userUpdateRequestDTO.getEmail() != null &&
                !userUpdateRequestDTO.getEmail().equals(existingUser.getEmail())) {
            if (this.userRepository.existsByEmail(userUpdateRequestDTO.getEmail())) {
                throw new IllegalArgumentException("Email is already in use by another user: " + userUpdateRequestDTO.getEmail());
            }
        }

        if (userUpdateRequestDTO.getUsername() != null &&
                !userUpdateRequestDTO.getUsername().equals(existingUser.getUsername())) {
            if (userRepository.existsByUsername(userUpdateRequestDTO.getUsername())) {
                throw new IllegalArgumentException("Username is already in use by another user: " + userUpdateRequestDTO.getUsername());
            }
        }

        // Uses mapper to update fields from DTO (ModelMapper handles null checks automatically).
        this.userMapper.updateEntityFromDto(userUpdateRequestDTO, existingUser);

        UserEntity updatedUser = this.userRepository.save(existingUser);
        return userMapper.toProfileResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUserById(Long id) {
        UserEntity userToDelete = this.userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        userToDelete.setEnabled(false);
        userToDelete.setAccountNonLocked(false);
        this.userRepository.save(userToDelete);
    }

    // Permanently removes a user from the database.
    @Override
    @Transactional
    public void hardDeleteUserById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
    }

    private static final Logger logger = LoggerFactory.getLogger(AdminUserServiceImpl.class);

    @Override
    @Transactional
    public UserProfileResponseDTO updateUserRoles(Long userId, List<String> newRoleNames) {
        System.out.println("=======================================================");
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        logger.debug("User found:", user.getUsername());
        Set<RoleEntity> newRoles = this.roleRepository.findRoleEntitiesByRoleEnumIn(newRoleNames)
                .stream().collect(Collectors.toSet());
        if (newRoles.isEmpty()) {
            throw new ResourceNotFoundException("Roles not found: " + newRoles);
        }
        user.setRoleList(newRoles);
        UserProfileResponseDTO updatedUser = userMapper.toProfileResponse(user);
        logger.debug("user update:{}roles: {}", updatedUser.getUsername(), updatedUser.getRoles());
        return userMapper.toProfileResponse(user);
    }

    @Override
    public UserProfileResponseDTO resetUserPassword(Long userId, String newRawPassword) {
        UserEntity userToUpdate = this.userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        validatePassword(newRawPassword);
        userToUpdate.setPassword(this.passwordEncoder.encode(newRawPassword));
        userToUpdate.setCredentialsNonExpired(true);

        UserEntity updateUser = this.userRepository.save(userToUpdate);
        return this.userMapper.toProfileResponse(updateUser);
    }

    @Override
    public UserProfileResponseDTO toggleUserStatus(Long userId, boolean enabled) {
        UserEntity userToUpdate = this.userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        userToUpdate.setEnabled(enabled);
        if (!enabled) {
            userToUpdate.setAccountNonLocked(false);
        } else {
            userToUpdate.setAccountNonLocked(true);
        }

        UserEntity updated = this.userRepository.save(userToUpdate);
        return null;
    }

    @Override
    public Page<UserProfileResponseDTO> searchUsers(String query, Pageable pageable) {
        Page<UserEntity> users = this.userRepository
                .findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, pageable);
        return users.map(userMapper::toProfileResponse);
    }

    // Validate password strength requirements
    private void validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("Password must contain at least one digit");
        }
    }
}