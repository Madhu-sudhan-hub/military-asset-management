package com.mams.repository;

import com.mams.entity.Purchase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    @Query("SELECT p FROM Purchase p WHERE " +
           "(:baseId IS NULL OR p.base.baseId = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR p.equipmentType.equipmentTypeId = :equipmentTypeId) AND " +
           "(:startDate IS NULL OR p.purchaseDate >= :startDate) AND " +
           "(:endDate IS NULL OR p.purchaseDate <= :endDate)")
    Page<Purchase> searchPurchases(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Purchase p WHERE p.base.baseId = :baseId AND p.equipmentType.equipmentTypeId = :equipmentTypeId")
    Integer sumPurchasesByBaseAndEquipment(@Param("baseId") Long baseId, @Param("equipmentTypeId") Long equipmentTypeId);

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Purchase p WHERE " +
           "(:baseId IS NULL OR p.base.baseId = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR p.equipmentType.equipmentTypeId = :equipmentTypeId) AND " +
           "(cast(:startDate as date) IS NULL OR p.purchaseDate >= :startDate) AND " +
           "(cast(:endDate as date) IS NULL OR p.purchaseDate <= :endDate)")
    Integer sumPurchasesForDashboard(
            @Param("baseId") Long baseId, 
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
