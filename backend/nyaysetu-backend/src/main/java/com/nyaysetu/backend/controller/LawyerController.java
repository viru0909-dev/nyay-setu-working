package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.CaseDTO;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.CaseManagementService;
import com.nyaysetu.backend.service.HearingService;
import com.nyaysetu.backend.service.LawyerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tag(name = "Lawyer Portal", description = "Lawyer dashboard — client cases, evidence and hearing schedule")
@RestController
@RequestMapping("/lawyer")
@RequiredArgsConstructor
@Slf4j
public class LawyerController {

    private final CaseManagementService caseManagementService;
    private final AuthService authService;
    private final CaseRepository caseRepository;
    private final HearingService hearingService;
    private final LawyerService lawyerService;

    @Operation(summary = "Generate AI legal document draft", description = "Generate draft document for case based on selected template")
    @PostMapping("/draft")
    public ResponseEntity<Map<String, String>> generateDraft(
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        UUID caseId = UUID.fromString(request.get("caseId"));
        String template = request.get("template");
        String draft = lawyerService.generateDraft(caseId, template);
        return ResponseEntity.ok(Map.of("draft", draft));
    }

    @Operation(summary = "Save legal document draft", description = "Save edited draft text for a case")
    @PostMapping("/draft/save")
    public ResponseEntity<Void> saveDraft(
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        UUID caseId = UUID.fromString(request.get("caseId"));
        String draft = request.get("draft");
        lawyerService.saveDraft(caseId, draft);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get lawyer cases", description = "Retrieve paginated list of cases represented by the lawyer")
    @GetMapping("/cases")
    public ResponseEntity<Page<CaseDTO>> getMyCases(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        User lawyer = authService.findByEmail(authentication.getName());
        Page<CaseDTO> cases = caseManagementService.getCasesByLawyer(lawyer, pageable);
        return ResponseEntity.ok(cases);
    }

    @Operation(summary = "Get lawyer clients", description = "List unique clients associated with lawyer's active cases")
    @GetMapping("/clients")
    public ResponseEntity<List<Map<String, Object>>> getMyClients(Authentication authentication) {
        User lawyer = authService.findByEmail(authentication.getName());
        List<CaseEntity> cases = caseRepository.findByLawyer(lawyer);
        
        List<Map<String, Object>> clients = cases.stream()
                .map(CaseEntity::getClient)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .map(client -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", client.getId());
                    map.put("name", client.getName());
                    map.put("email", client.getEmail());
                    return map;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(clients);
    }

    @Operation(summary = "Get lawyer stats", description = "Get statistical overview for lawyer dashboard")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(Authentication authentication) {
        User lawyer = authService.findByEmail(authentication.getName());
        Map<String, Object> stats = lawyerService.getLawyerStats(lawyer);
        
        int upcomingHearings = hearingService.getHearingsForUser(lawyer.getEmail()).size();
        
        Map<String, Object> response = new HashMap<>(stats);
        response.put("upcomingHearings", upcomingHearings);

        return ResponseEntity.ok(response);
    }
}
