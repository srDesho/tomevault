package com.cristianml.TomeVault.security.config.filter;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.cristianml.TomeVault.security.service.UserDetailsServiceImpl;
import com.cristianml.TomeVault.utilities.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collection;


/**
 * Custom Spring Security filter to validate JWTs in incoming requests.
 * Extends OncePerRequestFilter to ensure the filter runs only once per request.
 */

@Component
@RequiredArgsConstructor
public class JwtTokenValidator extends OncePerRequestFilter {

    private final JwtUtils jwtUtils; // Injects JwtUtils for token operations

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
            filterChain.doFilter(request, response);  // Continue filter chain if no Bearer token is found
            return;
        }


        try {

            // 3. Extract the token (remove "Bearer " prefix).
            String token = authHeader.substring(7);

            // 4. Validate and decode the token using JwtUtils.
            DecodedJWT decodedJWT = this.jwtUtils.validateToken(token);

            // 5. Extract username (subject) and authorities (claims) from the decoded token.
            String username = jwtUtils.extractUsername(decodedJWT);

            // Ensure the "authorities" claim is stored as a comma-separated string in the JWT.
            String srtAuthorities = jwtUtils.getSpecificClaim(decodedJWT, "authorities").asString();


            // Convert the comma-separated authorities string into a Collection of GrantedAuthority.
            // AuthorityUtils.commaSeparatedStringToAuthorityList is a convenient Spring Security utility.
            Collection<? extends GrantedAuthority> authorities = AuthorityUtils.commaSeparatedStringToAuthorityList(srtAuthorities);


            // 6. Set the authenticated user in Spring Security's context.

            // SecurityContextHolder holds the SecurityContext for the current thread of execution.

            SecurityContext context = SecurityContextHolder.getContext();


            // Create an Authentication object. Password is 'null' as authentication happened via JWT.
            Authentication authentication = new UsernamePasswordAuthenticationToken(username, null, authorities);


            // Set the authentication object in the security context.
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context); // Update the SecurityContextHolder explicitly


        } catch (JWTVerificationException e) {

            // Handle token validation failures (e.g., malformed, expired, invalid signature).
            // Set HTTP status to Unauthorized and write an error message to the response.
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Authentication failed: " + e.getMessage());

            return; // Stop the filter chain and return response immediately

        } catch (Exception e) {

            // Catch any other unexpected exceptions during token processing.
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("An unexpected error occurred during authentication: " + e.getMessage());

            return; // Stop the filter chain

        }


        // 7. Continue the filter chain. If authentication was successful, the request
        // will now proceed with an authenticated principal in the SecurityContext.
        filterChain.doFilter(request, response);

    }
}