package com.mams.dto.request;

import jakarta.validation.constraints.NotBlank;

public class EquipmentTypeRequest {

    @NotBlank(message = "Equipment Code is required")
    private String equipmentCode;

    @NotBlank(message = "Equipment Name is required")
    private String equipmentName;

    @NotBlank(message = "Category is required (VEHICLE, WEAPON, AMMUNITION, COMMUNICATION, OTHER)")
    private String category;

    @NotBlank(message = "Tracking Type is required (INDIVIDUAL, BULK)")
    private String trackingType;

    @NotBlank(message = "Unit of Measure is required")
    private String unitOfMeasure;

    private String status;

    public String getEquipmentCode() { return equipmentCode; }
    public void setEquipmentCode(String equipmentCode) { this.equipmentCode = equipmentCode; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getTrackingType() { return trackingType; }
    public void setTrackingType(String trackingType) { this.trackingType = trackingType; }
    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
