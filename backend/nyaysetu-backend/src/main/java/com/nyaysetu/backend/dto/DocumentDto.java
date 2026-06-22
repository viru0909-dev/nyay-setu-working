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
    private String fileHash; // SHA-256 hash for Section 63(4) compliance
    private String uploadIp; // IP address for audit trail
    private Boolean isVerified; // True if file hash was successfully calculated

    public DocumentDto(UUID id, String fileName, String contentType, long size,
                   String category, String description, UUID caseId,
                   String caseTitle, String uploaderName, LocalDateTime uploadedAt,
                   String fileUrl, String fileHash, String uploadIp, Boolean isVerified) {
                    
                    this.id = id;
                    this.fileName = fileName;
                    this.contentType = contentType;
                    this.size = size;
                    this.category = category;
                    this.description = description;
                    this.caseId = caseId;
                    this.caseTitle = caseTitle;
                    this.uploaderName = uploaderName;
                    this.uploadedAt = uploadedAt;
                    this.fileUrl = fileUrl;
                    this.fileHash = fileHash;
                    this.uploadIp = uploadIp;
                    this.isVerified = isVerified;
                }

}