package com.nyaysetu.backend.dto;

import lombok.*;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentVerificationDto {
    private String documentType;
    private Boolean isVerified;
    private String extractedText;
    private Map<String, String> keyValuePairs;
    private Double confidenceScore;
    private String verificationStatus; // VERIFIED, FAILED, NEEDS_REVIEW
    private String errorMessage;
}
