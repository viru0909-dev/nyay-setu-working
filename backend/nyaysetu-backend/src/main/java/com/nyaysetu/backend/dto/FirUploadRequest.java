package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FirUploadRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String complainantDetails;
    private String accusedDetails;
    private String offenceSections;
    private String policeStationCode;
    private String incidentLocation;
    private java.time.LocalDate incidentDate;
    private String status;

    private UUID caseId; // optional
}
