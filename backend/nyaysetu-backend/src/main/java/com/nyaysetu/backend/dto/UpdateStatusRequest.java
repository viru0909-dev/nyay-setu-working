package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateStatusRequest {

    @NotNull(message = "Case ID is required")
    private UUID caseId;

    @NotBlank(message = "Status is required")
    private String status; // OPEN, IN_PROGRESS, CLOSED
}