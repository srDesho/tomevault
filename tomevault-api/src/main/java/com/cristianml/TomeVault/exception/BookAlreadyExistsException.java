package com.cristianml.TomeVault.exception;

public class BookAlreadyExistsException extends RuntimeException{

    public BookAlreadyExistsException() {
        super("The book already exists in the system.");
    }

    public BookAlreadyExistsException(String message) {
        super(message);
    }

}
