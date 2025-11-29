package com.nyaysetu.auditservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAuditLogRequest {
    private UUID userId;
    private String action;
    private String description;
}