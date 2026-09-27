package com.mams.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class TransferResponse {
    private Long transferId;
    private BaseResponse fromBase;
    private BaseResponse toBase;
    private LocalDateTime transferDate;
    private String referenceNumber;
    private String status;
    private Long initiatedById;
    private String initiatedByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TransferItemResponse> items;

    public Long getTransferId() { return transferId; }
    public void setTransferId(Long transferId) { this.transferId = transferId; }
    public BaseResponse getFromBase() { return fromBase; }
    public void setFromBase(BaseResponse fromBase) { this.fromBase = fromBase; }
    public BaseResponse getToBase() { return toBase; }
    public void setToBase(BaseResponse toBase) { this.toBase = toBase; }
    public LocalDateTime getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDateTime transferDate) { this.transferDate = transferDate; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getInitiatedById() { return initiatedById; }
    public void setInitiatedById(Long initiatedById) { this.initiatedById = initiatedById; }
    public String getInitiatedByUsername() { return initiatedByUsername; }
    public void setInitiatedByUsername(String initiatedByUsername) { this.initiatedByUsername = initiatedByUsername; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<TransferItemResponse> getItems() { return items; }
    public void setItems(List<TransferItemResponse> items) { this.items = items; }
}
