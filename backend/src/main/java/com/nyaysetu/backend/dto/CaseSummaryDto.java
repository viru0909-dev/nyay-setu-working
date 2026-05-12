package com.nyaysetu.backend.dto;

import com.nyaysetu.backend.entity.CaseStatus;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseSummaryDto {
    private UUID id;
    private String title;
    private String caseType;
    private CaseStatus status;
}
