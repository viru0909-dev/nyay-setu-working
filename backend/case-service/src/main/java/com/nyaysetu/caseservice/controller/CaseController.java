package com.nyaysetu.caseservice.controller;

import com.nyaysetu.caseservice.dto.CreateCaseRequest;
import com.nyaysetu.caseservice.entity.CaseEntity;
import com.nyaysetu.caseservice.entity.CaseStatus;
import com.nyaysetu.caseservice.service.CaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;

    @PostMapping
    public ResponseEntity<CaseEntity> createCase(@RequestBody CreateCaseRequest request) {
        return ResponseEntity.ok(caseService.createCase(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseEntity> getCase(@PathVariable UUID id) {
        return ResponseEntity.ok(caseService.getCase(id));
    }

    @GetMapping("/judge/{judgeId}")
    public ResponseEntity<List<CaseEntity>> getCasesByJudge(@PathVariable UUID judgeId) {
        return ResponseEntity.ok(caseService.getCasesByJudge(judgeId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CaseEntity>> getCasesForUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(caseService.getCasesForUser(userId));
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<CaseEntity> updateStatus(@PathVariable UUID id, @RequestParam CaseStatus status) {
        return ResponseEntity.ok(caseService.updateStatus(id, status));
    }
}
