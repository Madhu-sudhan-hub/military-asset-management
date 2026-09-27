package com.mams.dto.response;

public class TransferItemResponse {
    private Long transferItemId;
    private EquipmentTypeResponse equipmentType;
    private AssetResponse asset;
    private Integer quantity;

    public Long getTransferItemId() { return transferItemId; }
    public void setTransferItemId(Long transferItemId) { this.transferItemId = transferItemId; }
    public EquipmentTypeResponse getEquipmentType() { return equipmentType; }
    public void setEquipmentType(EquipmentTypeResponse equipmentType) { this.equipmentType = equipmentType; }
    public AssetResponse getAsset() { return asset; }
    public void setAsset(AssetResponse asset) { this.asset = asset; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
