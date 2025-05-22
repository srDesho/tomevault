package com.cristianml.TomeVault.security.service;

import com.cristianml.TomeVault.dto.request.UserRegistrationRequestDTO;
import com.cristianml.TomeVault.entity.UserEntity;
import com.cristianml.TomeVault.repository.RoleRepository;
import com.cristianml.TomeVault.repository.UserRepository;
import com.cristianml.TomeVault.security.config.CustomUserDetails;
import com.cristianml.TomeVault.security.dto.AuthLoginRequest;
import com.cristianml.TomeVault.security.dto.AuthResponse;
import com.cristianml.TomeVault.security.entity.RoleEntity;
import com.cristianml.TomeVault.utilities.JwtUtils;
import jakarta.validation.Valid;
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

}
