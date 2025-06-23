package com.cristianml.TomeVault.security.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.validation.annotation.Validated;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Validated
public class AuthLoginRequest {

    @NotBlank(message = "Username or email is required")
    private String usernameOrEmail;
    @NotBlank(message = "Password is required")
    private String password;


}
