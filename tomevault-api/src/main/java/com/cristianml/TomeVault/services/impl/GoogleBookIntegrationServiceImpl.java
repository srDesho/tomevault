package com.cristianml.TomeVault.services.impl;

import com.cristianml.TomeVault.dtos.google.GoogleBookItem;
import com.cristianml.TomeVault.dtos.google.GoogleBooksResponse;
import com.cristianml.TomeVault.exceptions.BookNotFoundException;
import com.cristianml.TomeVault.services.IGoogleBooksIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

// Handles integration with Google Books API for searching and fetching book data
@Service
@RequiredArgsConstructor
public class GoogleBookIntegrationServiceImpl implements IGoogleBooksIntegrationService {

    private final RestTemplate restTemplate;

    // Google Books API base URL from application properties
    @Value("${app.google-books.url}")
    private String apiUrl;

    // Google Books API key from application properties
    @Value("${app.google-books.key}")
    private String apiKey;

    // Search for books using Google Books API with a query string
    @Override
    public List<GoogleBookItem> searchBooks(String query) {
        String url = buildSearchUrl(query);
        GoogleBooksResponse response = restTemplate.getForObject(url, GoogleBooksResponse.class);

        // Simple debug to check result count
        int itemCount = 0;
        if (response != null && response.getItems() != null) {
            itemCount = response.getItems().size();
        }

        return Optional.ofNullable(response)
                .map(GoogleBooksResponse::getItems)
                .orElse(Collections.emptyList());
    }

    // Get detailed information for a specific book by its Google Books ID
    @Override
    public GoogleBookItem getBookById(String googleBookId) throws BookNotFoundException {
        // Validate the Google Book ID before making the API call
        if (googleBookId == null || googleBookId.trim().isEmpty() || "null".equalsIgnoreCase(googleBookId.trim())) {
            throw new IllegalArgumentException("Google Book ID no puede ser nulo, vacío o la cadena 'null'.");
        }

        // Build URL for fetching a specific book by ID
        String url = UriComponentsBuilder.fromHttpUrl(apiUrl)
                .pathSegment(googleBookId) // Append the book ID as path segment
                .queryParam("key", apiKey) // Add API key for authentication
                .build()
                .toUriString();

        // Fetch the book data from Google Books API
        GoogleBookItem googleBook = restTemplate.getForObject(url, GoogleBookItem.class);

        // Verify we got a valid response with matching ID
        if (googleBook == null || googleBook.getId() == null || !googleBook.getId().equals(googleBookId)) {
            throw new BookNotFoundException("Book not found in Google Book.");
        }

        return googleBook;
    }

    // Build the search URL with query parameters for Google Books API
    private String buildSearchUrl(String query) {
        return UriComponentsBuilder.fromHttpUrl(apiUrl)
                .queryParam("q", query) // Search query
                .queryParam("key", apiKey) // API key
                .queryParam("maxResults", 20) // Limit to 20 results per request
                //.queryParam("langRestrict", "es") // Uncomment to restrict to Spanish language books
                .build()
                .toUriString();
    }
}