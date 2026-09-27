package com.mams.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class AssignmentRequest {

    @NotNull(message = "Asset ID is required")
    private Long assetId;

    @NotNull(message = "Personnel ID is required")
    private Long personnelId;

    @NotNull(message = "Assigned date is required")
    private LocalDateTime assignedDate;

    private String notes;

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }
    public Long getPersonnelId() { return personnelId; }
    public void setPersonnelId(Long personnelId) { this.personnelId = personnelId; }
    public LocalDateTime getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDateTime assignedDate) { this.assignedDate = assignedDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
