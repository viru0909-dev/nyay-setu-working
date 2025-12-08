package com.nyaysetu.backend.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDto {
    private UUID id;
    private String fileName;
    private String contentType;
    private long size;
    private String category;
    private String description;
    private UUID caseId;
    private String caseTitle;
    private String uploaderName;
    private LocalDateTime uploadedAt;
    private String fileUrl;
}