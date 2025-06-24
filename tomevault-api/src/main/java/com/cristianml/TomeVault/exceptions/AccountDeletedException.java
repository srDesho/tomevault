package com.cristianml.TomeVault.exceptions;

import org.springframework.security.core.AuthenticationException;

public class AccountDeletedException extends AuthenticationException {

    public AccountDeletedException() {
        super("User account has benn deleted.");
    }

    public AccountDeletedException(String message) {
        super(message);
    }
}
