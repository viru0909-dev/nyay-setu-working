package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignLawyerRequest {

    @NotNull(message = "Case ID is required")
    private UUID caseId;

    @NotNull(message = "Lawyer ID is required")
    private UUID lawyerId;
}