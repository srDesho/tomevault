/**
 * Service implementation for integrating with the Google Books API.
 * This class handles searching for books and retrieving book details by ID from Google Books.
 */
package com.cristianml.TomeVault.service.impl;

import com.cristianml.TomeVault.dto.google.GoogleBookItem;
import com.cristianml.TomeVault.dto.google.GoogleBooksResponse;
import com.cristianml.TomeVault.exception.BookNotFoundException;
import com.cristianml.TomeVault.exception.ResourceNotFoundException;
import com.cristianml.TomeVault.service.IGoogleBooksIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GoogleBookIntegrationServiceImpl implements IGoogleBooksIntegrationService {

    private final RestTemplate restTemplate;

    // Injects the Google Books API base URL from application properties.
    @Value("${app.google-books.url}")
    private String apiUrl;

    // Injects the Google Books API key from application properties.
    @Value("${app.google-books.key}")
    private String apiKey;

    /**
     * Searches for books on the Google Books API.
     */
    @Override
    public List<GoogleBookItem> searchBooks(String query) {
        String url = buildSearchUrl(query);
        GoogleBooksResponse response = restTemplate.getForObject(url, GoogleBooksResponse.class);

        return Optional.ofNullable(response)
                .map(GoogleBooksResponse::getItems)
                .orElse(Collections.emptyList());
    }

    /**
     * Retrieves a single book by its Google Books ID.
     */
    @Override
    public GoogleBookItem getBookById(String googleBookId) throws BookNotFoundException {

        if (googleBookId == null || googleBookId.trim().isEmpty() || "null".equalsIgnoreCase(googleBookId.trim())) {
            throw new IllegalArgumentException("Google Book ID no puede ser nulo, vacío o la cadena 'null'.");
        }

        // Constructs the URL specifically for retrieving a single volume by ID.
        String url = UriComponentsBuilder.fromHttpUrl(apiUrl)
                .pathSegment(googleBookId) // Appends the ID as a path segment (e.g., /volumes/ID)
                .queryParam("key", apiKey) // Adds the API key as a query parameter
                .build()
                .toUriString();

        // Fetches the book directly as a GoogleBookItem, as the /volumes/{id} endpoint returns a single item structure.
        GoogleBookItem googleBook = restTemplate.getForObject(url, GoogleBookItem.class);

        // Validates if the book was successfully found and its ID matches the requested ID.
        if (googleBook == null || googleBook.getId() == null || !googleBook.getId().equals(googleBookId)) {
            throw new BookNotFoundException("Book not found in Google Book.");
        }

        return googleBook;
    }

    /**
     * Helper method to construct the URL for Google Books API search requests.
     */
    private String buildSearchUrl(String query) {
        return UriComponentsBuilder.fromHttpUrl(apiUrl)
                .queryParam("q", query)
                .queryParam("key", apiKey)
                .queryParam("maxResults", 20) // Limits the number of results per search.
                .queryParam("langRestrict", "es") // Restricts results to Spanish language.
                .build()
                .toUriString();
    }
}