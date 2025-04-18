package com.cristianml.TomeVault.mapper;

import com.cristianml.TomeVault.dto.google.GoogleBookItem;
import com.cristianml.TomeVault.dto.request.BookRequestDTO;
import com.cristianml.TomeVault.dto.response.BookResponseDTO;
import com.cristianml.TomeVault.entity.BookEntity;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class BookMapper {

    private final ModelMapper modelMapper;

    // Custom configuration to mapper
    @PostConstruct
    public void configureMappings() {
        // Special mapping to GoogleBookItem -> BookEntity
        modelMapper.typeMap(GoogleBookItem.class, BookEntity.class)
                .addMappings(mapper -> {
                    mapper.map(GoogleBookItem::getId, BookEntity::setGoogleBookId);
                    mapper.map(src -> src.getVolumeInfo().getTitle(), BookEntity::setTitle);
                    mapper.map(src -> String.join(", ", src.getVolumeInfo().getAuthors()), BookEntity::setAuthor);
                    mapper.map(src -> src.getVolumeInfo().getDescription(), BookEntity::setDescription);
                    mapper.map(src -> src.getVolumeInfo().getImageLinks() != null ?
                            src.getVolumeInfo().getImageLinks().getThumbnail() : null, BookEntity::setThumbnail);
                    mapper.map(src -> src.getVolumeInfo().getCategories(), BookEntity::setTags);
                    mapper.skip(BookEntity::setId);
                    mapper.skip(BookEntity::setUser);
                    mapper.skip(BookEntity::setFinishedAt);
                });
    }

    // To entity
    public BookEntity toEntity(BookRequestDTO dto) {
        return modelMapper.map(dto, BookEntity.class);
    }

    // Method that converts an entity to dto
    public BookResponseDTO toResponseDTO(BookEntity bookEntity) {
        return modelMapper.map(bookEntity, BookResponseDTO.class);
    }

    // With a list
    public List<BookResponseDTO> toBookResponseDTOList(List<BookEntity> bookList) {
        return bookList.stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // to entity from GoogleBookItem
    public BookEntity toEntity(GoogleBookItem googleBookItem) {
        return modelMapper.map(googleBookItem, BookEntity.class);
    }

    // With page
    public Page<BookResponseDTO> toResponseDTOPage(Page<BookEntity> page) {
        return page.map(this::toResponseDTO);
    }

    public void updateFromDTO(BookResponseDTO dto, BookEntity entity) {
        modelMapper.map(dto, entity);
    }

}
