package com.mams.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BaseRequest {

    @NotBlank(message = "Base Code is required")
    @Size(max = 255)
    private String baseCode;

    @NotBlank(message = "Base Name is required")
    @Size(max = 255)
    private String baseName;

    private String location;

    private String status;

    public String getBaseCode() { return baseCode; }
    public void setBaseCode(String baseCode) { this.baseCode = baseCode; }
    public String getBaseName() { return baseName; }
    public void setBaseName(String baseName) { this.baseName = baseName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
