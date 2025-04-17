package com.cristianml.TomeVault.mapper;

import com.cristianml.TomeVault.dto.request.BookRequestDTO;
import com.cristianml.TomeVault.dto.response.BookResponseDTO;
import com.cristianml.TomeVault.entity.BookEntity;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class BookMapper {

    private final ModelMapper modelMapper;

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

}
