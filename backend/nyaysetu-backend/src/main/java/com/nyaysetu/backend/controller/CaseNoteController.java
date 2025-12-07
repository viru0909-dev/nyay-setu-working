package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.AddNoteRequest;
import com.nyaysetu.backend.dto.CreateNoteRequest;
import com.nyaysetu.backend.entity.CaseNote;
import com.nyaysetu.backend.exception.NotFoundException;
import com.nyaysetu.backend.repository.CaseNoteRepository;
import com.nyaysetu.backend.service.CaseNoteService;
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