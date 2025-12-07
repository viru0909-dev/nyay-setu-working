package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.CreateMeetingRequest;
import com.nyaysetu.backend.dto.JoinMeetingRequest;
import com.nyaysetu.backend.dto.MeetingResponse;
import com.nyaysetu.backend.service.MeetingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @PostMapping
    public ResponseEntity<MeetingResponse> create(@RequestBody CreateMeetingRequest dto) {
        return ResponseEntity.ok(meetingService.createMeeting(dto));
    }

    @PostMapping("/join")
    public ResponseEntity<MeetingResponse> join(@RequestBody JoinMeetingRequest dto) {
        return ResponseEntity.ok(meetingService.joinMeeting(dto));
    }

    @PostMapping("/end/{id}")
    public ResponseEntity<MeetingResponse> end(@PathVariable UUID id) {
        return ResponseEntity.ok(meetingService.endMeeting(id));
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<MeetingResponse>> byCase(@PathVariable UUID caseId) {
        return ResponseEntity.ok(meetingService.getMeetingsByCase(caseId));
    }
}