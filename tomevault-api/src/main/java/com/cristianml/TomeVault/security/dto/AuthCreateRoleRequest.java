package com.cristianml.TomeVault.security.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Validated
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthCreateRoleRequest {

    @Size(max = 3, message = "The user cannot have more than 3 roles.")
    private List<String> roleListName;
}



