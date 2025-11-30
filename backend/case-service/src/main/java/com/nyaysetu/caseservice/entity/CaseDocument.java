package com.nyaysetu.caseservice.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;
    private String name;
    private String fileType;
    private String uploadedBy;

    @ManyToOne
    @JoinColumn(name = "case_id")
    private LegalCase legalCase;
}