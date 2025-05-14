package com.cristianml.TomeVault.utilities;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

// Utility class for JWT (JSON Web Token) operations.
// Handles token creation, validation, and claim extraction.
@Component
public class JwtUtils {

    // Import Key and User
    @Value("${JWT_PRIVATE_KEY_TOME}")
    private String privateKey;

    @Value("${security.jwt.user.generator}")
    private String userGenerator;

    // Create a new JWT for authenticated User.
    public String createToken(Authentication authentication) {
        // Define the algorithm for signing the token using the private key.
        Algorithm algorithm = Algorithm.HMAC256(privateKey);

        // Extract the username (principal) from the Authentication Object
        String username = authentication.getPrincipal().toString();

        // Convert the user's granted authorities (roles and permissions) into a comma-separated string.
        String authorities = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        // Build the JWT with various claims (payload data) and sign it.
        String jwtToken = JWT.create()
                .withIssuer(this.userGenerator)
                .withSubject(username)
                .withClaim("authorities", authorities)
                .withIssuedAt(new Date()) // Timestamp when the token was issued
                // Token expiration time (e.g., 30 minutes from now)
                .withExpiresAt(new Date(System.currentTimeMillis() + 1800000)) // 30 minutes in milliseconds
                .withJWTId(UUID.randomUUID().toString())  // Unique ID for the JWT
                // Not-before time (token is not valid before this timestamp)
                .withNotBefore(new Date(System.currentTimeMillis()))
                .sign(algorithm);
        return jwtToken;
    }

    // Validates and decodes a given JWT.
    public DecodedJWT validateToken(String token) {
        try {
            // Re-create the algorithm using the same private key for verification.
            Algorithm algorithm = Algorithm.HMAC256(this.privateKey);

            // Build a JWT verifier with the required algorithm and issuer.
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer(userGenerator) // Must match the issuer set during token creation
                    .build();

            // Verify and decode the token. This throws an exception if validation fails.
            DecodedJWT decodedJWT = verifier.verify(token);
            return decodedJWT;

        } catch (JWTVerificationException e) {
            throw new JWTVerificationException("Token invalid or unauthorized: " + e.getMessage());
        }
    }

    // Extracts the subject (username) from a decoded JWT.
    public String extractUsername(DecodedJWT decodedJWT) {
        return decodedJWT.getSubject(); // Subject is typically the username
    }

    // Extracts a specific claim from a decoded JWT by its name.
    public Claim getSpecificClaim(DecodedJWT decodedJWT, String claimName) {
        return decodedJWT.getClaim(claimName);
    }

    // Returns all claims (payload data) from a decoded JWT.
    public Map<String, Claim> getAllClaims(DecodedJWT decodedJWT) {
        return decodedJWT.getClaims();
    }

}
