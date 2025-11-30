package com.nyaysetu.caseservice.controller;

import com.nyaysetu.caseservice.dto.ScheduleHearingRequest;
import com.nyaysetu.caseservice.entity.Hearing;
import com.nyaysetu.caseservice.service.HearingService;
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