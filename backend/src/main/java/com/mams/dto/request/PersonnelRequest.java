package com.mams.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PersonnelRequest {

    @NotBlank(message = "Employee Number is required")
    private String employeeNumber;

    @NotBlank(message = "Full Name is required")
    private String fullName;

    private String rank;
    private String contactNumber;

    @NotNull(message = "Base ID is required")
    private Long baseId;

    private String status;

    public String getEmployeeNumber() { return employeeNumber; }
    public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRank() { return rank; }
    public void setRank(String rank) { this.rank = rank; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public Long getBaseId() { return baseId; }
    public void setBaseId(Long baseId) { this.baseId = baseId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
