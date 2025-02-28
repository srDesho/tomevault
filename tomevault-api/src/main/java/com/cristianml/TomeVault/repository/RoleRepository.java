package com.cristianml.TomeVault.repository;

import com.cristianml.TomeVault.security.entity.RoleEntity;
import com.cristianml.TomeVault.security.entity.RoleEnum;
import org.springframework.data.repository.CrudRepository;

public interface RoleRepository extends CrudRepository<RoleEntity, Long> {

    boolean existsByRoleEnum(RoleEnum roleEnum);

}
