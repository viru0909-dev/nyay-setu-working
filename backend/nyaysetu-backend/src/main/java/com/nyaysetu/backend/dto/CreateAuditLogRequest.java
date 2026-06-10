package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateAuditLogRequest {

    @NotBlank(message = "Action is required")
    private String action;

    @NotBlank(message = "User ID is required")
    private String userId;

    private String details;     // optional
    private String description; // optional
}
