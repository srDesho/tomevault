package com.cristianml.TomeVault.dtos.google;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class VolumeInfo {

    private String title;
    private List<String> authors;
    private String description;
    private List<String> categories;
    @JsonProperty("imageLinks")
    private ImageLinks imageLinks;

}
