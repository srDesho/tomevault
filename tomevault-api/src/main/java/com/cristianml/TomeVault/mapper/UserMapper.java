package com.cristianml.TomeVault.mapper;

import com.cristianml.TomeVault.dto.request.UserProfileUpdateRequestDTO;
import com.cristianml.TomeVault.dto.request.UserRegistrationRequestDTO;
import com.cristianml.TomeVault.dto.request.UserRequestDTO;
import com.cristianml.TomeVault.dto.response.UserProfileResponseDTO;
import com.cristianml.TomeVault.dto.response.UserResponseDTO;
import com.cristianml.TomeVault.entity.UserEntity;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final ModelMapper modelMapper;

    // Custom
    @PostConstruct
    public void configureMappings() {
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

        modelMapper.typeMap(UserProfileUpdateRequestDTO.class, UserEntity.class)
                .addMappings(mapper -> {
                    mapper.skip(UserEntity::setId);
                    mapper.skip(UserEntity::setUsername);
                    mapper.skip(UserEntity::setPassword);
                    mapper.skip(UserEntity::setRoleList);
                    mapper.skip(UserEntity::setEnabled);
                    mapper.skip(UserEntity::setAccountNonExpired);
                    mapper.skip(UserEntity::setAccountNonLocked);
                    mapper.skip(UserEntity::setCredentialsNonExpired);
                });

        modelMapper.typeMap(UserEntity.class, UserProfileResponseDTO.class)
                .addMappings(mapper -> {
                    mapper.skip(UserProfileResponseDTO::setUsername);
                });


    }

    // to entity
    public UserEntity toEntity(UserRegistrationRequestDTO  requestDTO) {
        return modelMapper.map(requestDTO, UserEntity.class);
    }

    // Maps a UserProfileUpdateRequestDTO to an existing UserEntity.
    public void updateEntityFromDto(UserProfileUpdateRequestDTO updateRequestDTO, UserEntity existingUser) {
        modelMapper.map(updateRequestDTO, existingUser);
    }

    // toProfileResponse
    public UserProfileResponseDTO toProfileResponse(UserEntity user) {
        return modelMapper.map(user, UserProfileResponseDTO.class);
    }

}
