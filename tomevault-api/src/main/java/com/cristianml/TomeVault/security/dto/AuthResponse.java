package com.cristianml.TomeVault.security.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

@JsonPropertyOrder({"username", "message", "jwt", "status"})
public class AuthResponse {

    private String username;
    private String message;
    private String jwt;
    private boolean status;

}
