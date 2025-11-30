package com.nyaysetu.caseservice.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseResponse {

    private UUID id;
    private String caseNumber;
    private String title;
    private String description;

    private String plaintiff;
    private String defendant;

    private String assignedJudge;
    private String assignedLawyer;

    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<DocumentDto> documents;
    private List<NoteDto> notes;
    private List<EvidenceDto> evidenceList;
    private List<HearingDto> hearings;
    private List<CommentResponse> comments;
}