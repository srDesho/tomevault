package com.cristianml.TomeVault.service;

import com.cristianml.TomeVault.dto.google.GoogleBookItem;
import com.cristianml.TomeVault.exception.ResourceNotFoundException;

import java.util.List;

public interface IGoogleBooksIntegrationService {

    List<GoogleBookItem> searchBooks(String query);
    GoogleBookItem getBookById(String googleBookId) throws ResourceNotFoundException;

}
