package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.UploadEvidenceResponse;
import com.nyaysetu.backend.service.EvidenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/cases/{caseId}/evidence")
@RequiredArgsConstructor
public class EvidenceController {

    private final EvidenceService evidenceService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadEvidenceResponse uploadEvidence(
            @PathVariable UUID caseId,
            @RequestParam("file") MultipartFile file,
            @RequestParam UUID uploaderId
    ) {
        return evidenceService.upload(caseId, file, uploaderId);
    }
}