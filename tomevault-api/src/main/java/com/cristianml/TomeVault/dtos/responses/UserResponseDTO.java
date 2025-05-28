package com.cristianml.TomeVault.dtos.responses;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UserResponseDTO {

    private Long id;
    private String username;
    private String firstname;
    private String lastname;
    private String email;
    private String address;
    private LocalDate birthDate;

}
