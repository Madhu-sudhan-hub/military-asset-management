package com.mams.service;

import com.mams.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface ReportService {
    Page<InventoryReportResponse> getInventoryReport(LocalDate startDate, LocalDate endDate, Long baseId, Long equipmentTypeId, Pageable pageable);
    
    Page<PurchaseResponse> getPurchaseReport(Long baseId, Long equipmentTypeId, LocalDate startDate, LocalDate endDate, String supplier, String referenceNumber, Pageable pageable);
    
    Page<TransferResponse> getTransferReport(Long fromBaseId, Long toBaseId, Long equipmentTypeId, String status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    Page<AssignmentResponse> getAssignmentReport(Long personnelId, Long assetId, Long baseId, String status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    Page<ExpenditureResponse> getExpenditureReport(Long baseId, Long equipmentTypeId, Long assetId, String reason, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    Page<AssetResponse> getAssetReport(Long baseId, Long equipmentTypeId, String status, String search, Pageable pageable);
    
    Page<AuditLogResponse> getAuditReport(Long userId, String action, String entityType, Long entityId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // CSV Generation methods
    byte[] generateInventoryCsv(LocalDate startDate, LocalDate endDate, Long baseId, Long equipmentTypeId);
    byte[] generatePurchasesCsv(Long baseId, Long equipmentTypeId, LocalDate startDate, LocalDate endDate, String supplier, String referenceNumber);
    byte[] generateTransfersCsv(Long fromBaseId, Long toBaseId, Long equipmentTypeId, String status, LocalDateTime startDate, LocalDateTime endDate);
    byte[] generateAssignmentsCsv(Long personnelId, Long assetId, Long baseId, String status, LocalDateTime startDate, LocalDateTime endDate);
    byte[] generateExpendituresCsv(Long baseId, Long equipmentTypeId, Long assetId, String reason, LocalDateTime startDate, LocalDateTime endDate);
    byte[] generateAssetsCsv(Long baseId, Long equipmentTypeId, String status, String search);
    byte[] generateAuditCsv(Long userId, String action, String entityType, Long entityId, LocalDateTime startDate, LocalDateTime endDate);

    // Excel Generation methods
    byte[] generateInventoryExcel(LocalDate startDate, LocalDate endDate, Long baseId, Long equipmentTypeId);
    byte[] generatePurchasesExcel(Long baseId, Long equipmentTypeId, LocalDate startDate, LocalDate endDate, String supplier, String referenceNumber);
    byte[] generateTransfersExcel(Long fromBaseId, Long toBaseId, Long equipmentTypeId, String status, LocalDateTime startDate, LocalDateTime endDate);
    byte[] generateAssignmentsExcel(Long personnelId, Long assetId, Long baseId, String status, LocalDateTime startDate, LocalDateTime endDate);
    byte[] generateExpendituresExcel(Long baseId, Long equipmentTypeId, Long assetId, String reason, LocalDateTime startDate, LocalDateTime endDate);
}
