package com.cristianml.TomeVault.mapper;

import com.cristianml.TomeVault.dto.request.WishlistBookRequestDTO;
import com.cristianml.TomeVault.dto.response.WishlistBookResponseDTO;
import com.cristianml.TomeVault.entity.WishlistBookEntity;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@AllArgsConstructor
public class WishlistBookMapper {

    private final ModelMapper modelMapper;

    public WishlistBookEntity toEntity(WishlistBookRequestDTO wishlistBookRequestDTO) {
        return modelMapper.map(wishlistBookRequestDTO, WishlistBookEntity.class);
    }

    public WishlistBookResponseDTO toResponseDTO(WishlistBookEntity wishlistBookEntity) {
        return modelMapper.map(wishlistBookEntity, WishlistBookResponseDTO.class);
    }

    public List<WishlistBookResponseDTO> wishlistBookResponseDTOList(List<WishlistBookEntity> wishlistBookEntityList) {
        return wishlistBookEntityList.stream()
                .map(this::toResponseDTO)
                .toList();
    }

}
