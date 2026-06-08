package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.UploadEvidenceResponse;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.exception.AccessDeniedException;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.CaseAccessService;
import com.nyaysetu.backend.service.EvidenceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;
@Tag(name = "Evidence", description = "Upload evidence files linked to a case")
@RestController
@RequestMapping("/cases/{caseId}/evidence")
@RequiredArgsConstructor
public class EvidenceController {

    private final EvidenceService evidenceService;
    private final AuthService authService;
    private final CaseAccessService caseAccessService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadEvidenceResponse uploadEvidence(
            @PathVariable UUID caseId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(caseId, user);
        return evidenceService.upload(caseId, file, user.getId());
    }
}