package com.cristianml.TomeVault.utilities;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class Utilities {

    public Utilities() {}
    /**
     * Custom method to format a ResponseEntity with a standardized structure.
     * This is a generic method that can handle any type of object and returns
     * a customized HTTP response.
     *
     * @param status  The HTTP status code to be returned in the response
     * @param mensaje The message to be included in the response
     * @return ResponseEntity<Object> A formatted response containing a Map with timestamp, status, and message
     */
    public static ResponseEntity<Object> generateResponse(HttpStatus status, String mensaje) {
        // Initialize a HashMap to structure the JSON response
        Map<String, Object> map = new HashMap<String, Object>();

        try {
            if (status == null) {
                throw new NullPointerException("Status cannot be null");
            }

            // Populate the map with standard response fields
            map.put("fecha", new Date());     // Add current timestamp
            map.put("status", status);        // Add HTTP status
            map.put("mensaje", mensaje);      // Add message
            // Additional key-value pairs can be added to the map as needed

            // Return a new ResponseEntity with the populated map and specified HTTP status
            return new ResponseEntity<Object>(map, status);

        } catch (Exception e) {
            // Error handling block
            map.clear();    // Clear any previously added entries in case of error

            // Populate the map with error response fields
            map.put("fecha", new Date());
            map.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            map.put("mensaje", e.getMessage());
            // Additional error-related fields can be added to the map as needed

            // Return a new ResponseEntity with the error information
            return new ResponseEntity<Object>(map, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
