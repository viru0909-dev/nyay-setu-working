package com.nyaysetu.backend.dto;

import lombok.*;

import java.util.List;
import java.util.UUID;

/**
 * Response for document analysis by Vakil Friend AI.
 * Contains document assessment, validity, relevance, and storage recommendation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentAnalysisResponse {

    private UUID documentId;
    private String documentName;
    private String sha256Hash;

    // Document Analysis
    private String documentType; // E.g., "Agreement", "FIR Copy", "Medical Certificate"
    private String summary;
    private String language;

    // Validity Assessment
    private String validityStatus; // VALID, INVALID, PARTIALLY_VALID, REQUIRES_REVIEW
    private String validityReason;
    private List<String> validityIssues;

    // Usefulness for Case
    private String usefulnessLevel; // HIGH, MEDIUM, LOW, NOT_RELEVANT
    private String usefulnessExplanation;
    private List<String> keyPoints; // Important points extracted

    // Recommendation
    private boolean recommendStoreInVault;
    private String recommendationReason;
    private String suggestedCategory; // EVIDENCE, PETITION, SUPPORTING_DOCUMENT, etc.

    // Legal Relevance
    private List<String> relevantLegalSections;
    private List<String> potentialUses;

    // Metadata
    private String analysisTimestamp;
    private boolean storedInVault;
    private String vaultStorageId;

    // Diary Entry tracking
    private UUID diaryEntryId;
}
