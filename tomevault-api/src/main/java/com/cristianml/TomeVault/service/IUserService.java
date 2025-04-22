package com.cristianml.TomeVault.service;

import com.cristianml.TomeVault.dto.request.UserRequestDTO;
import com.cristianml.TomeVault.dto.response.UserResponseDTO;
import com.cristianml.TomeVault.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IUserService {

    UserResponseDTO createUser(UserRequestDTO userRequestDTO);
    UserResponseDTO getUserById(Long id);
    Page<UserResponseDTO> getAllUsers(Pageable pageable);
    UserResponseDTO updateUser(Long id, UserRequestDTO userRequestDTO);
    void deleteUserById(Long id);
    UserResponseDTO getCurrentUser(UserEntity userEntity);

}
