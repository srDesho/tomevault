package com.cristianml.TomeVault.services;

import com.cristianml.TomeVault.dtos.requests.UserRegistrationRequestDTO;
import com.cristianml.TomeVault.security.dtos.AuthLoginRequest;
import com.cristianml.TomeVault.security.dtos.AuthResponse;

public interface IAuthService {

    AuthResponse loginUser(AuthLoginRequest request);
    AuthResponse registerUser(UserRegistrationRequestDTO request);

}
