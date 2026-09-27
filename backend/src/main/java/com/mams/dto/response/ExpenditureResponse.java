package com.mams.dto.response;

import java.time.LocalDateTime;

public class ExpenditureResponse {
    private Long expenditureId;
    private BaseResponse base;
    private EquipmentTypeResponse equipmentType;
    private AssetResponse asset;
    private Integer quantity;
    private LocalDateTime expenditureDate;
    private String reason;
    private String referenceNumber;
    private Long recordedById;
    private String recordedByUsername;
    private LocalDateTime createdAt;

    public Long getExpenditureId() { return expenditureId; }
    public void setExpenditureId(Long expenditureId) { this.expenditureId = expenditureId; }
    public BaseResponse getBase() { return base; }
    public void setBase(BaseResponse base) { this.base = base; }
    public EquipmentTypeResponse getEquipmentType() { return equipmentType; }
    public void setEquipmentType(EquipmentTypeResponse equipmentType) { this.equipmentType = equipmentType; }
    public AssetResponse getAsset() { return asset; }
    public void setAsset(AssetResponse asset) { this.asset = asset; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public LocalDateTime getExpenditureDate() { return expenditureDate; }
    public void setExpenditureDate(LocalDateTime expenditureDate) { this.expenditureDate = expenditureDate; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public Long getRecordedById() { return recordedById; }
    public void setRecordedById(Long recordedById) { this.recordedById = recordedById; }
    public String getRecordedByUsername() { return recordedByUsername; }
    public void setRecordedByUsername(String recordedByUsername) { this.recordedByUsername = recordedByUsername; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
