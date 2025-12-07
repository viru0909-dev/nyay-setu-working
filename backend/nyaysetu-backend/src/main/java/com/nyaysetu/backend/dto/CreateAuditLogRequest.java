package com.nyaysetu.backend.dto;

import lombok.Data;

@Data
public class CreateAuditLogRequest {
    private String action;
    private String userId;
    private String details;
    private String description;
}
