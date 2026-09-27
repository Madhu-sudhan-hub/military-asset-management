package com.mams.repository;

import com.mams.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    @Query("SELECT a FROM Asset a WHERE " +
           "(:baseId IS NULL OR a.currentBase.baseId = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR a.equipmentType.equipmentTypeId = :equipmentTypeId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:search IS NULL OR LOWER(a.assetTag) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Asset> searchAssets(@Param("baseId") Long baseId, 
                             @Param("equipmentTypeId") Long equipmentTypeId, 
                             @Param("status") String status, 
                             @Param("search") String search, 
                             Pageable pageable);
}
