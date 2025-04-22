package com.cristianml.TomeVault.mapper;

import com.cristianml.TomeVault.dto.request.UserRequestDTO;
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
        modelMapper.typeMap(UserRequestDTO.class, UserEntity.class)
                .addMappings(mapper -> {
                   mapper.skip(UserEntity::setId);
                   mapper.skip(UserEntity::setPassword);
                   mapper.skip(UserEntity::setRoleList);
                   mapper.skip(UserEntity::setEnabled);
                   mapper.skip(UserEntity::setAccountNonExpired);
                   mapper.skip(UserEntity::setAccountNonLocked);
                   mapper.skip(UserEntity::setCredentialsNonExpired);
                });
    }

    // to entity
    public UserEntity toEntity(UserRequestDTO requestDTO) {
        return modelMapper.map(requestDTO, UserEntity.class);
    }

    // to Response
    public UserResponseDTO toResponse(UserEntity user) {
        return modelMapper.map(user, UserResponseDTO.class);
    }

}
