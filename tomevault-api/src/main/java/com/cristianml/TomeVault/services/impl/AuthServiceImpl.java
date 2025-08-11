package com.cristianml.TomeVault.services.impl;

import com.cristianml.TomeVault.dtos.requests.UserRegistrationRequestDTO;
import com.cristianml.TomeVault.entities.BookEntity;
import com.cristianml.TomeVault.entities.UserEntity;
import com.cristianml.TomeVault.mappers.UserMapper;
import com.cristianml.TomeVault.repositories.BookRepository;
import com.cristianml.TomeVault.repositories.RoleRepository;
import com.cristianml.TomeVault.repositories.UserRepository;
import com.cristianml.TomeVault.security.dtos.AuthLoginRequest;
import com.cristianml.TomeVault.security.dtos.AuthResponse;
import com.cristianml.TomeVault.security.entities.RoleEntity;
import com.cristianml.TomeVault.security.services.UserDetailsServiceImpl;
import com.cristianml.TomeVault.services.IAuthService;
import com.cristianml.TomeVault.utilities.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static com.cristianml.TomeVault.utilities.Utilities.validatePassword;

// Service implementation for authentication-related operations.
// Handles user login, registration, and JWT token generation
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final JwtUtils jwtUtils;
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BookRepository bookRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsServiceImpl userDetailsService;

    // Authenticates user credentials and generates JWT access token.
    // Validates username/password combination and sets security context.
    @Override
    public AuthResponse loginUser(AuthLoginRequest authLoginRequest) {

        String username = authLoginRequest.getUsernameOrEmail();
        String password = authLoginRequest.getPassword();

        // Reset books from demo user.
        resetDemoUserBooks(username);

        // Authenticate user credentials using Spring Security's UserDetailsService
        Authentication authentication = this.authenticate(username, password);

        // Set authenticated user in Spring Security context for request scope
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT access token containing user authorities and claims
        String accessToken = this.jwtUtils.createToken(authentication);

        // Return successful authentication response with token
        return new AuthResponse(username, "User logged in successfully.", accessToken, true);
    }

    // Registers new user with complete profile validation and default role assignment.
    // Validates password confirmation, username/email uniqueness, and assigns USER role.
    // Automatically authenticates user upon successful registration with JWT token.
    @Override
    public AuthResponse registerUser(UserRegistrationRequestDTO registrationRequestDTO) {
        String username = registrationRequestDTO.getUsername();
        String password = registrationRequestDTO.getPassword();
        String email = registrationRequestDTO.getEmail();

        // Validate password confirmation match for security consistency
        if (!password.equals(registrationRequestDTO.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Ensure username uniqueness across the system
        if (userRepository.findUserEntityByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username is already taken");
        }

        // Ensure email uniqueness across the system
        if (userRepository.findUserEntityByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email is already in use");
        }

        // Retrieve default USER role from database for new registrations
        Set<RoleEntity> defaultRoles = this.roleRepository.findRoleEntitiesByRoleEnumIn(List.of("USER"))
                .stream().collect(Collectors.toSet());

        if (defaultRoles.isEmpty()) {
            throw new IllegalStateException("Default USER role not found in database");
        }

        validatePassword(password);
        // Build new user entity using mapper for consistent field mapping
        UserEntity userEntity = this.userMapper.toEntity(registrationRequestDTO);
        userEntity.setPassword(passwordEncoder.encode(registrationRequestDTO.getPassword())); // Secure password encoding
        userEntity.setRoleList(defaultRoles);

        // Set default account status flags for new users
        userEntity.setEnabled(true);
        userEntity.setAccountNonLocked(true);
        userEntity.setAccountNonExpired(true);
        userEntity.setCredentialsNonExpired(true);

        // Persist new user entity to database
        UserEntity userCreated = this.userRepository.save(userEntity);

        // Build comprehensive authority list for JWT token generation
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        // Add role-based authorities with ROLE_ prefix for Spring Security
        userCreated.getRoleList()
                .forEach(role -> authorities.add(new SimpleGrantedAuthority("ROLE_".concat(role.getRoleEnum().name()))));

        // Add permission-based authorities for fine-grained access control
        userCreated.getRoleList().stream()
                .flatMap(role -> role.getPermissionList().stream())
                .forEach(permission -> authorities.add(new SimpleGrantedAuthority(permission.getPermissionEnum().name())));

        // Create authentication token for immediate user session
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userCreated.getUsername(), null, authorities);

        // Generate JWT access token for immediate authentication post-registration
        String accessToken = this.jwtUtils.createToken(authentication);

        return new AuthResponse(userCreated.getUsername(), "User registered successfully.", accessToken, true);
    }

    // Private helper method for credential authentication.
    // Uses UserDetailsService to load user and validates password hash.
    private Authentication authenticate(String username, String password) {
        UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

        // Validate password using secure password encoder comparison
        if(!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid password.");
        }

        // Return authenticated token without exposing sensitive password data
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

    }

    // Handle user demo limit.
    @Transactional
    public void resetDemoUserBooks(String usernameOrEmail) {

        // Verify if is Demo User
        Optional<UserEntity> userOpt = userRepository.findUserEntityByEmail(usernameOrEmail);

        // If cannot find by email, search by username.
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findUserEntityByUsername(usernameOrEmail);
        }

        // do nothing if not is demo user.
        if (userOpt.isEmpty()) {
            log.debug("User not found by email or username: {}", usernameOrEmail);
            return;
        }

        UserEntity user = userOpt.get();
        if (!"demo@tomevault.com".equals(user.getEmail())) return;

        // Active all 5 first books
        activeDemoBooks(user);

        log.info("Demo Data Cleanup: Starting...");


        // Get all books for the demo user (with loaded tags)
        List<BookEntity> allDemoBooks = bookRepository.findAllByUserWithTags(user);

        if (allDemoBooks.isEmpty()) {
            log.info("Demo user don't have books.");
            return;
        }

        // Keeps the first 5 books (the oldest ones)
        if (allDemoBooks.size() > 5) {
            List<BookEntity> booksToDelete = allDemoBooks.subList(5, allDemoBooks.size());

            // to @ElementCollection: first clean tags manually.
            // This is necessary for avoid FK constraint error.
            booksToDelete.forEach(book -> {
                // Clean tag collection.
                book.getTags().clear();
                bookRepository.save(book); // Update every book.
            });

            // Delete books.
            // Use deleteAll()
            bookRepository.deleteAll(booksToDelete);

            log.info("Deleted {} books from the demo user. 5 base books were kept.", booksToDelete.size());
        } else {
            log.info("Demo user have {} books (<=5). Nothing has been deleted.", allDemoBooks.size());
        }

    }

    // Active the 5 first base books from demo user (only if they are inactive).
    @Transactional
    public void activeDemoBooks(UserEntity user) {
        if (!"demo@tomevault.com".equals(user.getEmail())) {
            return;
        }

        // Find inactive books from demo user.
        List<BookEntity> inactiveBooks = bookRepository.findAllByUserAndIsActiveFalse(user);

        // Active maximum 5 books.
        List<BookEntity> booksToActivate = inactiveBooks.stream()
                .limit(5)
                .map(book -> {
                    book.setActive(true);
                    log.debug("Activating book: {}", book.getTitle());
                    return book;
                })
                .toList();

        if (!booksToActivate.isEmpty()) {
            bookRepository.saveAll(booksToActivate);
            log.info("Activated {} base books for demo user", booksToActivate.size());
        }
    }
}
