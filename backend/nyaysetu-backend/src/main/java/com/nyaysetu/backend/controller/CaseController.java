package com.nyaysetu.backend.controller;

import java.util.UUID;
import java.util.List;
import com.nyaysetu.backend.dto.CreateCaseRequest;
import com.nyaysetu.backend.entity.CaseEntity;
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
    public ResponseEntity<CaseEntity> createCase(@RequestBody CreateCaseRequest dto) {
        return new ResponseEntity<>(caseService.createCase(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseEntity> getCase(@PathVariable UUID id) {
        return ResponseEntity.ok(caseService.getCase(id));
    }

    // 🛠️ PAGINATED ENDPOINT FOR ISSUE #828
    @GetMapping
    public ResponseEntity<Page<CaseEntity>> getAllCases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<CaseEntity> casesPage = caseService.getAllCases(page, size);
        return ResponseEntity.ok(casesPage);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CaseEntity> updateStatus(
            @PathVariable UUID id,
            @RequestParam CaseStatus status
    ) {
        return ResponseEntity.ok(caseService.updateStatus(id, status));
    }

    @PostMapping("/{caseId}/appeal")
    public ResponseEntity<CaseEntity> createAppeal(
            @PathVariable UUID caseId,
            @RequestParam String reason
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(caseService.createAppeal(caseId, reason));
    }

    @GetMapping("/{caseId}/appeals")
    public ResponseEntity<List<CaseEntity>> getAppeals(
            @PathVariable UUID caseId
    ) {
        return ResponseEntity.ok(caseService.getAppeals(caseId));
    }

    @PutMapping("/appeals/{appealId}/status")
    public ResponseEntity<CaseEntity> updateAppealStatus(
            @PathVariable UUID appealId,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(
                caseService.updateAppealStatus(appealId, status)
        );
    }
}