package com.cristianml.TomeVault.services;

import com.cristianml.TomeVault.dtos.requests.ChangePasswordRequestDTO;
import com.cristianml.TomeVault.dtos.requests.UserProfileUpdateRequestDTO;
import com.cristianml.TomeVault.dtos.responses.UserProfileResponseDTO;
import com.cristianml.TomeVault.entities.UserEntity;
import com.cristianml.TomeVault.security.dtos.AuthResponse;

public interface IUserService {

    UserProfileResponseDTO getUserProfile(UserEntity user);
    AuthResponse updateUserProfile(UserEntity user, UserProfileUpdateRequestDTO requestDTO);
    AuthResponse changePassword(UserEntity user, ChangePasswordRequestDTO requestDTO);

}
