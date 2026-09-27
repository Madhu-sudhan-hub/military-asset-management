package com.mams.dto.response;

import java.time.LocalDate;

public class DashboardSummaryResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private Long baseId;
    private Long equipmentTypeId;
    
    private Integer openingBalance;
    private Integer purchases;
    private Integer transferIn;
    private Integer transferOut;
    private Integer netMovement;
    private Integer expenditure;
    private Integer closingBalance;
    private Integer assigned;

    // Getters and Setters
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public Long getBaseId() { return baseId; }
    public void setBaseId(Long baseId) { this.baseId = baseId; }
    
    public Long getEquipmentTypeId() { return equipmentTypeId; }
    public void setEquipmentTypeId(Long equipmentTypeId) { this.equipmentTypeId = equipmentTypeId; }
    
    public Integer getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(Integer openingBalance) { this.openingBalance = openingBalance; }
    
    public Integer getPurchases() { return purchases; }
    public void setPurchases(Integer purchases) { this.purchases = purchases; }
    
    public Integer getTransferIn() { return transferIn; }
    public void setTransferIn(Integer transferIn) { this.transferIn = transferIn; }
    
    public Integer getTransferOut() { return transferOut; }
    public void setTransferOut(Integer transferOut) { this.transferOut = transferOut; }
    
    public Integer getNetMovement() { return netMovement; }
    public void setNetMovement(Integer netMovement) { this.netMovement = netMovement; }
    
    public Integer getExpenditure() { return expenditure; }
    public void setExpenditure(Integer expenditure) { this.expenditure = expenditure; }
    
    public Integer getClosingBalance() { return closingBalance; }
    public void setClosingBalance(Integer closingBalance) { this.closingBalance = closingBalance; }
    
    public Integer getAssigned() { return assigned; }
    public void setAssigned(Integer assigned) { this.assigned = assigned; }
}
