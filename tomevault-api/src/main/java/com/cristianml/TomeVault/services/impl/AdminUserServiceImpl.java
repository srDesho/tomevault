package com.cristianml.TomeVault.services.impl;

import com.cristianml.TomeVault.dtos.requests.UserCreateRequestDTO;
import com.cristianml.TomeVault.dtos.requests.UserProfileUpdateRequestDTO;
import com.cristianml.TomeVault.dtos.responses.UserProfileResponseDTO;
import com.cristianml.TomeVault.entities.UserEntity;
import com.cristianml.TomeVault.exceptions.AccessDeniedException;
import com.cristianml.TomeVault.exceptions.ResourceNotFoundException;
import com.cristianml.TomeVault.mappers.UserMapper;
import com.cristianml.TomeVault.repositories.RoleRepository;
import com.cristianml.TomeVault.repositories.UserRepository;
import com.cristianml.TomeVault.security.entities.RoleEntity;
import com.cristianml.TomeVault.security.entities.RoleEnum;
import com.cristianml.TomeVault.services.IAdminUserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.cristianml.TomeVault.utilities.Utilities.validatePassword;

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

        UserEntity currentUser = this.getCurrentAuthenticatedUser();
        UserEntity existingUser = this.userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("User not found with ID: " + id));

        // Validate permission before updating
        validatedAdminPermission(currentUser, existingUser);

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
    public void softDeleteUserById(Long id) {

        UserEntity currentUser = this.getCurrentAuthenticatedUser();
        UserEntity userToDelete = this.userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        // Validate permission before deleting
        validatedAdminPermission(currentUser, userToDelete);

        // Soft delete
        userToDelete.setDeleted(true);
        userToDelete.setDeletedAt(LocalDateTime.now());
        userToDelete.setEnabled(false);
        userToDelete.setAccountNonLocked(false);
        this.userRepository.save(userToDelete);
    }

    // Permanently removes a user from the database.
    @Override
    @Transactional
    public void hardDeleteUserById(Long id) {

        UserEntity currentUser = this.getCurrentAuthenticatedUser();
        UserEntity targetUser = this.userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("User not found with ID: " + id));

        // Validate permission before hard deleting
        validatedAdminPermission(currentUser, targetUser);

        userRepository.deleteById(id);
    }

    private static final Logger logger = LoggerFactory.getLogger(AdminUserServiceImpl.class);

    @Override
    @Transactional
    public UserProfileResponseDTO updateUserRoles(Long userId, List<String> newRoleNames) {

        UserEntity currentUser = this.getCurrentAuthenticatedUser();
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Validate permission before updating roles
        validatedAdminPermission(currentUser, user);

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

        UserEntity currentUser = this.getCurrentAuthenticatedUser();
        UserEntity userToUpdate = this.userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        validatedAdminPermission(currentUser, userToUpdate);

        validatePassword(newRawPassword);
        userToUpdate.setPassword(this.passwordEncoder.encode(newRawPassword));
        userToUpdate.setCredentialsNonExpired(true);

        UserEntity updateUser = this.userRepository.save(userToUpdate);
        return this.userMapper.toProfileResponse(updateUser);
    }

    @Override
    public UserProfileResponseDTO toggleUserStatus(Long userId, boolean enabled) {

        UserEntity currentUser = this.getCurrentAuthenticatedUser();
        UserEntity userToUpdate = this.userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Validate permission before toggling status
        validatedAdminPermission(currentUser, userToUpdate);

        // verify tha is not deleted
        if (userToUpdate.isDeleted()) {
            throw new IllegalArgumentException("Cannot toggle status of a deleted user.");
        }

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

    // Validates if the current admin has permission to modify the target user.
    // SUPER_ADMIN can modify anyone.
    // ADMIN can only modify users with USER role.
    private void validatedAdminPermission(UserEntity currentUser, UserEntity targetUser) {
        // SUPER_ADMIN can do anything.
        boolean isSuperAdmin = currentUser.getRoleList().stream()
                .anyMatch(role -> role.getRoleEnum() == RoleEnum.SUPER_ADMIN);

        if (isSuperAdmin) return; // SUPER_ADMIN has full access

        // Check if current user is ADMIN
        boolean isAdmin = currentUser.getRoleList().stream()
                .anyMatch(role -> role.getRoleEnum() == RoleEnum.ADMIN);

        if (!isAdmin) {
            throw new AccessDeniedException("User does not have admin privileges");
        }

        // ADMIN cannot modify other ADMIN or SUPER_ADMIN users
        boolean targetIsAdminOrSuperAdmin = targetUser.getRoleList().stream()
                .anyMatch(role -> role.getRoleEnum() == RoleEnum.SUPER_ADMIN ||
                        role.getRoleEnum() == RoleEnum.ADMIN);

        if (targetIsAdminOrSuperAdmin) {
            throw new AccessDeniedException("ADMIN users cannot modify other ADMIN or SUPER_ADMIN users");
        }
    }

    // Gets the current authenticated user from Spring Security context
    private UserEntity getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return this.userRepository.findUserEntityByUsername(username).orElseThrow(
                () -> new ResourceNotFoundException("Current user not found"));

    }
}