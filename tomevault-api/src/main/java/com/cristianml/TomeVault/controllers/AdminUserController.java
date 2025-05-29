package com.cristianml.TomeVault.controllers;

import com.cristianml.TomeVault.dtos.requests.*;
import com.cristianml.TomeVault.dtos.responses.UserProfileResponseDTO;
import com.cristianml.TomeVault.exceptions.ResourceNotFoundException;
import com.cristianml.TomeVault.services.IAdminUserService;
import com.cristianml.TomeVault.utilities.Utilities;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for administrative user operations in TomeVault application.
 * Provides endpoints for CRUD operations, role management, and user administration.
 */

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final IAdminUserService adminUserService;

    // Retrieves a paginated list of all users.
    @GetMapping
    public ResponseEntity<Page<UserProfileResponseDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<UserProfileResponseDTO> users = this.adminUserService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    // Retrieves a specific user by ID.
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponseDTO> getUserById(@PathVariable("id") Long id) {
        UserProfileResponseDTO user = this.adminUserService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // Creates a new user in the system.
    @PostMapping
    public ResponseEntity<UserProfileResponseDTO> createUser(@RequestBody @Valid UserCreateRequestDTO createRequestDTO) {
        UserProfileResponseDTO userProfileResponseDTO = this.adminUserService.createUser(createRequestDTO);
        return ResponseEntity.ok(userProfileResponseDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfileResponseDTO> updateUser(
            @RequestBody @Valid UserProfileUpdateRequestDTO userProfileUpdateRequestDTO,
            @PathVariable("id") Long id) {
        UserProfileResponseDTO userProfileResponseDTO = this.adminUserService.updateUser(id, userProfileUpdateRequestDTO);
        return ResponseEntity.ok(userProfileResponseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteUser(@PathVariable Long id) {
        try {
            this.adminUserService.deleteUserById(id);
            return Utilities.generateResponse(HttpStatus.OK, "User deleted successfully.");
        } catch (ResourceNotFoundException e) {
            return Utilities.generateResponse(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (RuntimeException e) {
            return Utilities.generateResponse(HttpStatus.BAD_REQUEST, "Failed to delete User." + e.getMessage());
        } catch (Exception e) {
            return Utilities.generateResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred during deletion.");
        }
    }

    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasRole('SUPER_ADMIN')") // Only super admins can permanently delete
    public ResponseEntity<Object> hardDeleteUser(@PathVariable Long id) {
        try {
            this.adminUserService.hardDeleteUserById(id);
            return Utilities.generateResponse(HttpStatus.OK, "User deleted successfully.");
        } catch (ResourceNotFoundException e) {
            return Utilities.generateResponse(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (RuntimeException e) {
            return Utilities.generateResponse(HttpStatus.BAD_REQUEST, "Failed to delete User." + e.getMessage());
        } catch (Exception e) {
            return Utilities.generateResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred during deletion.");
        }
    }

    // Updates a user's roles.
    @PutMapping("/{id}/roles")
    public ResponseEntity<UserProfileResponseDTO> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UserRoleUpdateRequestDTO userRoleUpdateRequestDTO) {
            UserProfileResponseDTO updatedUser =
                    this.adminUserService.updateUserRoles(id, userRoleUpdateRequestDTO.getRoleNames());
            return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<Object> resetUserPassword(
            @PathVariable Long id,
            @Valid @RequestBody PasswordResetRequestDTO passwordResetRequestDTO) {
        UserProfileResponseDTO updatedUser =
                this.adminUserService.resetUserPassword(id, passwordResetRequestDTO.getNewPassword());
        return Utilities.generateResponse(HttpStatus.OK, "User Password reset successfully.");
    }

    @PutMapping("/toggle-status/{id}")
    public ResponseEntity<Object> toggleUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusToggleRequestDTO statusToggleRequestDTO) {
        this.adminUserService.toggleUserStatus(id, statusToggleRequestDTO.getEnabled());
        return Utilities.generateResponse(HttpStatus.OK, "Status toggle successfully.");
    }

    @GetMapping("/search")
    public ResponseEntity<Object> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        if (query == null || query.trim().isEmpty()) {
            return Utilities.generateResponse(HttpStatus.BAD_REQUEST, "The status can't be empty.");
        }

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);


        Page<UserProfileResponseDTO> users = this.adminUserService.searchUsers(query.trim(), pageable);

        return ResponseEntity.ok(users);
    }
}