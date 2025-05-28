package com.cristianml.TomeVault.services;

import com.cristianml.TomeVault.dtos.google.GoogleBookItem;
import com.cristianml.TomeVault.exceptions.ResourceNotFoundException;

import java.util.List;

public interface IGoogleBooksIntegrationService {

    List<GoogleBookItem> searchBooks(String query);
    GoogleBookItem getBookById(String googleBookId) throws ResourceNotFoundException;

}
