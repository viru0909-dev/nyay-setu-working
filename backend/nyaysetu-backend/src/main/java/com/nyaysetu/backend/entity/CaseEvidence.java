package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseEvidence {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID legalCaseId;

    private String fileName;

    private String fileUrl;

    private UUID uploadedBy;
}