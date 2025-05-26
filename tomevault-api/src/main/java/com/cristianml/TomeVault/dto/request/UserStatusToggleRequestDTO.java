package com.cristianml.TomeVault.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStatusToggleRequestDTO {

    @NotNull(message = "Enabled status is required")
    private Boolean enabled;

}
