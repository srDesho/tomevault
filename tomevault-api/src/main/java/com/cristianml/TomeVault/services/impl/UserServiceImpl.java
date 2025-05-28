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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final JwtUtils jwtUtils;

    // Retrieves authenticated user's complete profile information.
    // Maps internal UserEntity to secure UserProfileResponseDTO for client consumption.
    @Override
    @Transactional(readOnly = true)
    public UserProfileResponseDTO getUserProfile(UserEntity user) {
        return userMapper.toProfileResponse(user);
    }

    @Override
    public AuthResponse updateUserProfile(UserEntity user, UserProfileUpdateRequestDTO requestDTO) {

        // Validate email uniqueness if user attempts to change email address
        if (requestDTO.getEmail() != null && !requestDTO.getEmail().equals(user.getEmail())) {
            boolean emailExists = this.userRepository.existsByEmail(requestDTO.getEmail());
            if (emailExists) {
                throw new IllegalArgumentException("Email is already in use by another user");
            }
        }
        if (requestDTO.getUsername() != null && !requestDTO.getUsername().equals(user.getUsername())) {
            boolean usernameExists = this.userRepository.existsByUsername(requestDTO.getUsername());
            if (usernameExists) {
                throw new IllegalArgumentException("Username is already in use by another user");
            }
            user.setUsername(requestDTO.getUsername());
        }
        // Perform selective field updates using mapper for consistency
        this.userMapper.updateEntityFromDto(requestDTO, user);

        // Persist updated user information to database
        UserEntity updatedUser = this.userRepository.save(user);

        return this.generateAuthResponseForUser(updatedUser, "Profile updated successfully");
    }

    @Override
    public AuthResponse changePassword(UserEntity user, ChangePasswordRequestDTO requestDTO) {

        // Validate current password correctness using secure password encoder
        if (!passwordEncoder.matches(requestDTO.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        // Ensure new password confirmation consistency for user experience
        if (!requestDTO.getNewPassword().equals(requestDTO.getConfirmPassword())) {
            throw new IllegalArgumentException("New passwords do not match");
        }
        // Prevent password reuse for enhanced security practices
        if (passwordEncoder.matches(requestDTO.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        // Set the new password
        user.setPassword(passwordEncoder.encode(requestDTO.getNewPassword()));
        this.userRepository.save(user);

        return this.generateAuthResponseForUser(user, "Password changed successfully");
    }

    private AuthResponse generateAuthResponseForUser(UserEntity user, String message) {
        // Generate new JWT token to reflect any potential critical changes (like username)
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
