package com.cristianml.TomeVault.security.config.filter;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.cristianml.TomeVault.entities.UserEntity;
import com.cristianml.TomeVault.repositories.UserRepository;
import com.cristianml.TomeVault.security.config.CustomUserDetails;
import com.cristianml.TomeVault.utilities.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Custom Spring Security filter to validate JWTs in incoming requests.
 * Extends OncePerRequestFilter to ensure the filter runs only once per request.
 */
@Component
@RequiredArgsConstructor
public class JwtTokenValidator extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository; // Usamos directamente el repositorio

    /**
     * This method is executed once per HTTP request.
     * It intercepts the request to validate the JWT in the Authorization header.
     */
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        // 1. Get the Authorization header.
        String authHeader = request.getHeader("Authorization");

        // 2. Check if the header exists and starts with "Bearer ".
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 3. Extract the token (remove "Bearer " prefix).
            String token = authHeader.substring(7);

            // 4. Validate and decode the token using JwtUtils.
            DecodedJWT decodedJWT = this.jwtUtils.validateToken(token);

            // 5. Extract username from the decoded token.
            String username = jwtUtils.extractUsername(decodedJWT);

            // 6. Load the UserEntity directly from repository
            UserEntity userEntity = userRepository.findUserEntityByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            // 7. Create CustomUserDetails with the UserEntity
            CustomUserDetails customUserDetails = new CustomUserDetails(userEntity);

            // 8. Set the authenticated user in Spring Security's context.
            SecurityContext context = SecurityContextHolder.getContext();

            // Create an Authentication object with CustomUserDetails as principal
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    customUserDetails, // CustomUserDetails como principal
                    null,
                    customUserDetails.getAuthorities()
            );

            // Set the authentication object in the security context.
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

        } catch (JWTVerificationException e) {
            // Handle token validation failures
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Authentication failed: " + e.getMessage());
            return;

        } catch (Exception e) {
            // Catch any other unexpected exceptions during token processing.
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("An unexpected error occurred during authentication: " + e.getMessage());
            return;
        }

        // 9. Continue the filter chain
        filterChain.doFilter(request, response);
    }
}