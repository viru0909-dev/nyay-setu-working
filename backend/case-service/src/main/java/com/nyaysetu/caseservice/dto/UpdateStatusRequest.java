package com.nyaysetu.caseservice.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateStatusRequest {
    private UUID caseId;
    private String status; // OPEN, IN_PROGRESS, CLOSED
}