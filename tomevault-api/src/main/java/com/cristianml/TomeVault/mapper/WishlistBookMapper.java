package com.cristianml.TomeVault.mapper;

import com.cristianml.TomeVault.dto.google.GoogleBookItem;
import com.cristianml.TomeVault.dto.request.WishlistBookRequestDTO;
import com.cristianml.TomeVault.dto.response.WishlistBookResponseDTO;
import com.cristianml.TomeVault.entity.WishlistBookEntity;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;

import java.util.Optional; // Importa Optional

@Component
@AllArgsConstructor // Si usas @AllArgsConstructor, asegúrate de que ModelMapper sea el único campo.
// Si tienes más campos y solo ModelMapper es 'final', @RequiredArgsConstructor es más preciso.
public class WishlistBookMapper {

    private final ModelMapper modelMapper;

    @PostConstruct
    public void configureMappings() {
        // Mapeo de GoogleBookItem a WishlistBookEntity.
        modelMapper.typeMap(GoogleBookItem.class, WishlistBookEntity.class)
                .addMappings(mapper -> {
                    // Mapea el ID de GoogleBookItem al googleBookId de WishlistBookEntity.
                    mapper.map(GoogleBookItem::getId, WishlistBookEntity::setGoogleBookId);

                    // Mapea el título, manejando el caso donde getVolumeInfo() podría ser nulo.
                    mapper.map(src -> Optional.ofNullable(src.getVolumeInfo())
                                    .map(v -> v.getTitle())
                                    .orElse(null),
                            WishlistBookEntity::setTitle);

                    // Mapea los autores, manejando nulos en VolumeInfo y en la lista de autores.
                    mapper.map(src -> Optional.ofNullable(src.getVolumeInfo())
                                    .map(v -> v.getAuthors())
                                    .filter(authors -> authors != null && !authors.isEmpty())
                                    .map(authors -> String.join(", ", authors))
                                    .orElse(null),
                            WishlistBookEntity::setAuthor);

                    // Mapea la descripción, manejando el caso donde getVolumeInfo() podría ser nulo.
                    mapper.map(src -> Optional.ofNullable(src.getVolumeInfo())
                                    .map(v -> v.getDescription())
                                    .orElse(null),
                            WishlistBookEntity::setDescription);

                    // Mapea el thumbnail, manejando nulos en VolumeInfo e ImageLinks.
                    mapper.map(src -> Optional.ofNullable(src.getVolumeInfo())
                                    .map(v -> v.getImageLinks())
                                    .map(il -> il.getThumbnail())
                                    .orElse(null),
                            WishlistBookEntity::setThumbnail);

                    // Mapea las categorías a tags, manejando nulos en VolumeInfo y en la lista de categorías.
                    mapper.map(src -> Optional.ofNullable(src.getVolumeInfo())
                                    .map(v -> v.getCategories())
                                    .filter(categories -> categories != null && !categories.isEmpty())
                                    .orElse(null),
                            WishlistBookEntity::setTags);

                    // Ignora el mapeo de estos campos desde GoogleBookItem.
                    mapper.skip(WishlistBookEntity::setId);
                    mapper.skip(WishlistBookEntity::setUser);
                    mapper.skip(WishlistBookEntity::setAddedAt); // Asumo que este campo se establece en el servicio.
                    // Considera también saltar createdAt/updatedAt si no vienen de GoogleBookItem
                    // mapper.skip(WishlistBookEntity::setCreatedAt);
                    // mapper.skip(WishlistBookEntity::setUpdatedAt);
                });
    }

    // Convierte un WishlistBookRequestDTO a WishlistBookEntity.
    public WishlistBookEntity toEntity(WishlistBookRequestDTO wishlistBookRequestDTO) {
        return modelMapper.map(wishlistBookRequestDTO, WishlistBookEntity.class);
    }

    // Convierte un WishlistBookEntity a WishlistBookResponseDTO.
    public WishlistBookResponseDTO toResponseDTO(WishlistBookEntity wishlistBookEntity) {
        return modelMapper.map(wishlistBookEntity, WishlistBookResponseDTO.class);
    }

    // Convierte un GoogleBookItem a WishlistBookEntity.
    public WishlistBookEntity toEntity(GoogleBookItem googleBookItem) {
        // Este mapeo utiliza la configuración definida en configureMappings().
        return modelMapper.map(googleBookItem, WishlistBookEntity.class);
    }

    // Convierte una Page de WishlistBookEntity a una Page de WishlistBookResponseDTO.
    public Page<WishlistBookResponseDTO> wishlistBookResponseDTOList(Page<WishlistBookEntity> page) {
        return page.map(this::toResponseDTO);
    }

    // Convierte una lista de WishlistBookEntity a una lista de WishlistBookResponseDTO.
    public List<WishlistBookResponseDTO> wishlistBookResponseDTOList(List<WishlistBookEntity> wishlistBookEntityList) {
        return wishlistBookEntityList.stream()
                .map(this::toResponseDTO)
                .toList();
    }
}
