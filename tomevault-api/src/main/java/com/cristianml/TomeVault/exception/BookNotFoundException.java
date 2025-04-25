package com.cristianml.TomeVault.exception;

public class BookNotFoundException extends ResourceNotFoundException{

    public BookNotFoundException() {
        super("Book not found exception");
    }

    public BookNotFoundException(String message) {
        super(message);
    }

}
