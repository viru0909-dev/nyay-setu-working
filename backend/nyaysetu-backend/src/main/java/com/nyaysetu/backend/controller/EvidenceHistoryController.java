package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.EvidenceHistoryItemDto;
import com.nyaysetu.backend.service.EvidenceHistoryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Evidence History", description = "Revision history for evidence records")
@RestController
@RequestMapping("/api/evidence")
@RequiredArgsConstructor
public class EvidenceHistoryController {

    private final EvidenceHistoryService evidenceHistoryService;

    @GetMapping("/{id}/history")
    public List<EvidenceHistoryItemDto> getHistory(
            @PathVariable UUID id
    ) {
        return evidenceHistoryService.getEvidenceHistory(id);
    }
}
