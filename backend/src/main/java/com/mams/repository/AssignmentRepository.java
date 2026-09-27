package com.mams.repository;

import com.mams.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    @Query("SELECT a FROM Assignment a WHERE " +
           "(:personnelId IS NULL OR a.personnel.personnelId = :personnelId) AND " +
           "(:assetId IS NULL OR a.asset.assetId = :assetId) AND " +
           "(:baseId IS NULL OR a.personnel.base.baseId = :baseId OR a.asset.currentBase.baseId = :baseId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(cast(:startDate as timestamp) IS NULL OR a.assignedDate >= :startDate) AND " +
           "(cast(:endDate as timestamp) IS NULL OR a.assignedDate <= :endDate)")
    Page<Assignment> searchAssignments(
            @Param("personnelId") Long personnelId,
            @Param("assetId") Long assetId,
            @Param("baseId") Long baseId,
            @Param("status") String status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
            
    boolean existsByAsset_AssetIdAndStatus(Long assetId, String status);

    @Query("SELECT COUNT(a) FROM Assignment a WHERE " +
           "a.status = 'ACTIVE' AND " +
           "(:baseId IS NULL OR a.personnel.base.baseId = :baseId OR a.asset.currentBase.baseId = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR a.asset.equipmentType.equipmentTypeId = :equipmentTypeId)")
    Integer countAssignedForDashboard(
            @Param("baseId") Long baseId, 
            @Param("equipmentTypeId") Long equipmentTypeId);
}
