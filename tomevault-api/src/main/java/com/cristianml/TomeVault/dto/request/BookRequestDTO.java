package com.cristianml.TomeVault.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookRequestDTO {
    private String googleBookId;
    private String title;
    private String author;
    private String description;
    private String thumbnail;
}
