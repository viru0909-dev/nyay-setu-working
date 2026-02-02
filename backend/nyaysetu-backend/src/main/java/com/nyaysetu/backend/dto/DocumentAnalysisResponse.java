package com.nyaysetu.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentAnalysisResponse {
    private UUID documentId;
    private String fileName;
    private String summary;
    private String extractedText;
    private String analysisJson;
}
