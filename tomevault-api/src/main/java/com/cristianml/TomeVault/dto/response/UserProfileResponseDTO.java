package com.cristianml.TomeVault.dto.response;

import lombok.*;
import java.time.LocalDate;

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
}
