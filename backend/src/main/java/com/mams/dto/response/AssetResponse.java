package com.mams.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AssetResponse {
    private Long assetId;
    private String assetTag;
    private EquipmentTypeResponse equipmentType;
    private BaseResponse currentBase;
    private String serialNumber;
    private String status;
    private LocalDate acquisitionDate;
    private LocalDateTime createdAt;

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }
    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }
    public EquipmentTypeResponse getEquipmentType() { return equipmentType; }
    public void setEquipmentType(EquipmentTypeResponse equipmentType) { this.equipmentType = equipmentType; }
    public BaseResponse getCurrentBase() { return currentBase; }
    public void setCurrentBase(BaseResponse currentBase) { this.currentBase = currentBase; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getAcquisitionDate() { return acquisitionDate; }
    public void setAcquisitionDate(LocalDate acquisitionDate) { this.acquisitionDate = acquisitionDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
