package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.DocumentCompareRequest;
import com.nyaysetu.backend.dto.DocumentCompareResponse;
import com.nyaysetu.backend.entity.DocumentVersion;
import com.nyaysetu.backend.service.DocumentCompareService;
import com.nyaysetu.backend.service.DocumentVersionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentVersionController {

    private final DocumentVersionService service;
    private final DocumentCompareService documentCompareService;

    @GetMapping("/{id}/versions")
    public List<DocumentVersion> getVersions(@PathVariable UUID id) {
        return service.getVersions(id);
    }

    /** Compare two stored document versions by their version record IDs. */
    @PostMapping("/compare")
    public DocumentCompareResponse compareVersions(
            @RequestBody DocumentCompareRequest request
    ) {
        return documentCompareService.compareVersions(
                request.getBaseVersionId(),
                request.getCompareVersionId()
        );
    }
}