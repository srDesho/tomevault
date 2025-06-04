package com.cristianml.TomeVault;

import com.cristianml.TomeVault.entities.UserEntity;
import com.cristianml.TomeVault.repositories.PersmissionRepository;
import com.cristianml.TomeVault.repositories.RoleRepository;
import com.cristianml.TomeVault.repositories.UserRepository;
import com.cristianml.TomeVault.security.entities.PermissionEntity;
import com.cristianml.TomeVault.security.entities.PermissionEnum;
import com.cristianml.TomeVault.security.entities.RoleEntity;
import com.cristianml.TomeVault.security.entities.RoleEnum;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Set;

@SpringBootApplication
@RequiredArgsConstructor
public class TomevaultApplication {

	public static void main(String[] args) {
		SpringApplication.run(TomevaultApplication.class, args);
	}

	@Bean
	@Transactional
	public CommandLineRunner init(UserRepository userRepository, RoleRepository roleRepository,
								  PersmissionRepository permissionRepository) {
		return args -> {

			try {
				PermissionEntity READ_BOOK = this.savePermission(permissionRepository, PermissionEnum.READ_BOOK);
				PermissionEntity ADD_BOOK = savePermission(permissionRepository, PermissionEnum.ADD_BOOK);
				PermissionEntity EDIT_BOOK = savePermission(permissionRepository, PermissionEnum.EDIT_BOOK);
				PermissionEntity DELETE_BOOK = savePermission(permissionRepository, PermissionEnum.DELETE_BOOK);
				PermissionEntity MANAGE_USERS = savePermission(permissionRepository, PermissionEnum.MANAGE_USERS);

				RoleEntity roleUser = saveRole(roleRepository, RoleEnum.USER, Set.of(READ_BOOK, ADD_BOOK, EDIT_BOOK, DELETE_BOOK));
				RoleEntity roleAdmin = saveRole(roleRepository, RoleEnum.ADMIN, Set.of(READ_BOOK, ADD_BOOK, EDIT_BOOK, DELETE_BOOK, MANAGE_USERS));
				RoleEntity roleDeveloper = saveRole(roleRepository, RoleEnum.DEVELOPER, Set.of(READ_BOOK, ADD_BOOK, EDIT_BOOK, DELETE_BOOK));
				RoleEntity roleSuperAdmin = saveRole(roleRepository, RoleEnum.SUPER_ADMIN, Set.of(READ_BOOK, ADD_BOOK, EDIT_BOOK, DELETE_BOOK, MANAGE_USERS));

				UserEntity cristian = saveUser(userRepository, "Calle Principal 123", "cristian@example.com",
						"Cristian", "Montaño", LocalDate.of(1990, 1, 1), "cristian", 
						"$2a$10$LMrudlQ2oMtlU37j6VbCzOnPeWIkDcSU3nKDi.jWTTDwyucaAdxWy", Set.of(roleUser, roleSuperAdmin));

				UserEntity desho = saveUser(userRepository, "Calle Principal 456", "desho@example.com",
							"Desho", "Admin", LocalDate.of(1985, 5, 15),
							"desho", "$2a$10$LMrudlQ2oMtlU37j6VbCzOnPeWIkDcSU3nKDi.jWTTDwyucaAdxWy", Set.of(roleAdmin));


			} catch (IllegalArgumentException e) {
				System.out.println(e.getMessage());
			}
		};
	}

	@Transactional
	private PermissionEntity savePermission(PersmissionRepository permissionRepository, PermissionEnum permissionEnum) {
		if (permissionRepository.existsByPermissionEnum(permissionEnum)) {
			throw new IllegalArgumentException("Permission with name " + permissionEnum.name() + " already exists.");
		}

		return permissionRepository.save(PermissionEntity.builder()
				.permissionEnum(permissionEnum)
				.build());
	}

	@Transactional
	private RoleEntity saveRole(RoleRepository roleRepository, RoleEnum roleEnum, Set<PermissionEntity> roleList) {
		if (roleRepository.existsByRoleEnum(roleEnum)) {
			throw new IllegalArgumentException("Role with name " + roleEnum.name() + " already exists.");
		}

		return roleRepository.save(RoleEntity.builder()
				.roleEnum(roleEnum)
				.permissionList(roleList)
				.build());
	}

	@Transactional
	public UserEntity saveUser(UserRepository userRepository, String address, String email,
							   String firstname, String lastname, LocalDate birthDate,
							   String username, String password, Set<RoleEntity> roles) {
		if (userRepository.existsByUsername(username)) {
			throw new IllegalArgumentException("User with username " + username + " already exists.");
		}

		UserEntity user = new UserEntity();
		user.setAddress(address);
		user.setEmail(email);
		user.setFirstname(firstname);
		user.setLastname(lastname);
		user.setBirthDate(birthDate);
		user.setUsername(username);
		user.setPassword(password); // Cifra la contraseña
		user.setEnabled(true);
		user.setAccountNonExpired(true);
		user.setAccountNonLocked(true);
		user.setCredentialsNonExpired(true);
		user.setRoleList(roles);

		return userRepository.save(user);
	}
}
