package com.nyaysetu.backend.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignRequest {
    private UUID caseId;
    private UUID userId;
    private String role; // JUDGE, LAWYER, CLIENT
}