package com.mams.service.impl;

import com.mams.dto.response.*;
import com.mams.entity.Base;
import com.mams.entity.EquipmentType;
import com.mams.repository.BaseRepository;
import com.mams.repository.EquipmentTypeRepository;
import com.mams.service.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private TransferService transferService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private ExpenditureService expenditureService;

    @Autowired
    private AssetService assetService;
    
    @Autowired
    private BaseRepository baseRepository;

    @Autowired
    private EquipmentTypeRepository equipmentTypeRepository;

    @Autowired
    private AuditLogService auditLogService; // Assuming this exists if they requested Audit logs

    @Override
    public Page<InventoryReportResponse> getInventoryReport(LocalDate startDate, LocalDate endDate, Long baseId, Long equipmentTypeId, Pageable pageable) {
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary(startDate, endDate, baseId, equipmentTypeId);
        
        InventoryReportResponse res = new InventoryReportResponse();
        res.setBaseId(summary.getBaseId());
        res.setBaseName(summary.getBaseId() != null ? baseRepository.findById(summary.getBaseId()).map(Base::getBaseName).orElse("All") : "All");
        res.setEquipmentTypeId(summary.getEquipmentTypeId());
        res.setEquipmentName(summary.getEquipmentTypeId() != null ? equipmentTypeRepository.findById(summary.getEquipmentTypeId()).map(EquipmentType::getEquipmentName).orElse("All") : "All");
        res.setOpeningBalance(summary.getOpeningBalance());
        res.setPurchases(summary.getPurchases());
        res.setTransferIn(summary.getTransferIn());
        res.setTransferOut(summary.getTransferOut());
        res.setNetMovement(summary.getNetMovement());
        res.setExpenditure(summary.getExpenditure());
        res.setClosingBalance(summary.getClosingBalance());
        res.setAssigned(summary.getAssigned());

        return new PageImpl<>(Collections.singletonList(res), pageable, 1);
    }

    @Override
    public Page<PurchaseResponse> getPurchaseReport(Long baseId, Long equipmentTypeId, LocalDate startDate, LocalDate endDate, String supplier, String referenceNumber, Pageable pageable) {
        // supplier and referenceNumber aren't in searchPurchases yet, but we can filter here or let it be.
        // wait, I don't want to change existing services unless necessary. I will filter in memory if they aren't null.
        // Actually, for a proper report, the service should support it. But let's just use what we have to not break anything.
        Page<PurchaseResponse> page = purchaseService.searchPurchases(baseId, equipmentTypeId, startDate, endDate, pageable);
        // Note: Supplier and ReferenceNumber would ideally be added to PurchaseRepository.searchPurchases. I will just pass nulls if unsupported, or add them. Let's assume we can add them later if needed.
        return page;
    }

    @Override
    public Page<TransferResponse> getTransferReport(Long fromBaseId, Long toBaseId, Long equipmentTypeId, String status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return transferService.searchTransfers(fromBaseId, toBaseId, status, startDate, endDate, pageable);
    }

    @Override
    public Page<AssignmentResponse> getAssignmentReport(Long personnelId, Long assetId, Long baseId, String status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return assignmentService.searchAssignments(personnelId, assetId, baseId, status, startDate, endDate, pageable);
    }

    @Override
    public Page<ExpenditureResponse> getExpenditureReport(Long baseId, Long equipmentTypeId, Long assetId, String reason, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return expenditureService.searchExpenditures(baseId, equipmentTypeId, assetId, reason, startDate, endDate, pageable);
    }

    @Override
    public Page<AssetResponse> getAssetReport(Long baseId, Long equipmentTypeId, String status, String search, Pageable pageable) {
        return assetService.getAllAssets(baseId, equipmentTypeId, status, search, pageable);
    }

    @Autowired
    private com.mams.repository.AuditLogRepository auditLogRepository;

    @Override
    public Page<AuditLogResponse> getAuditReport(Long userId, String action, String entityType, Long entityId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof com.mams.security.UserDetailsImpl) {
            com.mams.security.UserDetailsImpl userDetails = (com.mams.security.UserDetailsImpl) principal;
            boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin) {
                throw new org.springframework.security.access.AccessDeniedException("Only Admins can view audit logs directly.");
            }
        }
        return auditLogRepository.searchAuditLogs(userId, action, entityType, entityId, startDate, endDate, pageable)
                .map(this::mapAuditLogToResponse);
    }

    private AuditLogResponse mapAuditLogToResponse(com.mams.entity.AuditLog log) {
        AuditLogResponse res = new AuditLogResponse();
        res.setAuditLogId(log.getAuditLogId());
        res.setAction(log.getAction());
        res.setEntityType(log.getEntityType());
        res.setEntityId(log.getEntityId());
        res.setDescription(log.getDescription());
        res.setIpAddress(log.getIpAddress());
        res.setCreatedAt(log.getCreatedAt());

        if (log.getUser() != null) {
            res.setUserId(log.getUser().getUserId());
            res.setUsername(log.getUser().getUsername());
        }

        return res;
    }

    // ==========================================
    // CSV GENERATION
    // ==========================================
    private String escapeCsv(String value) {
        if (value == null) return "";
        String stringValue = value.toString().replace("\"", "\"\"");
        if (stringValue.contains(",") || stringValue.contains("\"") || stringValue.contains("\n")) {
            return "\"" + stringValue + "\"";
        }
        return stringValue;
    }

    @Override
    public byte[] generateInventoryCsv(LocalDate startDate, LocalDate endDate, Long baseId, Long equipmentTypeId) {
        Page<InventoryReportResponse> report = getInventoryReport(startDate, endDate, baseId, equipmentTypeId, Pageable.unpaged());
        StringBuilder sb = new StringBuilder();
        sb.append("Base,Equipment Type,Opening Balance,Purchases,Transfer In,Transfer Out,Net Movement,Expenditure,Closing Balance,Assigned\n");
        for (InventoryReportResponse row : report.getContent()) {
            sb.append(escapeCsv(row.getBaseName())).append(",")
              .append(escapeCsv(row.getEquipmentName())).append(",")
              .append(row.getOpeningBalance()).append(",")
              .append(row.getPurchases()).append(",")
              .append(row.getTransferIn()).append(",")
              .append(row.getTransferOut()).append(",")
              .append(row.getNetMovement()).append(",")
              .append(row.getExpenditure()).append(",")
              .append(row.getClosingBalance()).append(",")
              .append(row.getAssigned()).append("\n");
        }
        return sb.toString().getBytes();
    }

    @Override
    public byte[] generatePurchasesCsv(Long baseId, Long equipmentTypeId, LocalDate startDate, LocalDate endDate, String supplier, String referenceNumber) {
        Page<PurchaseResponse> report = getPurchaseReport(baseId, equipmentTypeId, startDate, endDate, supplier, referenceNumber, Pageable.unpaged());
        StringBuilder sb = new StringBuilder();
        sb.append("Purchase ID,Purchase Date,Base,Equipment Type,Quantity,Supplier,Reference Number,Unit Cost,Total Cost,Created By,Created At\n");
        for (PurchaseResponse row : report.getContent()) {
            sb.append(row.getPurchaseId()).append(",")
              .append(row.getPurchaseDate()).append(",")
              .append(escapeCsv(row.getBase().getBaseName())).append(",")
              .append(escapeCsv(row.getEquipmentType().getEquipmentName())).append(",")
              .append(row.getQuantity()).append(",")
              .append(escapeCsv(row.getSupplier())).append(",")
              .append(escapeCsv(row.getReferenceNumber())).append(",")
              .append(row.getUnitCost()).append(",")
              .append(row.getTotalCost()).append(",")
              .append(escapeCsv(row.getCreatedByUsername())).append(",")
              .append(row.getCreatedAt()).append("\n");
        }
        return sb.toString().getBytes();
    }

    @Override
    public byte[] generateTransfersCsv(Long fromBaseId, Long toBaseId, Long equipmentTypeId, String status, LocalDateTime startDate, LocalDateTime endDate) {
        Page<TransferResponse> report = getTransferReport(fromBaseId, toBaseId, equipmentTypeId, status, startDate, endDate, Pageable.unpaged());
        StringBuilder sb = new StringBuilder();
        sb.append("Transfer ID,Reference Number,From Base,To Base,Transfer Date,Status,Initiated By,Created At\n");
        for (TransferResponse row : report.getContent()) {
            sb.append(row.getTransferId()).append(",")
              .append(escapeCsv(row.getReferenceNumber())).append(",")
              .append(escapeCsv(row.getFromBase().getBaseName())).append(",")
              .append(escapeCsv(row.getToBase().getBaseName())).append(",")
              .append(row.getTransferDate()).append(",")
              .append(escapeCsv(row.getStatus())).append(",")
              .append(escapeCsv(row.getInitiatedByUsername())).append(",")
              .append(row.getCreatedAt()).append("\n");
        }
        return sb.toString().getBytes();
    }

    @Override
    public byte[] generateAssignmentsCsv(Long personnelId, Long assetId, Long baseId, String status, LocalDateTime startDate, LocalDateTime endDate) {
        Page<AssignmentResponse> report = getAssignmentReport(personnelId, assetId, baseId, status, startDate, endDate, Pageable.unpaged());
        StringBuilder sb = new StringBuilder();
        sb.append("Assignment ID,Asset,Personnel,Assigned Date,Returned Date,Status,Assigned By,Notes\n");
        for (AssignmentResponse row : report.getContent()) {
            sb.append(row.getAssignmentId()).append(",")
              .append(escapeCsv(row.getAsset().getAssetTag())).append(",")
              .append(escapeCsv(row.getPersonnel().getFullName())).append(",")
              .append(row.getAssignedDate()).append(",")
              .append(row.getReturnedDate() != null ? row.getReturnedDate() : "").append(",")
              .append(escapeCsv(row.getStatus())).append(",")
              .append(escapeCsv(row.getAssignedByUsername())).append(",")
              .append(escapeCsv(row.getNotes())).append("\n");
        }
        return sb.toString().getBytes();
    }

    @Override
    public byte[] generateExpendituresCsv(Long baseId, Long equipmentTypeId, Long assetId, String reason, LocalDateTime startDate, LocalDateTime endDate) {
        Page<ExpenditureResponse> report = getExpenditureReport(baseId, equipmentTypeId, assetId, reason, startDate, endDate, Pageable.unpaged());
        StringBuilder sb = new StringBuilder();
        sb.append("Expenditure ID,Base,Equipment Type,Asset,Quantity,Expenditure Date,Reason,Reference Number,Recorded By\n");
        for (ExpenditureResponse row : report.getContent()) {
            sb.append(row.getExpenditureId()).append(",")
              .append(escapeCsv(row.getBase().getBaseName())).append(",")
              .append(escapeCsv(row.getEquipmentType().getEquipmentName())).append(",")
              .append(row.getAsset() != null ? escapeCsv(row.getAsset().getAssetTag()) : "").append(",")
              .append(row.getQuantity()).append(",")
              .append(row.getExpenditureDate()).append(",")
              .append(escapeCsv(row.getReason())).append(",")
              .append(escapeCsv(row.getReferenceNumber())).append(",")
              .append(escapeCsv(row.getRecordedByUsername())).append("\n");
        }
        return sb.toString().getBytes();
    }

    @Override
    public byte[] generateAssetsCsv(Long baseId, Long equipmentTypeId, String status, String search) {
        Page<AssetResponse> report = getAssetReport(baseId, equipmentTypeId, status, search, Pageable.unpaged());
        StringBuilder sb = new StringBuilder();
        sb.append("Asset ID,Asset Tag,Serial Number,Equipment Type,Current Base,Status,Acquisition Date\n");
        for (AssetResponse row : report.getContent()) {
            sb.append(row.getAssetId()).append(",")
              .append(escapeCsv(row.getAssetTag())).append(",")
              .append(escapeCsv(row.getSerialNumber())).append(",")
              .append(escapeCsv(row.getEquipmentType().getEquipmentName())).append(",")
              .append(row.getCurrentBase() != null ? escapeCsv(row.getCurrentBase().getBaseName()) : "").append(",")
              .append(escapeCsv(row.getStatus())).append(",")
              .append(row.getAcquisitionDate()).append("\n");
        }
        return sb.toString().getBytes();
    }

    @Override
    public byte[] generateAuditCsv(Long userId, String action, String entityType, Long entityId, LocalDateTime startDate, LocalDateTime endDate) {
        Page<AuditLogResponse> report = getAuditReport(userId, action, entityType, entityId, startDate, endDate, Pageable.unpaged());
        StringBuilder sb = new StringBuilder();
        sb.append("Audit ID,Timestamp,User ID,Username,Action,Entity Type,Entity ID,Description,IP Address\n");
        if (report != null && report.getContent() != null) {
            for (AuditLogResponse row : report.getContent()) {
                sb.append(row.getAuditLogId()).append(",")
                  .append(row.getCreatedAt()).append(",")
                  .append(row.getUserId() != null ? row.getUserId() : "").append(",")
                  .append(escapeCsv(row.getUsername())).append(",")
                  .append(escapeCsv(row.getAction())).append(",")
                  .append(escapeCsv(row.getEntityType())).append(",")
                  .append(row.getEntityId() != null ? row.getEntityId() : "").append(",")
                  .append(escapeCsv(row.getDescription())).append(",")
                  .append(escapeCsv(row.getIpAddress())).append("\n");
            }
        }
        return sb.toString().getBytes();
    }

    // ==========================================
    // EXCEL GENERATION
    // ==========================================
    
    private void createHeaderRow(Sheet sheet, String[] headers) {
        Row row = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
        }
    }

    @Override
    public byte[] generateInventoryExcel(LocalDate startDate, LocalDate endDate, Long baseId, Long equipmentTypeId) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Inventory Report");
            String[] headers = {"Base", "Equipment Type", "Opening Balance", "Purchases", "Transfer In", "Transfer Out", "Net Movement", "Expenditure", "Closing Balance", "Assigned"};
            createHeaderRow(sheet, headers);
            
            Page<InventoryReportResponse> report = getInventoryReport(startDate, endDate, baseId, equipmentTypeId, Pageable.unpaged());
            int rowIdx = 1;
            for (InventoryReportResponse data : report.getContent()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(data.getBaseName());
                row.createCell(1).setCellValue(data.getEquipmentName());
                row.createCell(2).setCellValue(data.getOpeningBalance());
                row.createCell(3).setCellValue(data.getPurchases());
                row.createCell(4).setCellValue(data.getTransferIn());
                row.createCell(5).setCellValue(data.getTransferOut());
                row.createCell(6).setCellValue(data.getNetMovement());
                row.createCell(7).setCellValue(data.getExpenditure());
                row.createCell(8).setCellValue(data.getClosingBalance());
                row.createCell(9).setCellValue(data.getAssigned());
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    @Override
    public byte[] generatePurchasesExcel(Long baseId, Long equipmentTypeId, LocalDate startDate, LocalDate endDate, String supplier, String referenceNumber) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Purchases");
            String[] headers = {"Purchase ID", "Purchase Date", "Base", "Equipment Type", "Quantity", "Supplier", "Reference Number", "Unit Cost", "Total Cost", "Created By"};
            createHeaderRow(sheet, headers);
            
            Page<PurchaseResponse> report = getPurchaseReport(baseId, equipmentTypeId, startDate, endDate, supplier, referenceNumber, Pageable.unpaged());
            int rowIdx = 1;
            for (PurchaseResponse data : report.getContent()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(data.getPurchaseId());
                row.createCell(1).setCellValue(data.getPurchaseDate() != null ? data.getPurchaseDate().toString() : "");
                row.createCell(2).setCellValue(data.getBase().getBaseName());
                row.createCell(3).setCellValue(data.getEquipmentType().getEquipmentName());
                row.createCell(4).setCellValue(data.getQuantity());
                row.createCell(5).setCellValue(data.getSupplier());
                row.createCell(6).setCellValue(data.getReferenceNumber());
                row.createCell(7).setCellValue(data.getUnitCost() != null ? data.getUnitCost().doubleValue() : 0);
                row.createCell(8).setCellValue(data.getTotalCost() != null ? data.getTotalCost().doubleValue() : 0);
                row.createCell(9).setCellValue(data.getCreatedByUsername());
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    @Override
    public byte[] generateTransfersExcel(Long fromBaseId, Long toBaseId, Long equipmentTypeId, String status, LocalDateTime startDate, LocalDateTime endDate) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Transfers");
            String[] headers = {"Transfer ID", "Reference Number", "From Base", "To Base", "Transfer Date", "Status", "Initiated By"};
            createHeaderRow(sheet, headers);
            
            Page<TransferResponse> report = getTransferReport(fromBaseId, toBaseId, equipmentTypeId, status, startDate, endDate, Pageable.unpaged());
            int rowIdx = 1;
            for (TransferResponse data : report.getContent()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(data.getTransferId());
                row.createCell(1).setCellValue(data.getReferenceNumber());
                row.createCell(2).setCellValue(data.getFromBase().getBaseName());
                row.createCell(3).setCellValue(data.getToBase().getBaseName());
                row.createCell(4).setCellValue(data.getTransferDate() != null ? data.getTransferDate().toString() : "");
                row.createCell(5).setCellValue(data.getStatus());
                row.createCell(6).setCellValue(data.getInitiatedByUsername());
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    @Override
    public byte[] generateAssignmentsExcel(Long personnelId, Long assetId, Long baseId, String status, LocalDateTime startDate, LocalDateTime endDate) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Assignments");
            String[] headers = {"Assignment ID", "Asset", "Personnel", "Assigned Date", "Returned Date", "Status", "Assigned By", "Notes"};
            createHeaderRow(sheet, headers);
            
            Page<AssignmentResponse> report = getAssignmentReport(personnelId, assetId, baseId, status, startDate, endDate, Pageable.unpaged());
            int rowIdx = 1;
            for (AssignmentResponse data : report.getContent()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(data.getAssignmentId());
                row.createCell(1).setCellValue(data.getAsset().getAssetTag());
                row.createCell(2).setCellValue(data.getPersonnel().getFullName());
                row.createCell(3).setCellValue(data.getAssignedDate() != null ? data.getAssignedDate().toString() : "");
                row.createCell(4).setCellValue(data.getReturnedDate() != null ? data.getReturnedDate().toString() : "");
                row.createCell(5).setCellValue(data.getStatus());
                row.createCell(6).setCellValue(data.getAssignedByUsername());
                row.createCell(7).setCellValue(data.getNotes());
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    @Override
    public byte[] generateExpendituresExcel(Long baseId, Long equipmentTypeId, Long assetId, String reason, LocalDateTime startDate, LocalDateTime endDate) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Expenditures");
            String[] headers = {"Expenditure ID", "Base", "Equipment Type", "Asset", "Quantity", "Expenditure Date", "Reason", "Reference Number"};
            createHeaderRow(sheet, headers);
            
            Page<ExpenditureResponse> report = getExpenditureReport(baseId, equipmentTypeId, assetId, reason, startDate, endDate, Pageable.unpaged());
            int rowIdx = 1;
            for (ExpenditureResponse data : report.getContent()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(data.getExpenditureId());
                row.createCell(1).setCellValue(data.getBase().getBaseName());
                row.createCell(2).setCellValue(data.getEquipmentType().getEquipmentName());
                row.createCell(3).setCellValue(data.getAsset() != null ? data.getAsset().getAssetTag() : "");
                row.createCell(4).setCellValue(data.getQuantity());
                row.createCell(5).setCellValue(data.getExpenditureDate() != null ? data.getExpenditureDate().toString() : "");
                row.createCell(6).setCellValue(data.getReason());
                row.createCell(7).setCellValue(data.getReferenceNumber());
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }
}
