package com.nyaysetu.backend.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FirUploadResponse {
    private Long id;
    private String firNumber;
    private String title;
    private String description;
    private String fileHash; // SHA-256 Digital Fingerprint
    private String fileName;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    private String status;
    private UUID caseId;
    private String uploadedByName;
    private boolean verified;
}
