package com.cristianml.TomeVault.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishlistBookRequestDTO {
    private String googleBookId;
    private String title;
    private String author;
    private String description;
    private String thumbnail;
}
