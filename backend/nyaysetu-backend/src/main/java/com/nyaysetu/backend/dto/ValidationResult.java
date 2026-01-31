package com.nyaysetu.backend.dto;

import lombok.*;
import java.util.List;

/**
 * Result of document validation (especially BSA Section 63(4) compliance).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationResult {
    
    /**
     * Whether the document is compliant with requirements
     */
    private boolean compliant;
    
    /**
     * List of missing metadata fields (for BSA 63(4))
     * e.g., ["Device Logs", "User ID", "SHA-256 Hash"]
     */
    private List<String> missingMetadata;
    
    /**
     * Blocking error message (prevents case from proceeding)
     * Only set for critical compliance failures
     */
    private String blockingError;
    
    /**
     * Suggestion for fixing the issue
     */
    private String suggestion;
    
    /**
     * Detailed explanation from Groq
     */
    private String details;
    
    /**
     * Confidence score of the validation (0.0 - 1.0)
     */
    private Double confidence;
    
    /**
     * Is this a blocking error that prevents case progression?
     */
    public boolean isBlocking() {
        return blockingError != null && !blockingError.isEmpty();
    }
    
    /**
     * Create a successful validation result
     */
    public static ValidationResult success(String details) {
        return ValidationResult.builder()
                .compliant(true)
                .details(details)
                .confidence(1.0)
                .build();
    }
    
    /**
     * Create a failed validation result with blocking error
     */
    public static ValidationResult blockingFailure(List<String> missingFields, String suggestion) {
        String error = "Section 63(4) BSA 2023 compliance failed. Missing: " + String.join(", ", missingFields);
        return ValidationResult.builder()
                .compliant(false)
                .missingMetadata(missingFields)
                .blockingError(error)
                .suggestion(suggestion)
                .confidence(0.0)
                .build();
    }
}
