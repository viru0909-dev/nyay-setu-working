package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.CaseDTO;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.CaseManagementService;
import com.nyaysetu.backend.service.HearingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lawyer")
@RequiredArgsConstructor
@Slf4j
public class LawyerController {

    private final CaseManagementService caseManagementService;
    private final AuthService authService;
    private final CaseRepository caseRepository;
    private final HearingService hearingService;

    @GetMapping("/cases")
    public ResponseEntity<List<CaseDTO>> getMyCases(Authentication authentication) {
        User lawyer = authService.findByEmail(authentication.getName());
        List<CaseDTO> cases = caseManagementService.getCasesByLawyer(lawyer);
        return ResponseEntity.ok(cases);
    }

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

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(Authentication authentication) {
        User lawyer = authService.findByEmail(authentication.getName());
        
        long totalCases = caseRepository.countByLawyer(lawyer);
        long activeClients = caseRepository.findByLawyer(lawyer).stream()
                .map(CaseEntity::getClient)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count();
        
        // Mocking upcoming hearings count for now or fetching from hearingService
        int upcomingHearings = hearingService.getHearingsForUser(lawyer.getEmail()).size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCases", totalCases);
        stats.put("activeClients", activeClients);
        stats.put("upcomingHearings", upcomingHearings);
        stats.put("resolvedCases", 0); // TODO: Add resolved logic

        return ResponseEntity.ok(stats);
    }
}
