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
    public String getUploaderName() {
    return uploaderName;
}

public void setUploaderName(
        String uploaderName
) {
    this.uploaderName = uploaderName;
}

public LocalDateTime getUploadedAt() {
    return uploadedAt;
}

public void setUploadedAt(
        LocalDateTime uploadedAt
) {
    this.uploadedAt = uploadedAt;
}

public String getFileHash() {
    return fileHash;
}

public void setFileHash(
        String fileHash
) {
    this.fileHash = fileHash;
}

public Boolean getIsVerified() {
    return isVerified;
}

public void setIsVerified(
        Boolean verified
) {
    isVerified = verified;
}
}