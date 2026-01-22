package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.ClientFirRequest;
import com.nyaysetu.backend.dto.FirUploadResponse;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.FirService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/client/fir")
@RequiredArgsConstructor
@Slf4j
public class ClientFirController {

    private final FirService firService;
    private final UserRepository userRepository;

    /**
     * Client files an FIR (Manual or AI-assisted)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FirUploadResponse> fileFir(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "incidentDate", required = false) String incidentDateStr,
            @RequestParam(value = "incidentLocation", required = false) String incidentLocation,
            @RequestParam(value = "aiGenerated", required = false, defaultValue = "false") Boolean aiGenerated,
            @RequestParam(value = "aiSessionId", required = false) String aiSessionId,
            @RequestParam(value = "caseId", required = false) String caseIdStr,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication auth) {

        User user = getCurrentUser(auth);

        LocalDate incidentDate = null;
        if (incidentDateStr != null && !incidentDateStr.isEmpty()) {
            try {
                incidentDate = LocalDate.parse(incidentDateStr);
            } catch (Exception e) {
                log.warn("Invalid incidentDate format: {}", incidentDateStr);
            }
        }

        UUID caseId = null;
        if (caseIdStr != null && !caseIdStr.isEmpty()) {
            try {
                caseId = UUID.fromString(caseIdStr);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid caseId format: {}", caseIdStr);
            }
        }

        ClientFirRequest request = ClientFirRequest.builder()
                .title(title)
                .description(description)
                .incidentDate(incidentDate)
                .incidentLocation(incidentLocation)
                .aiGenerated(aiGenerated)
                .aiSessionId(aiSessionId)
                .caseId(caseId)
                .build();

        FirUploadResponse response = firService.fileClientFir(request, file, user);

        log.info("Client FIR filed: {} by {}", response.getFirNumber(), user.getName());

        return ResponseEntity.ok(response);
    }

    /**
     * Get all FIRs filed by the current client
     */
    @GetMapping("/list")
    public ResponseEntity<List<FirUploadResponse>> getMyFirs(Authentication auth) {
        User user = getCurrentUser(auth);
        List<FirUploadResponse> firs = firService.getClientFirs(user.getId());
        return ResponseEntity.ok(firs);
    }

    /**
     * Get FIR details by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<FirUploadResponse> getFirById(@PathVariable Long id) {
        FirUploadResponse fir = firService.getFirById(id);
        return ResponseEntity.ok(fir);
    }

    /**
     * Get client FIR stats for dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<FirService.ClientFirStatsResponse> getStats(Authentication auth) {
        User user = getCurrentUser(auth);
        FirService.ClientFirStatsResponse stats = firService.getClientStats(user.getId());
        return ResponseEntity.ok(stats);
    }

    private User getCurrentUser(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}
