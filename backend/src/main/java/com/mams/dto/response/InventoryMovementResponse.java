package com.mams.dto.response;

import java.time.LocalDate;

public class InventoryMovementResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private Long baseId;
    private Long equipmentTypeId;
    
    private Integer purchases;
    private Integer transferIn;
    private Integer transferOut;
    private Integer expenditure;

    // Getters and Setters
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public Long getBaseId() { return baseId; }
    public void setBaseId(Long baseId) { this.baseId = baseId; }
    
    public Long getEquipmentTypeId() { return equipmentTypeId; }
    public void setEquipmentTypeId(Long equipmentTypeId) { this.equipmentTypeId = equipmentTypeId; }
    
    public Integer getPurchases() { return purchases; }
    public void setPurchases(Integer purchases) { this.purchases = purchases; }
    
    public Integer getTransferIn() { return transferIn; }
    public void setTransferIn(Integer transferIn) { this.transferIn = transferIn; }
    
    public Integer getTransferOut() { return transferOut; }
    public void setTransferOut(Integer transferOut) { this.transferOut = transferOut; }
    
    public Integer getExpenditure() { return expenditure; }
    public void setExpenditure(Integer expenditure) { this.expenditure = expenditure; }
}
