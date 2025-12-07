package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.ScheduleHearingRequest;
import com.nyaysetu.backend.entity.Hearing;
import com.nyaysetu.backend.service.HearingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/cases/{caseId}/hearings")
@RequiredArgsConstructor
public class HearingController {

    private final HearingService hearingService;

    @PostMapping
    public Hearing scheduleHearing(
            @PathVariable UUID caseId,
            @RequestBody ScheduleHearingRequest request
    ) {
        return hearingService.scheduleHearing(
                caseId,
                request.getWhen(),
                request.getLocation(),
                request.getNotes()
        );
    }

    @GetMapping
    public List<Hearing> getHearings(@PathVariable UUID caseId) {
        return hearingService.getHearingsForCase(caseId);
    }
}