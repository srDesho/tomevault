package com.cristianml.TomeVault.repositories;

import com.cristianml.TomeVault.security.entities.PermissionEntity;
import com.cristianml.TomeVault.security.entities.PermissionEnum;
import org.springframework.data.repository.CrudRepository;

public interface PersmissionRepository extends CrudRepository<PermissionEntity, Long> {

    boolean existsByPermissionEnum(PermissionEnum permissionEnum);

}
