package com.cristianml.TomeVault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishlistBookResponseDTO {

    private String title;
    private String author;
    private String description;
    private String thumbnail;

}
