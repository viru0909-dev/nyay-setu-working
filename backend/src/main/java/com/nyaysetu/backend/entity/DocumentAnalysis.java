package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "document_analysis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentAnalysis {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @OneToOne
    @JoinColumn(name = "document_id", unique = true)
    private DocumentEntity document;
    
    @Column(columnDefinition = "TEXT")
    private String summary;
    
    @Column(columnDefinition = "TEXT")
    private String legalPoints;
    
    @Column(columnDefinition = "TEXT")
    private String relevantLaws;
    
    @Column(columnDefinition = "TEXT")
    private String importantDates;
    
    @Column(columnDefinition = "TEXT")
    private String partiesInvolved;
    
    @Column(columnDefinition = "TEXT")
    private String caseLawSuggestions;
    
    private Integer score;
    private String complianceStatus;
    
    private String suggestedCategory;
    
    @Column(columnDefinition = "TEXT")
    private String riskAssessment;
    
    @Column(columnDefinition = "TEXT")
    private String fullAnalysisJson;
    
    private LocalDateTime analyzedAt;
    
    private Boolean analysisSuccess;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
}
