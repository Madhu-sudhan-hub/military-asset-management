package com.mams.repository;

import com.mams.entity.Expenditure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

@Repository
public interface ExpenditureRepository extends JpaRepository<Expenditure, Long> {

    @Query("SELECT e FROM Expenditure e WHERE " +
           "(:baseId IS NULL OR e.base.baseId = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR e.equipmentType.equipmentTypeId = :equipmentTypeId) AND " +
           "(:assetId IS NULL OR e.asset.assetId = :assetId) AND " +
           "(:reason IS NULL OR LOWER(e.reason) LIKE LOWER(CONCAT('%', :reason, '%'))) AND " +
           "(cast(:startDate as timestamp) IS NULL OR e.expenditureDate >= :startDate) AND " +
           "(cast(:endDate as timestamp) IS NULL OR e.expenditureDate <= :endDate)")
    Page<Expenditure> searchExpenditures(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("assetId") Long assetId,
            @Param("reason") String reason,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(e.quantity), 0) FROM Expenditure e WHERE e.base.baseId = :baseId AND e.equipmentType.equipmentTypeId = :equipmentTypeId")
    Integer sumExpendituresByBaseAndEquipment(@Param("baseId") Long baseId, @Param("equipmentTypeId") Long equipmentTypeId);

    @Query("SELECT COALESCE(SUM(e.quantity), 0) FROM Expenditure e WHERE " +
           "(:baseId IS NULL OR e.base.baseId = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR e.equipmentType.equipmentTypeId = :equipmentTypeId) AND " +
           "(cast(:startDate as timestamp) IS NULL OR e.expenditureDate >= :startDate) AND " +
           "(cast(:endDate as timestamp) IS NULL OR e.expenditureDate <= :endDate)")
    Integer sumExpendituresForDashboard(
            @Param("baseId") Long baseId, 
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
