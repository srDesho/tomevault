package com.cristianml.TomeVault.services.impl;

import com.cristianml.TomeVault.dtos.requests.ChangePasswordRequestDTO;
import com.cristianml.TomeVault.dtos.requests.UserProfileUpdateRequestDTO;
import com.cristianml.TomeVault.dtos.responses.UserProfileResponseDTO;
import com.cristianml.TomeVault.entities.UserEntity;
import com.cristianml.TomeVault.mappers.UserMapper;
import com.cristianml.TomeVault.repositories.UserRepository;
import com.cristianml.TomeVault.security.dtos.AuthResponse;
import com.cristianml.TomeVault.services.IUserService;
import com.cristianml.TomeVault.utilities.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static com.cristianml.TomeVault.utilities.Utilities.validatePassword;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final JwtUtils jwtUtils;

    // Get the complete profile information for the authenticated user
    @Override
    @Transactional(readOnly = true)
    public UserProfileResponseDTO getUserProfile(UserEntity user) {
        return userMapper.toProfileResponse(user);
    }

    // Update user profile information like email and username
    @Override
    public AuthResponse updateUserProfile(UserEntity user, UserProfileUpdateRequestDTO requestDTO) {

        // Check if email is being changed and validate it's not already taken
        if (requestDTO.getEmail() != null && !requestDTO.getEmail().equals(user.getEmail())) {
            boolean emailExists = this.userRepository.existsByEmail(requestDTO.getEmail());
            if (emailExists) {
                throw new IllegalArgumentException("Email is already in use by another user");
            }
        }

        // Check if username is being changed and validate it's unique
        if (requestDTO.getUsername() != null && !requestDTO.getUsername().equals(user.getUsername())) {
            boolean usernameExists = this.userRepository.existsByUsername(requestDTO.getUsername());
            if (usernameExists) {
                throw new IllegalArgumentException("Username is already in use by another user");
            }
            user.setUsername(requestDTO.getUsername());
        }

        // Update user fields from the request DTO
        this.userMapper.updateEntityFromDto(requestDTO, user);

        // Save the updated user to database
        UserEntity updatedUser = this.userRepository.save(user);

        return this.generateAuthResponseForUser(updatedUser, "Perfil actualizado correctamente.");
    }

    // Change user password with security validations
    @Override
    public AuthResponse changePassword(UserEntity user, ChangePasswordRequestDTO requestDTO) {

        // Verify current password matches
        if (!passwordEncoder.matches(requestDTO.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Confirm new password matches confirmation
        if (!requestDTO.getNewPassword().equals(requestDTO.getConfirmPassword())) {
            throw new IllegalArgumentException("New passwords do not match");
        }

        // Prevent using the same password as current one
        if (passwordEncoder.matches(requestDTO.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        // Validate password strength requirements
        validatePassword(requestDTO.getNewPassword());

        // Encode and set the new password
        user.setPassword(passwordEncoder.encode(requestDTO.getNewPassword()));
        this.userRepository.save(user);

        return this.generateAuthResponseForUser(user, "Contraseña actualizada correctamente.");
    }

    // Generate authentication response with new JWT token after profile changes
    private AuthResponse generateAuthResponseForUser(UserEntity user, String message) {
        // Build authority list from user roles and permissions
        List<SimpleGrantedAuthority> authorityList = new ArrayList<>();

        user.getRoleList()
                .forEach(role -> authorityList.add(new SimpleGrantedAuthority("ROLE_".concat(role.getRoleEnum().name()))));

        user.getRoleList().stream()
                .flatMap(role -> role.getPermissionList().stream())
                .forEach(permission -> authorityList.add(new SimpleGrantedAuthority(permission.getPermissionEnum().name())));

        // Create authentication token with updated user information
        Authentication authentication = new UsernamePasswordAuthenticationToken(user.getUsername(), null, authorityList);
        String newAccessToken = this.jwtUtils.createToken(authentication);

        return new AuthResponse(user.getUsername(), message, newAccessToken, true);
    }
}