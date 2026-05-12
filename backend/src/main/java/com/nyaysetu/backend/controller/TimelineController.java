package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.CaseTimeline;
import com.nyaysetu.backend.service.CaseTimelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/timeline")
@RequiredArgsConstructor
public class TimelineController {

    private final CaseTimelineService timelineService;

    @GetMapping("/{caseId}")
    public List<CaseTimeline> getTimeline(@PathVariable UUID caseId) {
        return timelineService.getTimeline(caseId);
    }
}