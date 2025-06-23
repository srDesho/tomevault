package com.cristianml.TomeVault.security.services;

import com.cristianml.TomeVault.entities.UserEntity;
import com.cristianml.TomeVault.repositories.RoleRepository;
import com.cristianml.TomeVault.repositories.UserRepository;
import com.cristianml.TomeVault.security.config.CustomUserDetails;
import com.cristianml.TomeVault.utilities.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtils jwtUtils;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {

        // We capture the user
        UserEntity userEntity = userRepository.findUserEntityByUsername(usernameOrEmail)
                .or(() -> userRepository.findUserEntityByEmail(usernameOrEmail))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username or email" + usernameOrEmail));

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

        // Check if user is deleted (soft delete).
        if (userEntity.isDeleted()) {
            throw new UsernameNotFoundException("User account has been deleted.");
        }
        // Check if user is enabled.
        if (!userEntity.isEnabled()) {
            throw new UsernameNotFoundException("User account is disabled.");
        }

        // Simply return a new instance of CustomUserDetails because we configure the authorities in this Custom class
        return new CustomUserDetails(userEntity);
    }

}
