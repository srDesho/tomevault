package com.cristianml.TomeVault.mappers;

import com.cristianml.TomeVault.dtos.google.GoogleBookItem;
import com.cristianml.TomeVault.dtos.requests.BookRequestDTO;
import com.cristianml.TomeVault.dtos.responses.BookResponseDTO;
import com.cristianml.TomeVault.entities.BookEntity;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional; // Importa Optional

@Component
@RequiredArgsConstructor
public class BookMapper {

    private final ModelMapper modelMapper;

    // Configuración personalizada de mapeos después de la construcción del bean.
    @PostConstruct
    public void configureMappings() {
        // Mapeo especial de GoogleBookItem a BookEntity.
        modelMapper.typeMap(GoogleBookItem.class, BookEntity.class)
                .addMappings(mapper -> {
                    // Mapea el ID de GoogleBookItem al googleBookId de BookEntity.
                    mapper.map(GoogleBookItem::getId, BookEntity::setGoogleBookId);

                    // Mapea el título, manejando el caso donde getVolumeInfo() podría ser nulo.
                    mapper.map(src -> Optional.ofNullable(src.getVolumeInfo())
                                    .map(v -> v.getTitle())
                                    .orElse(null), // Si es nulo, el título será null.
                            BookEntity::setTitle);

                    // Mapea los autores, manejando nulos en VolumeInfo y en la lista de autores.
                    // Si la lista de autores está vacía, String.join devolverá una cadena vacía.
                    mapper.map(src -> Optional.ofNullable(src.getVolumeInfo())
                                    .map(v -> v.getAuthors())
                                    .filter(authors -> authors != null && !authors.isEmpty()) // Asegura que la lista no sea nula ni vacía
                                    .map(authors -> String.join(", ", authors))
                                    .orElse(null), // Si es nulo o vacío, el autor será null.
                            BookEntity::setAuthor);

                    // Mapea la descripción, manejando el caso donde getVolumeInfo() podría ser nulo.
                    mapper.map(src -> Optional.ofNullable(src.getVolumeInfo())
                                    .map(v -> v.getDescription())
                                    .orElse(null),
                            BookEntity::setDescription);

                    // Mapea el thumbnail, manejando nulos en VolumeInfo e ImageLinks.
                    mapper.map(src -> Optional.ofNullable(src.getVolumeInfo())
                                    .map(v -> v.getImageLinks())
                                    .map(il -> il.getThumbnail())
                                    .orElse(null), // Si es nulo, el thumbnail será null.
                            BookEntity::setThumbnail);

                    // Mapea las categorías a tags, manejando nulos en VolumeInfo y en la lista de categorías.
                    mapper.map(src -> Optional.ofNullable(src.getVolumeInfo())
                                    .map(v -> v.getCategories())
                                    .filter(categories -> categories != null && !categories.isEmpty()) // Asegura que la lista no sea nula ni vacía
                                    .orElse(null), // Si es nulo o vacío, los tags serán null.
                            BookEntity::setTags)
                    ;

                    // Ignora el mapeo de estos campos desde GoogleBookItem, ya que se gestionan por separado.
                    mapper.skip(BookEntity::setId);
                    mapper.skip(BookEntity::setUser);
                    mapper.skip(BookEntity::setFinishedAt);
                    // Considera también saltar createdAt y updatedAt si no vienen de GoogleBookItem
                    mapper.skip(BookEntity::setAddedAt);
                    mapper.skip(BookEntity::setReadCount);
                    mapper.skip(BookEntity::setActive);
                    // mapper.skip(BookEntity::setUpdatedAt);
                });
    }

    // Convierte un BookRequestDTO a BookEntity.
    public BookEntity toEntity(BookRequestDTO dto) {
        return modelMapper.map(dto, BookEntity.class);
    }

    // Convierte un BookEntity a BookResponseDTO.
    public BookResponseDTO toResponseDTO(BookEntity bookEntity) {
        return modelMapper.map(bookEntity, BookResponseDTO.class);
    }

    // Convierte una lista de BookEntity a una lista de BookResponseDTO.
    public List<BookResponseDTO> toBookResponseDTOList(List<BookEntity> bookList) {
        return bookList.stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Convierte un GoogleBookItem a BookEntity.
    public BookEntity toEntity(GoogleBookItem googleBookItem) {
        // Este mapeo utiliza la configuración definida en configureMappings().
        return modelMapper.map(googleBookItem, BookEntity.class);
    }

    // Convierte una Page de BookEntity a una Page de BookResponseDTO.
    public Page<BookResponseDTO> toResponseDTOPage(Page<BookEntity> page) {
        return page.map(this::toResponseDTO);
    }

    // Actualiza una entidad existente a partir de un DTO.
    public void updateFromDTO(BookResponseDTO dto, BookEntity entity) {
        modelMapper.map(dto, entity);
    }
}