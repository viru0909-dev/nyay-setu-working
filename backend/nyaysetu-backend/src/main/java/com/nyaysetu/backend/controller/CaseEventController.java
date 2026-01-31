package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.CaseEvent;
import com.nyaysetu.backend.service.CaseEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for Case Events (Audit Trail / Timeline).
 * Exposes endpoints for frontend Timeline component.
 */
@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CaseEventController {

    private final CaseEventService caseEventService;

    /**
     * Get timeline events for a case (ordered chronologically for display).
     * This powers the frontend Timeline component.
     */
    @GetMapping("/{caseId}/events")
    public ResponseEntity<List<CaseEvent>> getCaseTimeline(@PathVariable UUID caseId) {
        List<CaseEvent> events = caseEventService.getTimelineForCase(caseId);
        return ResponseEntity.ok(events);
    }

    /**
     * Get recent events for a case (newest first).
     */
    @GetMapping("/{caseId}/events/recent")
    public ResponseEntity<List<CaseEvent>> getRecentEvents(@PathVariable UUID caseId) {
        List<CaseEvent> events = caseEventService.getRecentEventsForCase(caseId);
        return ResponseEntity.ok(events);
    }

    /**
     * Get events for a judge's assigned cases.
     */
    @GetMapping("/judge/{judgeId}/events")
    public ResponseEntity<List<CaseEvent>> getJudgeEvents(@PathVariable Long judgeId) {
        List<CaseEvent> events = caseEventService.getEventsForJudge(judgeId);
        return ResponseEntity.ok(events);
    }
}
