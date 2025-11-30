package com.nyaysetu.caseservice.controller;

import com.nyaysetu.caseservice.dto.AddNoteRequest;
import com.nyaysetu.caseservice.dto.CreateNoteRequest;
import com.nyaysetu.caseservice.entity.CaseNote;
import com.nyaysetu.caseservice.exception.NotFoundException;
import com.nyaysetu.caseservice.repository.CaseNoteRepository;
import com.nyaysetu.caseservice.service.CaseNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/cases/{caseId}/notes")
@RequiredArgsConstructor
public class CaseNoteController {

    private final CaseNoteService caseNoteService;
    private final CaseNoteRepository caseNoteRepository; ;

    @PostMapping
    public CaseNote addNote(
            @PathVariable UUID caseId,
            @RequestBody AddNoteRequest request
    ) {
        return caseNoteService.addNote(caseId, request);
    }


    public CaseNote getNote(UUID noteId) {
        return caseNoteRepository.findById(noteId)
                .orElseThrow(() -> new NotFoundException("Note not found: " + noteId));
    }
}