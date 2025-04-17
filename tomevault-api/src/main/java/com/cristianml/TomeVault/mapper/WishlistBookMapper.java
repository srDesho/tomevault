package com.cristianml.TomeVault.mapper;

import com.cristianml.TomeVault.dto.google.GoogleBookItem;
import com.cristianml.TomeVault.dto.request.WishlistBookRequestDTO;
import com.cristianml.TomeVault.dto.response.WishlistBookResponseDTO;
import com.cristianml.TomeVault.entity.WishlistBookEntity;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@AllArgsConstructor
public class WishlistBookMapper {

    private final ModelMapper modelMapper;

    @PostConstruct
    public void configureMappings() {
        // GoogleBookItem → WishlistEntity
        modelMapper.typeMap(GoogleBookItem.class, WishlistBookEntity.class)
                .addMappings(mapper -> {
                    mapper.map(GoogleBookItem::getId, WishlistBookEntity::setGoogleBookId);
                    mapper.map(src -> src.getVolumeInfo().getTitle(), WishlistBookEntity::setTitle);
                    mapper.map(src -> String.join(", ", src.getVolumeInfo().getAuthors()), WishlistBookEntity::setAuthor);
                    mapper.map(src -> src.getVolumeInfo().getDescription(), WishlistBookEntity::setDescription);
                    mapper.map(src -> src.getVolumeInfo().getImageLinks() != null ?
                            src.getVolumeInfo().getImageLinks().getThumbnail() : null, WishlistBookEntity::setThumbnail);
                    mapper.map(src -> src.getVolumeInfo().getCategories(), WishlistBookEntity::setTags);
                    mapper.skip(WishlistBookEntity::setId);
                    mapper.skip(WishlistBookEntity::setUser);
                    mapper.skip(WishlistBookEntity::setAddedAt);

                });
    }

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
