package com.mams.controller;

import com.mams.dto.response.*;
import com.mams.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // INVENTORY
    @GetMapping("/inventory")
    public ResponseEntity<Page<InventoryReportResponse>> getInventoryReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @PageableDefault(sort = "baseId", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(reportService.getInventoryReport(startDate, endDate, baseId, equipmentTypeId, pageable));
    }

    @GetMapping("/inventory/export/csv")
    public ResponseEntity<byte[]> exportInventoryCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId) {
        byte[] csv = reportService.generateInventoryCsv(startDate, endDate, baseId, equipmentTypeId);
        return createCsvResponse(csv, "inventory_report_" + LocalDate.now() + ".csv");
    }

    @GetMapping("/inventory/export/excel")
    public ResponseEntity<byte[]> exportInventoryExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId) {
        byte[] excel = reportService.generateInventoryExcel(startDate, endDate, baseId, equipmentTypeId);
        return createExcelResponse(excel, "inventory_report_" + LocalDate.now() + ".xlsx");
    }

    // PURCHASES
    @GetMapping("/purchases")
    public ResponseEntity<Page<PurchaseResponse>> getPurchaseReport(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String supplier,
            @RequestParam(required = false) String referenceNumber,
            @PageableDefault(sort = "purchaseDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reportService.getPurchaseReport(baseId, equipmentTypeId, startDate, endDate, supplier, referenceNumber, pageable));
    }

    @GetMapping("/purchases/export/csv")
    public ResponseEntity<byte[]> exportPurchasesCsv(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String supplier,
            @RequestParam(required = false) String referenceNumber) {
        byte[] csv = reportService.generatePurchasesCsv(baseId, equipmentTypeId, startDate, endDate, supplier, referenceNumber);
        return createCsvResponse(csv, "purchase_report_" + LocalDate.now() + ".csv");
    }

    @GetMapping("/purchases/export/excel")
    public ResponseEntity<byte[]> exportPurchasesExcel(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String supplier,
            @RequestParam(required = false) String referenceNumber) {
        byte[] excel = reportService.generatePurchasesExcel(baseId, equipmentTypeId, startDate, endDate, supplier, referenceNumber);
        return createExcelResponse(excel, "purchase_report_" + LocalDate.now() + ".xlsx");
    }

    // TRANSFERS
    @GetMapping("/transfers")
    public ResponseEntity<Page<TransferResponse>> getTransferReport(
            @RequestParam(required = false) Long fromBaseId,
            @RequestParam(required = false) Long toBaseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(sort = "transferDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reportService.getTransferReport(fromBaseId, toBaseId, equipmentTypeId, status, startDate, endDate, pageable));
    }

    @GetMapping("/transfers/export/csv")
    public ResponseEntity<byte[]> exportTransfersCsv(
            @RequestParam(required = false) Long fromBaseId,
            @RequestParam(required = false) Long toBaseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        byte[] csv = reportService.generateTransfersCsv(fromBaseId, toBaseId, equipmentTypeId, status, startDate, endDate);
        return createCsvResponse(csv, "transfer_report_" + LocalDate.now() + ".csv");
    }

    @GetMapping("/transfers/export/excel")
    public ResponseEntity<byte[]> exportTransfersExcel(
            @RequestParam(required = false) Long fromBaseId,
            @RequestParam(required = false) Long toBaseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        byte[] excel = reportService.generateTransfersExcel(fromBaseId, toBaseId, equipmentTypeId, status, startDate, endDate);
        return createExcelResponse(excel, "transfer_report_" + LocalDate.now() + ".xlsx");
    }

    // ASSIGNMENTS
    @GetMapping("/assignments")
    public ResponseEntity<Page<AssignmentResponse>> getAssignmentReport(
            @RequestParam(required = false) Long personnelId,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(sort = "assignedDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reportService.getAssignmentReport(personnelId, assetId, baseId, status, startDate, endDate, pageable));
    }

    @GetMapping("/assignments/export/csv")
    public ResponseEntity<byte[]> exportAssignmentsCsv(
            @RequestParam(required = false) Long personnelId,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        byte[] csv = reportService.generateAssignmentsCsv(personnelId, assetId, baseId, status, startDate, endDate);
        return createCsvResponse(csv, "assignment_report_" + LocalDate.now() + ".csv");
    }

    @GetMapping("/assignments/export/excel")
    public ResponseEntity<byte[]> exportAssignmentsExcel(
            @RequestParam(required = false) Long personnelId,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        byte[] excel = reportService.generateAssignmentsExcel(personnelId, assetId, baseId, status, startDate, endDate);
        return createExcelResponse(excel, "assignment_report_" + LocalDate.now() + ".xlsx");
    }

    // EXPENDITURES
    @GetMapping("/expenditures")
    public ResponseEntity<Page<ExpenditureResponse>> getExpenditureReport(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(sort = "expenditureDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reportService.getExpenditureReport(baseId, equipmentTypeId, assetId, reason, startDate, endDate, pageable));
    }

    @GetMapping("/expenditures/export/csv")
    public ResponseEntity<byte[]> exportExpendituresCsv(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        byte[] csv = reportService.generateExpendituresCsv(baseId, equipmentTypeId, assetId, reason, startDate, endDate);
        return createCsvResponse(csv, "expenditure_report_" + LocalDate.now() + ".csv");
    }

    @GetMapping("/expenditures/export/excel")
    public ResponseEntity<byte[]> exportExpendituresExcel(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        byte[] excel = reportService.generateExpendituresExcel(baseId, equipmentTypeId, assetId, reason, startDate, endDate);
        return createExcelResponse(excel, "expenditure_report_" + LocalDate.now() + ".xlsx");
    }

    // ASSETS
    @GetMapping("/assets")
    public ResponseEntity<Page<AssetResponse>> getAssetReport(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @PageableDefault(sort = "assetTag", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(reportService.getAssetReport(baseId, equipmentTypeId, status, search, pageable));
    }

    @GetMapping("/assets/export/csv")
    public ResponseEntity<byte[]> exportAssetsCsv(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        byte[] csv = reportService.generateAssetsCsv(baseId, equipmentTypeId, status, search);
        return createCsvResponse(csv, "asset_report_" + LocalDate.now() + ".csv");
    }

    // AUDIT
    @GetMapping("/audit-activity")
    public ResponseEntity<Page<AuditLogResponse>> getAuditReport(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reportService.getAuditReport(userId, action, entityType, entityId, startDate, endDate, pageable));
    }

    @GetMapping("/audit-activity/export/csv")
    public ResponseEntity<byte[]> exportAuditCsv(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        byte[] csv = reportService.generateAuditCsv(userId, action, entityType, entityId, startDate, endDate);
        return createCsvResponse(csv, "audit_report_" + LocalDate.now() + ".csv");
    }

    // HELPER METHODS
    private ResponseEntity<byte[]> createCsvResponse(byte[] content, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", filename);
        return ResponseEntity.ok().headers(headers).body(content);
    }

    private ResponseEntity<byte[]> createExcelResponse(byte[] content, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", filename);
        return ResponseEntity.ok().headers(headers).body(content);
    }
}
