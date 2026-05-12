package com.nyaysetu.backend.dto;

import lombok.*;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UploadDocumentRequest {
    private String category;
    private String description;
    private UUID caseId;
}
