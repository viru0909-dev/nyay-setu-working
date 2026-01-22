package com.nyaysetu.backend.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientFirRequest {
    private String title;
    private String description;
    private LocalDate incidentDate;
    private String incidentLocation;
    private Boolean aiGenerated;
    private String aiSessionId;
    private UUID caseId; // Optional - link to existing case
}
