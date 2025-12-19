package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.CaseDTO;
import com.nyaysetu.backend.dto.CreateCaseRequest;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.CaseManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
@Slf4j
public class CaseManagementController {

    private final CaseManagementService caseManagementService;
    private final com.nyaysetu.backend.service.AuthService authService;

    @PostMapping
    public ResponseEntity<CaseDTO> createCase(
            @RequestBody CreateCaseRequest request,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        CaseDTO caseDTO = caseManagementService.createCase(request, user);
        return ResponseEntity.ok(caseDTO);
    }

    @GetMapping
    public ResponseEntity<List<CaseDTO>> getMyCases(Authentication authentication) {
        try {
            log.info("Getting cases for user: {}", authentication.getName());
            User user = authService.findByEmail(authentication.getName());
            List<CaseDTO> cases = caseManagementService.getCasesByUser(user);
            log.info("Found {} cases for user {}", cases.size(), authentication.getName());
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            log.error("Error fetching cases for user {}: {}", authentication.getName(), e.getMessage());
            return ResponseEntity.ok(Collections.emptyList()); // Return empty list instead of error
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseDTO> getCaseById(@PathVariable UUID id) {
        CaseDTO caseDTO = caseManagementService.getCaseById(id);
        return ResponseEntity.ok(caseDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CaseDTO> updateCase(
            @PathVariable UUID id,
            @RequestBody CaseDTO caseDTO
    ) {
        CaseDTO updated = caseManagementService.updateCase(id, caseDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCase(@PathVariable UUID id) {
        caseManagementService.deleteCase(id);
        return ResponseEntity.ok(Map.of("message", "Case deleted successfully"));
    }
}
