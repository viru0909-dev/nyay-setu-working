package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.AddNoteRequest;
import com.nyaysetu.backend.entity.CaseNote;
import com.nyaysetu.backend.entity.LegalCase;
import com.nyaysetu.backend.exception.NotFoundException;
import com.nyaysetu.backend.repository.CaseNoteRepository;
import com.nyaysetu.backend.repository.LegalCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CaseNoteService {

    private final CaseNoteRepository caseNoteRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final CaseTimelineService timelineService;

    @Transactional
    public CaseNote addNote(UUID caseId, AddNoteRequest dto) {

        LegalCase lc = legalCaseRepository.findById(caseId)
                .orElseThrow(() -> new NotFoundException("Case not found " + caseId));

        CaseNote note = CaseNote.builder()
                .legalCaseId(caseId)
                .content(dto.getContent())
                .createdBy(dto.getAuthorId())
                .createdAt(LocalDateTime.now())
                .build();

        CaseNote saved = caseNoteRepository.save(note);

        timelineService.addEvent(caseId, "Note added");

        return saved;
    }

    public List<CaseNote> getNote(UUID caseId) {
        return caseNoteRepository.findByLegalCaseId(caseId);
    }
}