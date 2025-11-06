package com.cristianml.TomeVault.exceptions;

import org.springframework.core.NestedRuntimeException;

public class DataIntegrityViolationException extends NestedRuntimeException {

    public DataIntegrityViolationException(String message) {
        super(message);
    }
}
