package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.Hearing;
import com.nyaysetu.backend.entity.HearingParticipant;
import com.nyaysetu.backend.entity.ParticipantRole;
import com.nyaysetu.backend.service.HearingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/hearings")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class HearingController {
    
    private final HearingService hearingService;
    
    @PostMapping("/schedule")
    public ResponseEntity<Hearing> scheduleHearing(
            @RequestBody ScheduleHearingRequest request,
            Authentication authentication
    ) {
        log.info("Scheduling hearing for case: {}", request.getCaseId());
        
        Hearing hearing = hearingService.scheduleHearing(
                request.getCaseId(),
                request.getScheduledDate(),
                request.getDurationMinutes()
        );
        
        return ResponseEntity.ok(hearing);
    }
    
    @PostMapping("/{hearingId}/participants")
    public ResponseEntity<HearingParticipant> addParticipant(
            @PathVariable UUID hearingId,
            @RequestBody AddParticipantRequest request
    ) {
        HearingParticipant participant = hearingService.addParticipant(
                hearingId,
                request.getUserId(),
                request.getRole()
        );
        
        return ResponseEntity.ok(participant);
    }
    
    @PostMapping("/{hearingId}/join")
    public ResponseEntity<Map<String, Object>> joinHearing(
            @PathVariable UUID hearingId,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        
        if (!hearingService.canUserJoinHearing(hearingId, userId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }
        
        hearingService.joinHearing(hearingId, userId);
        Hearing hearing = hearingService.getHearing(hearingId);
        
        return ResponseEntity.ok(Map.of(
                "videoRoomId", hearing.getVideoRoomId(),
                "hearingId", hearingId,
                "status", hearing.getStatus()
        ));
    }
    
    @PostMapping("/{hearingId}/leave")
    public ResponseEntity<Void> leaveHearing(
            @PathVariable UUID hearingId,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        hearingService.leaveHearing(hearingId, userId);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{hearingId}/complete")
    public ResponseEntity<Hearing> completeHearing(
            @PathVariable UUID hearingId,
            @RequestBody CompleteHearingRequest request
    ) {
        Hearing hearing = hearingService.completeHearing(hearingId, request.getJudgeNotes());
        return ResponseEntity.ok(hearing);
    }
    
    @GetMapping("/{hearingId}")
    public ResponseEntity<Hearing> getHearing(@PathVariable UUID hearingId) {
        Hearing hearing = hearingService.getHearing(hearingId);
        return ResponseEntity.ok(hearing);
    }
    
    @GetMapping("/{hearingId}/participants")
    public ResponseEntity<List<HearingParticipant>> getParticipants(@PathVariable UUID hearingId) {
        List<HearingParticipant> participants = hearingService.getHearingParticipants(hearingId);
        return ResponseEntity.ok(participants);
    }
    
    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<Hearing>> getCaseHearings(@PathVariable UUID caseId) {
        List<Hearing> hearings = hearingService.getCaseHearings(caseId);
        return ResponseEntity.ok(hearings);
    }
    
    public static class ScheduleHearingRequest {
        private UUID caseId;
        private LocalDateTime scheduledDate;
        private Integer durationMinutes;
        
        public UUID getCaseId() { return caseId; }
        public void setCaseId(UUID caseId) { this.caseId = caseId; }
        public LocalDateTime getScheduledDate() { return scheduledDate; }
        public void setScheduledDate(LocalDateTime scheduledDate) { this.scheduledDate = scheduledDate; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    }
    
    public static class AddParticipantRequest {
        private Long userId;
        private ParticipantRole role;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public ParticipantRole getRole() { return role; }
        public void setRole(ParticipantRole role) { this.role = role; }
    }
    
    public static class CompleteHearingRequest {
        private String judgeNotes;
        
        public String getJudgeNotes() { return judgeNotes; }
        public void setJudgeNotes(String judgeNotes) { this.judgeNotes = judgeNotes; }
    }
}