package com.mams.repository;

import com.mams.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {
    
    @Query("SELECT t FROM Transfer t WHERE " +
           "(:fromBaseId IS NULL OR t.fromBase.baseId = :fromBaseId) AND " +
           "(:toBaseId IS NULL OR t.toBase.baseId = :toBaseId) AND " +
           "(:involvedBaseId IS NULL OR (t.fromBase.baseId = :involvedBaseId OR t.toBase.baseId = :involvedBaseId)) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(cast(:startDate as timestamp) IS NULL OR t.transferDate >= :startDate) AND " +
           "(cast(:endDate as timestamp) IS NULL OR t.transferDate <= :endDate)")
    Page<Transfer> searchTransfers(
            @Param("fromBaseId") Long fromBaseId,
            @Param("toBaseId") Long toBaseId,
            @Param("involvedBaseId") Long involvedBaseId,
            @Param("status") String status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
}
