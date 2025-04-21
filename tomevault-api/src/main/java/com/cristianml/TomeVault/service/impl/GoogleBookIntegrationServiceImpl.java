package com.cristianml.TomeVault.service.impl;

import com.cristianml.TomeVault.dto.google.GoogleBookItem;
import com.cristianml.TomeVault.dto.google.GoogleBooksResponse;
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

    // Injects RestTemplate, used to make HTTP requests to the Google Books API.
    private final RestTemplate restTemplate;

    // Injects the base API URL from application.properties/yml.
    @Value("${app.google-books.url}")
    private String apiUrl;

    // Injects the Google Books API key from application.properties/yml.
    @Value("${app.google-books.key}")
    private String apiKey;

    /**
     * Searches for books on the Google Books API.
     * @param query The search query string.
     * @return A list of GoogleBookItem results, or an empty list if none found.
     */
    @Override
    public List<GoogleBookItem> searchBooks(String query) {
        // Builds the complete API URL for the search query.
        String url = buildSearchUrl(query);
        // Executes GET request and maps the JSON response to GoogleBooksResponse DTO.
        GoogleBooksResponse response = restTemplate.getForObject(url, GoogleBooksResponse.class);

        // Safely extracts the list of book items from the response, handling nulls.
        return Optional.ofNullable(response)
                .map(GoogleBooksResponse::getItems) // Assumes GoogleBooksResponse has getItems()
                .orElse(Collections.emptyList()); // Returns empty list if response or items are null.
    }

    /**
     * Retrieves a single book by its Google Books ID.
     * @param googleBookId The unique ID of the book in Google Books.
     * @return The GoogleBookItem representing the found book.
     * @throws ResourceNotFoundException If the book is not found.
     */
    @Override
    public GoogleBookItem getBookById(String googleBookId) throws ResourceNotFoundException {
        // Builds the URL for ID-based search (Google API uses "id:").
        String url = buildSearchUrl("id:" + googleBookId);
        // Executes GET request and maps response.
        GoogleBooksResponse response = restTemplate.getForObject(url, GoogleBooksResponse.class);

        // Safely extracts the first book item from the response.
        return Optional.ofNullable(response)
                .map(GoogleBooksResponse::getItems) // Gets list of items.
                .flatMap(items -> items.stream().findFirst()) // Finds the first item in the list.
                .orElseThrow(() -> new ResourceNotFoundException("Book not found in Google Book.")); // Throws exception if no book found.
    }

    /**
     * Private helper method to construct the full URL for Google Books API requests.
     * Includes common parameters like query, API key, max results, and language restriction.
     *
     * @param query The search query or "id:bookId".
     * @return The complete URL string.
     */
    private String buildSearchUrl(String query) {
        // Uses UriComponentsBuilder for robust URL construction.
        return UriComponentsBuilder.fromHttpUrl(apiUrl)
                .queryParam("q", query) // Adds the main query parameter.
                .queryParam("key", apiKey) // Adds the API key parameter.
                .queryParam("maxResults", 20) // Limits results to 20 per request.
                .queryParam("langRestrict", "es") // Restricts results to Spanish language books.
                .build() // Builds the URI components.
                .toUriString(); // Converts to final URL string.
    }
}
