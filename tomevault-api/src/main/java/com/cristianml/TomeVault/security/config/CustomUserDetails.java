package com.cristianml.TomeVault.security.config;

import com.cristianml.TomeVault.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * Wrapper class implementing Spring Security's UserDetails interface,
 * containing a reference to our UserEntity.
 * This allows direct injection of the UserEntity into controllers
 * via the @AuthenticationPrincipal annotation.
 */
@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {

    private final UserEntity userEntity;

    /**
     * Returns the underlying UserEntity.
     * @return The UserEntity associated with these user details.
     */
    public UserEntity getUserEntity() {
        return this.userEntity;
    }

    /**
     * Retrieves the authorities (roles and permissions) granted to the user.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        // Add roles to the authorities.
        userEntity.getRoleList().forEach(role ->
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getRoleEnum().name())));

        // Add permissions to the authorities by flat-mapping roles' permissions.
        userEntity.getRoleList().stream()
                .flatMap(roleEntity -> roleEntity.getPermissionList().stream())
                .forEach(permission -> authorities.add(new SimpleGrantedAuthority(permission.getPermissionEnum().name())));
        return authorities;
    }

    /**
     * Returns the password used to authenticate the user.
     */
    @Override
    public String getPassword() {
        return this.userEntity.getPassword();
    }

    /**
     * Returns the username used to authenticate the user.
     */
    @Override
    public String getUsername() {
        return this.userEntity.getUsername();
    }

    /**
     * Indicates whether the user's account has expired.
     */
    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    /**
     * Indicates whether the user is locked or unlocked.
     */
    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    /**
     * Indicates whether the user's credentials (password) have expired.
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    /**
     * Indicates whether the user is enabled or disabled.
     */
    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}