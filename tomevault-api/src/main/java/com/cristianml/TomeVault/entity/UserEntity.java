package com.cristianml.TomeVault.entity;

import com.cristianml.TomeVault.security.entity.RoleEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;


@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String address;
    @Column(unique = true)
    private String email;
    private String firstname;
    private String lastname;
    private LocalDate birthDate;

    @Column(nullable = false, updatable = false, unique = true)
    private String username;
    private String password;

    private boolean enabled;
    @Column(name = "account_non_expired")
    private boolean accountNonExpired;
    @Column(name = "account_non_locked")
    private boolean accountNonLocked;
    @Column(name = "credentials_non_expired")
    private boolean credentialsNonExpired;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.MERGE)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id") ,
        inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<RoleEntity> roleList = new HashSet<>();
}
