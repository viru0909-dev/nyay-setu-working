package com.nyaysetu.caseservice.controller;

import com.nyaysetu.caseservice.dto.CreateCaseRequest;
import com.nyaysetu.caseservice.dto.UpdateStatusRequest;
import com.nyaysetu.caseservice.entity.CaseStatus;
import com.nyaysetu.caseservice.entity.LegalCase;
import com.nyaysetu.caseservice.service.CaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;

    @PostMapping
    public LegalCase createCase(@RequestBody CreateCaseRequest request) {
        return caseService.createCase(request);
    }

    @GetMapping("/{caseId}")
    public LegalCase getCase(@PathVariable UUID caseId) {
        return caseService.getCase(caseId);
    }

    @GetMapping
    public List<LegalCase> getAllCases() {
        return caseService.getAllCases();
    }

    @PutMapping("/{caseId}/status")
    public LegalCase updateStatus(
            @PathVariable UUID caseId,
            @RequestBody UpdateStatusRequest request
    ) {
        return caseService.updateStatus(caseId, CaseStatus.valueOf(request.getStatus()));
    }
}