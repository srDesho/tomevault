package com.cristianml.TomeVault.dto.google;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class GoogleBookItem {

    private String id;
    @JsonProperty("volumeInfo")
    private VolumeInfo volumeInfo;

}
