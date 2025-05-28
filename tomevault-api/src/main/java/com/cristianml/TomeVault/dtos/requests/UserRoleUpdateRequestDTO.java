package com.cristianml.TomeVault.dtos.requests;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UserRoleUpdateRequestDTO {

    @NotEmpty(message = "At least one role must be specified")
    private List<String> roleNames;

}
