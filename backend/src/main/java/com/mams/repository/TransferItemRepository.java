package com.mams.repository;

import com.mams.entity.TransferItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface TransferItemRepository extends JpaRepository<TransferItem, Long> {

    @Query("SELECT COALESCE(SUM(ti.quantity), 0) FROM TransferItem ti JOIN ti.transfer t WHERE t.toBase.baseId = :baseId AND ti.equipmentType.equipmentTypeId = :equipmentTypeId AND t.status = 'COMPLETED'")
    Integer sumTransferInByBaseAndEquipment(@Param("baseId") Long baseId, @Param("equipmentTypeId") Long equipmentTypeId);

    @Query("SELECT COALESCE(SUM(ti.quantity), 0) FROM TransferItem ti JOIN ti.transfer t WHERE t.fromBase.baseId = :baseId AND ti.equipmentType.equipmentTypeId = :equipmentTypeId AND t.status = 'COMPLETED'")
    Integer sumTransferOutByBaseAndEquipment(@Param("baseId") Long baseId, @Param("equipmentTypeId") Long equipmentTypeId);

    @Query("SELECT COALESCE(SUM(ti.quantity), 0) FROM TransferItem ti JOIN ti.transfer t WHERE " +
           "(:baseId IS NULL OR t.toBase.baseId = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR ti.equipmentType.equipmentTypeId = :equipmentTypeId) AND " +
           "t.status = 'COMPLETED' AND " +
           "(cast(:startDate as timestamp) IS NULL OR t.transferDate >= :startDate) AND " +
           "(cast(:endDate as timestamp) IS NULL OR t.transferDate <= :endDate)")
    Integer sumTransferInForDashboard(
            @Param("baseId") Long baseId, 
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(ti.quantity), 0) FROM TransferItem ti JOIN ti.transfer t WHERE " +
           "(:baseId IS NULL OR t.fromBase.baseId = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR ti.equipmentType.equipmentTypeId = :equipmentTypeId) AND " +
           "t.status = 'COMPLETED' AND " +
           "(cast(:startDate as timestamp) IS NULL OR t.transferDate >= :startDate) AND " +
           "(cast(:endDate as timestamp) IS NULL OR t.transferDate <= :endDate)")
    Integer sumTransferOutForDashboard(
            @Param("baseId") Long baseId, 
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate);
}
