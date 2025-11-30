package com.nyaysetu.caseservice.service;

import com.nyaysetu.caseservice.dto.AddNoteRequest;
import com.nyaysetu.caseservice.entity.CaseNote;
import com.nyaysetu.caseservice.entity.LegalCase;
import com.nyaysetu.caseservice.exception.NotFoundException;
import com.nyaysetu.caseservice.repository.CaseNoteRepository;
import com.nyaysetu.caseservice.repository.LegalCaseRepository;
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