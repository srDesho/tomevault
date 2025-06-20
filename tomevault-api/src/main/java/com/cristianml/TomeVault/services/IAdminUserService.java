package com.cristianml.TomeVault.services;

import com.cristianml.TomeVault.dtos.requests.UserCreateRequestDTO;
import com.cristianml.TomeVault.dtos.requests.UserProfileUpdateRequestDTO;
import com.cristianml.TomeVault.dtos.responses.UserProfileResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;


public interface IAdminUserService {


    UserProfileResponseDTO getUserById(Long id);

    Page<UserProfileResponseDTO> getAllUsers(Pageable pageable);

    UserProfileResponseDTO createUser(UserCreateRequestDTO userCreateRequestDTO);

    UserProfileResponseDTO updateUser(Long id, UserProfileUpdateRequestDTO userUpdateRequestDTO);

    void softDeleteUserById(Long id);

    void hardDeleteUserById(Long id);

    UserProfileResponseDTO updateUserRoles(Long userId, List<String> newRoleNames);

    UserProfileResponseDTO resetUserPassword(Long userId, String newRawPassword);

    UserProfileResponseDTO toggleUserStatus(Long userId, boolean enabled);

    Page<UserProfileResponseDTO> searchUsers(String query, Pageable pageable);
}