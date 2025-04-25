package com.cristianml.TomeVault.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookRequestDTO {
    private String googleBookId;
    private String title;
    private String author;
    private String description;
    private String thumbnail;
    private List<String> tags;
    private LocalDate finishedAt;
    private LocalDate addedAt;
}
