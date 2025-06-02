package com.cristianml.TomeVault.dtos.responses;

import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String firstname;
    private String lastname;
    private String address;
    private LocalDate birthDate;
    private Set<String> roles;
    private boolean enabled;
}
