package com.nyaysetu.backend.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JudgeSummaryDto {
    private String caseType;
    private String petitioner;
    private String respondent;
    private String factsSummary;
    private List<String> legalIssues;
    private List<String> evidenceList;
    private String urgency;
    private String aiRecommendation;
    private Double confidenceScore;
}
