package com.cristianml.TomeVault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookResponseDTO {
    private Long id;
    private String googleBookId;
    private String title;
    private String author;
    private String description;
    private String thumbnail;
    private List<String> tags;
    private LocalDate addedAt;
    private LocalDate finishedAt;
    private Integer readCount;
    private boolean isActive;
}
