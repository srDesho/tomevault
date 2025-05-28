package com.cristianml.TomeVault.exceptions;

public class BookNotFoundException extends ResourceNotFoundException{

    public BookNotFoundException() {
        super("Book not found exception");
    }

    public BookNotFoundException(String message) {
        super(message);
    }

}
