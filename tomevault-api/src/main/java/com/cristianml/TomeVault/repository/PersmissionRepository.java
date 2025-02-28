package com.cristianml.TomeVault.repository;

import com.cristianml.TomeVault.security.entity.PermissionEntity;
import com.cristianml.TomeVault.security.entity.PermissionEnum;
import org.springframework.data.repository.CrudRepository;

public interface PersmissionRepository extends CrudRepository<PermissionEntity, Long> {

    boolean existsByPermissionEnum(PermissionEnum permissionEnum);

}
