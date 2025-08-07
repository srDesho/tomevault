package com.cristianml.TomeVault.exceptions;

public class DemoLimitExceededException extends RuntimeException {
    public DemoLimitExceededException(String message) {
        super(message);
    }
}
