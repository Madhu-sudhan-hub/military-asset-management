package com.mams.dto.response;

import java.time.LocalDateTime;

public class PersonnelResponse {
    private Long personnelId;
    private String employeeNumber;
    private String fullName;
    private String rank;
    private String contactNumber;
    private BaseResponse base;
    private String status;
    private LocalDateTime createdAt;

    public Long getPersonnelId() { return personnelId; }
    public void setPersonnelId(Long personnelId) { this.personnelId = personnelId; }
    public String getEmployeeNumber() { return employeeNumber; }
    public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRank() { return rank; }
    public void setRank(String rank) { this.rank = rank; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public BaseResponse getBase() { return base; }
    public void setBase(BaseResponse base) { this.base = base; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
