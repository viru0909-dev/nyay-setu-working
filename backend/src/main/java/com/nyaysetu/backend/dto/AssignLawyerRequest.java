package com.nyaysetu.backend.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignLawyerRequest {
    private UUID caseId;
    private UUID lawyerId;
}