package com.cristianml.TomeVault.exceptions;

public class BookAlreadyExistsException extends RuntimeException{

    public BookAlreadyExistsException() {
        super("The book already exists in the system.");
    }

    public BookAlreadyExistsException(String message) {
        super(message);
    }

}
