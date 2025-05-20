package com.cristianml.TomeVault.service;

import com.cristianml.TomeVault.dto.request.UserRegistrationRequestDTO;
import com.cristianml.TomeVault.security.dto.AuthLoginRequest;
import com.cristianml.TomeVault.security.dto.AuthResponse;

public interface IAuthService {

    AuthResponse loginUser(AuthLoginRequest request);
    AuthResponse registerUser(UserRegistrationRequestDTO request);

}
