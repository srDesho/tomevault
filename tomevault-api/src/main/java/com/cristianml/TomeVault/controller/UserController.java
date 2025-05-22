package com.cristianml.TomeVault.controller;

import com.cristianml.TomeVault.dto.request.ChangePasswordRequestDTO;
import com.cristianml.TomeVault.dto.request.UserProfileUpdateRequestDTO;
import com.cristianml.TomeVault.dto.response.UserProfileResponseDTO;
import com.cristianml.TomeVault.entity.UserEntity;
import com.cristianml.TomeVault.security.config.CustomUserDetails;
import com.cristianml.TomeVault.security.dto.AuthResponse;
import com.cristianml.TomeVault.service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponseDTO> getUserProfile(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        UserProfileResponseDTO userProfileResponseDTO = this.userService.getUserProfile(customUserDetails.getUserEntity());
        return ResponseEntity.ok(userProfileResponseDTO);
    }

    @PutMapping("/update")
    public ResponseEntity<AuthResponse> updateUser(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                   @RequestBody @Valid UserProfileUpdateRequestDTO updateRequestDTO) {
        AuthResponse authResponse = this.userService.updateUserProfile(customUserDetails.getUserEntity(), updateRequestDTO);
        return ResponseEntity.ok(authResponse);
    }

    @PutMapping("change-password")
    public ResponseEntity<AuthResponse> changePassword(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                       @RequestBody @Valid ChangePasswordRequestDTO passwordRequestDTO) {
        AuthResponse authResponse = this.userService.changePassword(customUserDetails.getUserEntity(), passwordRequestDTO);
        return ResponseEntity.ok(authResponse);
    }
}
