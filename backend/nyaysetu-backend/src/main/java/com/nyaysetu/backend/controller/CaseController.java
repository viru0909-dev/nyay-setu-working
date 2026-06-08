package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.CreateCaseRequest;
import com.nyaysetu.backend.entity.LegalCase;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.service.CaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;

    @PostMapping
    public ResponseEntity<LegalCase> createCase(@RequestBody CreateCaseRequest dto) {
        return new ResponseEntity<>(caseService.createCase(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LegalCase> getCase(@PathVariable UUID id) {
        return ResponseEntity.ok(caseService.getCase(id));
    }

    // 🛠️ PAGINATED ENDPOINT FOR ISSUE #828
    @GetMapping
    public ResponseEntity<Page<LegalCase>> getAllCases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<LegalCase> casesPage = caseService.getAllCases(page, size);
        return ResponseEntity.ok(casesPage);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<LegalCase> updateStatus(
            @PathVariable UUID id,
            @RequestParam CaseStatus status
    ) {
        return ResponseEntity.ok(caseService.updateStatus(id, status));
    }
}