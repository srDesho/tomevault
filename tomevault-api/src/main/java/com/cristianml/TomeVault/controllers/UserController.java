package com.cristianml.TomeVault.controllers;

import com.cristianml.TomeVault.dtos.requests.ChangePasswordRequestDTO;
import com.cristianml.TomeVault.dtos.requests.UserProfileUpdateRequestDTO;
import com.cristianml.TomeVault.dtos.responses.UserProfileResponseDTO;
import com.cristianml.TomeVault.security.config.CustomUserDetails;
import com.cristianml.TomeVault.security.dtos.AuthResponse;
import com.cristianml.TomeVault.services.IUserService;
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
