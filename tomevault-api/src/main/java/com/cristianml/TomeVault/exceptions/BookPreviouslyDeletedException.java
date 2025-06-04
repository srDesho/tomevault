package com.cristianml.TomeVault.exceptions;

public class BookPreviouslyDeletedException extends RuntimeException{
    public BookPreviouslyDeletedException() {
        super("Book was previously deleted. Please use activate endpoint.");
    }

    public BookPreviouslyDeletedException(String message) {
        super(message);
    }

}
