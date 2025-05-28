package com.cristianml.TomeVault.mappers;

import com.cristianml.TomeVault.dtos.requests.UserCreateRequestDTO;
import com.cristianml.TomeVault.dtos.requests.UserProfileUpdateRequestDTO;
import com.cristianml.TomeVault.dtos.requests.UserRegistrationRequestDTO;
import com.cristianml.TomeVault.dtos.responses.UserProfileResponseDTO;
import com.cristianml.TomeVault.entities.UserEntity;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final ModelMapper modelMapper;

    // Custom configuration for modelMapper
    @PostConstruct
    public void configureMappings() {
        // Configuration for UserRegistrationRequestDTO to UserEntity
        modelMapper.typeMap(UserRegistrationRequestDTO.class, UserEntity.class)
                .addMappings(mapper -> {
                   mapper.skip(UserEntity::setId);
                   mapper.skip(UserEntity::setPassword);
                   mapper.skip(UserEntity::setRoleList);
                   mapper.skip(UserEntity::setEnabled);
                   mapper.skip(UserEntity::setAccountNonExpired);
                   mapper.skip(UserEntity::setAccountNonLocked);
                   mapper.skip(UserEntity::setCredentialsNonExpired);
                });

        // Configuration for UserProfileUpdateRequestDTO to UserEntity
        modelMapper.typeMap(UserProfileUpdateRequestDTO.class, UserEntity.class)
                .addMappings(mapper -> {
                    mapper.skip(UserEntity::setId);
                    mapper.skip(UserEntity::setPassword);
                    mapper.skip(UserEntity::setRoleList);
                    mapper.skip(UserEntity::setEnabled);
                    mapper.skip(UserEntity::setAccountNonExpired);
                    mapper.skip(UserEntity::setAccountNonLocked);
                    mapper.skip(UserEntity::setCredentialsNonExpired);
                });
        // Configuration for UserCreateRequestDTO to UserEntity (for admin operations)
        modelMapper.typeMap(UserCreateRequestDTO.class, UserEntity.class)
                .addMappings(mapper -> {
                    mapper.skip(UserEntity::setId);
                    mapper.skip(UserEntity::setPassword);
                    mapper.skip(UserEntity::setRoleList);
                    mapper.skip(UserEntity::setEnabled);
                    mapper.skip(UserEntity::setAccountNonExpired);
                    mapper.skip(UserEntity::setAccountNonLocked);
                    mapper.skip(UserEntity::setCredentialsNonExpired);
                });
        // Configuration for UserEntity to UserProfileResponseDTO with custom role mapping
        modelMapper.typeMap(UserEntity.class, UserProfileResponseDTO.class)
                .addMappings(mapper -> {
                   mapper.skip(UserProfileResponseDTO::setRoles);
                });

    }

    // to entity from registration
    public UserEntity toEntity(UserRegistrationRequestDTO  requestDTO) {
        return modelMapper.map(requestDTO, UserEntity.class);
    }

    // to entity from admin create request
    public UserEntity toEntity(UserCreateRequestDTO userCreateRequestDTO) {
        return modelMapper.map(userCreateRequestDTO, UserEntity.class);
    }

    // Maps a UserProfileUpdateRequestDTO to an existing UserEntity.
    public void updateEntityFromDto(UserProfileUpdateRequestDTO updateRequestDTO, UserEntity existingUser) {
        modelMapper.map(updateRequestDTO, existingUser);
    }

    // toProfileResponse
    public UserProfileResponseDTO toProfileResponse(UserEntity user) {
        UserProfileResponseDTO responseDTO = modelMapper.map(user, UserProfileResponseDTO.class);

        // Manually map roles to string set for easy frontend consumption
        if (user.getRoleList() != null) {
            responseDTO.setRoles(user.getRoleList().stream()
                    .map(role -> role.getRoleEnum().name())
                    .collect(Collectors.toSet()));
        }
        return responseDTO;
    }

}
