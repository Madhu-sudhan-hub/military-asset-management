package com.mams.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public class TransferRequest {

    @NotNull(message = "Source base is required")
    private Long fromBaseId;

    @NotNull(message = "Destination base is required")
    private Long toBaseId;

    @NotNull(message = "Transfer date is required")
    private LocalDateTime transferDate;

    @NotBlank(message = "Reference number is required")
    private String referenceNumber;

    @NotEmpty(message = "At least one item is required for transfer")
    @Valid
    private List<TransferItemRequest> items;

    public Long getFromBaseId() { return fromBaseId; }
    public void setFromBaseId(Long fromBaseId) { this.fromBaseId = fromBaseId; }
    public Long getToBaseId() { return toBaseId; }
    public void setToBaseId(Long toBaseId) { this.toBaseId = toBaseId; }
    public LocalDateTime getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDateTime transferDate) { this.transferDate = transferDate; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public List<TransferItemRequest> getItems() { return items; }
    public void setItems(List<TransferItemRequest> items) { this.items = items; }
}
