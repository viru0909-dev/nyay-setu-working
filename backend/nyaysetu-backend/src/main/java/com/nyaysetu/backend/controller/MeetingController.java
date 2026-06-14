package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.CreateMeetingRequest;
import com.nyaysetu.backend.dto.JoinMeetingRequest;
import com.nyaysetu.backend.dto.MeetingResponse;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.MeetingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Meetings", description = "Create and join virtual meetings for hearings and consultations")
@RestController
@RequestMapping("/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<MeetingResponse> create(@Valid  @RequestBody CreateMeetingRequest dto) {
        return ResponseEntity.ok(meetingService.createMeeting(dto));
    }

    @PostMapping("/join")
    public ResponseEntity<MeetingResponse> join(@Valid @RequestBody JoinMeetingRequest dto, Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        return ResponseEntity.ok(meetingService.joinMeeting(dto.getMeetingCode(), user));
    }

    @PostMapping("/end/{id}")
    public ResponseEntity<MeetingResponse> end(@PathVariable UUID id) {
        return ResponseEntity.ok(meetingService.endMeeting(id));
    }

    @PostMapping("/validate-room-access")
    public ResponseEntity<Void> validateRoomAccess(@RequestBody JoinMeetingRequest dto, Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        meetingService.validateRoomAccess(dto.getMeetingCode(), user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<MeetingResponse>> byCase(@PathVariable UUID caseId) {
        return ResponseEntity.ok(meetingService.getMeetingsByCase(caseId));
    }
}