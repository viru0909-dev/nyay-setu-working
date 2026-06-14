package com.nyaysetu.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceHistoryItemDto {
    private UUID id;
    private String title;
    private String fileName;
    private String fileHash;
    private Boolean isVerified;
    private String verificationStatus;
    private String uploadedByName;
    private LocalDateTime createdAt;
    private Integer blockIndex;
}
