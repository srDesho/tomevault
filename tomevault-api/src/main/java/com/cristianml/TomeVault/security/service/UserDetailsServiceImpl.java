package com.cristianml.TomeVault.security.service;

import com.cristianml.TomeVault.entity.UserEntity;
import com.cristianml.TomeVault.repository.RoleRepository;
import com.cristianml.TomeVault.repository.UserRepository;
import com.cristianml.TomeVault.security.config.CustomUserDetails;
import com.cristianml.TomeVault.security.dto.AuthCreateUserRequest;
import com.cristianml.TomeVault.security.dto.AuthLoginRequest;
import com.cristianml.TomeVault.security.dto.AuthResponse;
import com.cristianml.TomeVault.security.entity.RoleEntity;
import com.cristianml.TomeVault.utilities.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtils jwtUtils;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // We capture the user
        UserEntity userEntity = userRepository.findUserEntityByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User with username " + username + " not exists."));

       /* List<SimpleGrantedAuthority> authorityList = new ArrayList<>();

        // Adding roles
        userEntity.getRoleList().forEach(
                roleEntity -> authorityList.add(new SimpleGrantedAuthority("ROLE_".concat(roleEntity.getRoleEnum().name())))
        );

        // Adding permissions
        userEntity.getRoleList().stream().flatMap(
                roleEntity -> roleEntity.getPermissionList().stream())
                .forEach(permissionEntity -> authorityList.add(new SimpleGrantedAuthority(permissionEntity.getPermissionEnum().name())));

        return new User(userEntity.getUsername(),
                userEntity.getPassword(),
                userEntity.isEnabled(),
                userEntity.isAccountNonExpired(),
                userEntity.isCredentialsNonExpired(),
                userEntity.isAccountNonLocked(),
                authorityList);*/

        // Simply return a new instance of CustomUserDetails because we configure the authorities in this Custom class
        return new CustomUserDetails(userEntity);
    }

    // Handles user login and generates an access token (JWT).
    // This method is typically called from the AuthenticationController.

    public AuthResponse loginUser(AuthLoginRequest authLoginRequest) {
        String username = authLoginRequest.getUsername();
        String password = authLoginRequest.getPassword();

        // Authenticate user credentials. This will throw an exception if credentials are bad.
        Authentication authentication = this.authenticate(username, password);

        // Set the authenticated user in Spring Security's context.
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate the JWT access token.
        String accessToken = this.jwtUtils.createToken(authentication);

        // Construct and return the authentication response.
        AuthResponse authResponse = new AuthResponse(username, "User logged in successfully.", accessToken, true);
        return authResponse;
    }

    // Authenticates user credentials.
    private Authentication authenticate(String username, String password) {
        // Load user details by username. Throws UsernameNotFoundException if user doesn't exist.
        UserDetails userDetails = this.loadUserByUsername(username);

        // Validate if the raw password matches the encoded password.
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid password.");
        }

        // Return an authenticated token without exposing the password.
        return new UsernamePasswordAuthenticationToken(username, userDetails.getPassword(), userDetails.getAuthorities());
    }

    // Creates a new user in the database and generates an access token (JWT) for them.
    public AuthResponse createUser(AuthCreateUserRequest authCreateUserRequest) {
        String username = authCreateUserRequest.getUsername();
        String password = authCreateUserRequest.getPassword();
        List<String> roleRequest = authCreateUserRequest.getRoleRequest().getRoleListName();

        // Find existing roles in the database based on the requested role names.
        Set<RoleEntity> roleEntities = this.roleRepository.findRoleEntitiesByRoleEnumIn(roleRequest)
                .stream().collect(Collectors.toSet());

        if (roleEntities.isEmpty()) {
            throw new IllegalArgumentException("The roles specified do not exist.");
        }

        // Build and save the new user entity with encoded password and assigned roles.
        UserEntity userEntity = UserEntity.builder()
                .username(username)
                .password(passwordEncoder.encode(password)) // Encode password using BCrypt
                .roleList(roleEntities)
                .enabled(true)
                .accountNonLocked(true)
                .accountNonExpired(true)
                .credentialsNonExpired(true)
                .build();

        UserEntity userCreated = this.userRepository.save(userEntity);

        // Collect authorities (roles and permissions) for the newly created user.
        List<SimpleGrantedAuthority> authorityList = new ArrayList<>();
        userCreated.getRoleList()
                .forEach(role -> authorityList.add(new SimpleGrantedAuthority("ROLE_".concat(role.getRoleEnum().name()))));
        userCreated.getRoleList()
                .stream()
                .flatMap(roleEntity -> roleEntity.getPermissionList().stream())
                .forEach(permissionEntity -> authorityList.add(new SimpleGrantedAuthority(permissionEntity.getPermissionEnum().name())));

        // Create an Authentication object for the new user.
        Authentication authentication = new UsernamePasswordAuthenticationToken(userCreated.getUsername(),
                userCreated.getPassword(), authorityList);

        // Generate a JWT for the newly created and authenticated user.
        String accessToken = jwtUtils.createToken(authentication);

        // Define the response.
        AuthResponse authResponse = new AuthResponse(userCreated.getUsername(), "User created successfully.",
                accessToken, true);

        return authResponse;
    }
}
