package com.cristianml.TomeVault.repository;

import com.cristianml.TomeVault.security.entity.RoleEntity;
import com.cristianml.TomeVault.security.entity.RoleEnum;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Set;

public interface RoleRepository extends CrudRepository<RoleEntity, Long> {

    boolean existsByRoleEnum(RoleEnum roleEnum);
    Set<RoleEntity> findRoleEntitiesByRoleEnumIn(List<String> roleRequest);

}
