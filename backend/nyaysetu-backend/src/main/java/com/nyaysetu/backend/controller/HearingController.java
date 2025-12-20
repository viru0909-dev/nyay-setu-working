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
import java.util.HashMap;
import java.util.UUID;

@RestController
@RequestMapping("/api/hearings")
@RequiredArgsConstructor
@Slf4j
public class HearingController {
    
    private final HearingService hearingService;
    
    @PostMapping("/schedule")
    public ResponseEntity<Map<String, Object>> scheduleHearing(
            @RequestBody ScheduleHearingRequest request,
            Authentication authentication
    ) {
        log.info("Scheduling hearing for case: {}", request.getCaseId());
        
        Hearing hearing = hearingService.scheduleHearing(
                request.getCaseId(),
                request.getScheduledDate(),
                request.getDurationMinutes()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", hearing.getId());
        response.put("scheduledDate", hearing.getScheduledDate());
        response.put("status", hearing.getStatus().name());
        response.put("videoRoomId", hearing.getVideoRoomId());
        response.put("durationMinutes", hearing.getDurationMinutes());
        if (hearing.getCaseEntity() != null) {
            response.put("caseId", hearing.getCaseEntity().getId());
            response.put("caseTitle", hearing.getCaseEntity().getTitle());
        }
        response.put("message", "Hearing scheduled successfully");
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{hearingId}/participants")
    public ResponseEntity<Map<String, Object>> addParticipant(
            @PathVariable UUID hearingId,
            @RequestBody AddParticipantRequest request
    ) {
        HearingParticipant participant = hearingService.addParticipant(
                hearingId,
                request.getUserId(),
                request.getRole()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", participant.getId());
        response.put("hearingId", hearingId);
        response.put("role", participant.getRole());
        response.put("joinedAt", participant.getJoinedAt());
        response.put("message", "Participant added successfully");
        
        return ResponseEntity.ok(response);
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

    @GetMapping("/my")
    public ResponseEntity<?> getMyHearings(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<Hearing> hearings = hearingService.getHearingsForUser(email);
            
            // Convert to response format
            List<Map<String, Object>> response = hearings.stream().map(h -> {
                Map<String, Object> hearingData = new java.util.HashMap<>();
                hearingData.put("id", h.getId());
                hearingData.put("scheduledDate", h.getScheduledDate());
                hearingData.put("durationMinutes", h.getDurationMinutes());
                hearingData.put("status", h.getStatus().name());
                hearingData.put("videoRoomId", h.getVideoRoomId());
                hearingData.put("createdAt", h.getCreatedAt());
                
                if (h.getCaseEntity() != null) {
                    hearingData.put("caseId", h.getCaseEntity().getId());
                    hearingData.put("caseNumber", h.getCaseEntity().getId().toString().substring(0, 8).toUpperCase());
                    hearingData.put("caseTitle", h.getCaseEntity().getTitle());
                }
                
                return hearingData;
            }).toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get user hearings", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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