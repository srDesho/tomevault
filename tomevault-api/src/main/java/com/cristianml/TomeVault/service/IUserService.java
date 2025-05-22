package com.cristianml.TomeVault.service;

import com.cristianml.TomeVault.dto.request.ChangePasswordRequestDTO;
import com.cristianml.TomeVault.dto.request.UserProfileUpdateRequestDTO;
import com.cristianml.TomeVault.dto.response.UserProfileResponseDTO;
import com.cristianml.TomeVault.entity.UserEntity;
import com.cristianml.TomeVault.security.dto.AuthResponse;

public interface IUserService {

    UserProfileResponseDTO getUserProfile(UserEntity user);
    AuthResponse updateUserProfile(UserEntity user, UserProfileUpdateRequestDTO requestDTO);
    AuthResponse changePassword(UserEntity user, ChangePasswordRequestDTO requestDTO);

}
