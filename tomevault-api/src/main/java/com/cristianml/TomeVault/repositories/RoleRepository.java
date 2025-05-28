package com.cristianml.TomeVault.repositories;

import com.cristianml.TomeVault.security.entities.RoleEntity;
import com.cristianml.TomeVault.security.entities.RoleEnum;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface RoleRepository extends CrudRepository<RoleEntity, Long> {

    boolean existsByRoleEnum(RoleEnum roleEnum);
    Set<RoleEntity> findRoleEntitiesByRoleEnumIn(List<String> roleRequest);
    Optional<RoleEntity> findByRoleEnum(RoleEnum roleEnum);

}
