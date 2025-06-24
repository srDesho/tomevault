package com.cristianml.TomeVault.exceptions;

import org.springframework.security.core.AuthenticationException;

public class AccountDisabledException extends AuthenticationException {

    public AccountDisabledException() {
        super("User account has been disable.");
    }

    public AccountDisabledException(String message) {
        super(message);
    }

}
