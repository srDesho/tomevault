package com.cristianml.TomeVault.dtos.google;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GoogleBooksResponse {

    @JsonPropertyOrder("items")
    private List<GoogleBookItem> items;

}
