package com.cristianml.TomeVault.security.dto;

import jakarta.validation.Valid;
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
public class AuthCreateUserRequest {

    @NotBlank
    private String username;
    @NotBlank
    private String password;
    @Valid
    private AuthCreateRoleRequest roleRequest;

}
