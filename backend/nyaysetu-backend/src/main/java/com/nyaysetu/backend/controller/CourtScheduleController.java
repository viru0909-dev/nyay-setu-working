package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.CourtSchedule;
import com.nyaysetu.backend.entity.SchedulingConflict;
import com.nyaysetu.backend.service.CourtSchedulingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Court Scheduling", description = "Endpoints to create, update, and manage court schedules and detect conflicts")
@RestController
@RequestMapping("/court-schedules")
@RequiredArgsConstructor
@Slf4j
public class CourtScheduleController {

    private final CourtSchedulingService schedulingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> createSchedule(@Valid @RequestBody CreateScheduleRequest request) {
        log.info("Request received to create schedule for case: {}", request.getCaseId());
        CourtSchedule schedule = schedulingService.createSchedule(
                request.getCaseId(),
                request.getStartTime(),
                request.getDurationMinutes() != null ? request.getDurationMinutes() : 60,
                request.getCourtroomId(),
                request.getJudgeId(),
                request.getPriority()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("id", schedule.getId());
        response.put("caseId", schedule.getCaseEntity().getId());
        response.put("startTime", schedule.getStartTime());
        response.put("endTime", schedule.getEndTime());
        response.put("courtroomId", schedule.getCourtroom().getId());
        response.put("courtroomName", schedule.getCourtroom().getName());
        response.put("judgeId", schedule.getJudge().getId());
        response.put("judgeName", schedule.getJudge().getName());
        response.put("status", schedule.getStatus());
        response.put("priority", schedule.getPriority());
        response.put("message", "Schedule created successfully");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> updateSchedule(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateScheduleRequest request
    ) {
        log.info("Request received to update schedule: {}", id);
        CourtSchedule schedule = schedulingService.updateSchedule(
                id,
                request.getStartTime(),
                request.getDurationMinutes() != null ? request.getDurationMinutes() : 60,
                request.getCourtroomId(),
                request.getJudgeId(),
                request.getPriority()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("id", schedule.getId());
        response.put("caseId", schedule.getCaseEntity().getId());
        response.put("startTime", schedule.getStartTime());
        response.put("endTime", schedule.getEndTime());
        response.put("courtroomId", schedule.getCourtroom().getId());
        response.put("courtroomName", schedule.getCourtroom().getName());
        response.put("judgeId", schedule.getJudge().getId());
        response.put("judgeName", schedule.getJudge().getName());
        response.put("status", schedule.getStatus());
        response.put("priority", schedule.getPriority());
        response.put("message", "Schedule updated successfully");

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> cancelSchedule(@PathVariable UUID id) {
        log.info("Request received to cancel schedule: {}", id);
        CourtSchedule schedule = schedulingService.cancelSchedule(id);

        Map<String, Object> response = new HashMap<>();
        response.put("id", schedule.getId());
        response.put("status", schedule.getStatus());
        response.put("message", "Schedule cancelled successfully");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/conflicts")
    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    public ResponseEntity<List<SchedulingConflictResponse>> getConflicts() {
        log.info("Request received to list active scheduling conflicts");
        List<SchedulingConflict> conflicts = schedulingService.getActiveConflicts();
        List<SchedulingConflictResponse> responseList = conflicts.stream().map(c -> {
            SchedulingConflictResponse dto = new SchedulingConflictResponse();
            dto.setId(c.getId());
            dto.setScheduleId(c.getSchedule().getId());
            dto.setConflictType(c.getConflictType());
            dto.setDescription(c.getDescription());
            dto.setConflictingScheduleId(c.getConflictingSchedule() != null ? c.getConflictingSchedule().getId() : null);
            dto.setResolved(c.getResolved());
            return dto;
        }).toList();

        return ResponseEntity.ok(responseList);
    }

    @PostMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> rescheduleSchedule(@PathVariable UUID id) {
        log.info("Request received to auto-reschedule schedule: {}", id);
        schedulingService.autoReschedule(id);

        Map<String, Object> response = new HashMap<>();
        response.put("id", id);
        response.put("message", "Auto-rescheduling executed successfully");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/detect-conflicts")
    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN', 'LAWYER')")
    public ResponseEntity<Map<String, Object>> detectConflicts(@Valid @RequestBody CreateScheduleRequest request) {
        log.info("Request received to preview/detect conflicts for potential schedule of case: {}", request.getCaseId());
        
        CourtSchedule mockSchedule = new CourtSchedule();
        mockSchedule.setStartTime(request.getStartTime());
        mockSchedule.setEndTime(request.getStartTime().plusMinutes(request.getDurationMinutes()));
        
        com.nyaysetu.backend.entity.CaseEntity dummyCase = new com.nyaysetu.backend.entity.CaseEntity();
        dummyCase.setId(request.getCaseId());
        mockSchedule.setCaseEntity(dummyCase);

        if (request.getJudgeId() != null) {
            com.nyaysetu.backend.entity.User dummyJudge = new com.nyaysetu.backend.entity.User();
            dummyJudge.setId(request.getJudgeId());
            mockSchedule.setJudge(dummyJudge);
        }
        
        if (request.getCourtroomId() != null) {
            com.nyaysetu.backend.entity.Courtroom dummyRoom = new com.nyaysetu.backend.entity.Courtroom();
            dummyRoom.setId(request.getCourtroomId());
            mockSchedule.setCourtroom(dummyRoom);
        }

        List<SchedulingConflict> conflicts = schedulingService.detectConflicts(mockSchedule);

        Map<String, Object> response = new HashMap<>();
        response.put("hasConflicts", !conflicts.isEmpty());
        response.put("conflicts", conflicts.stream().map(c -> Map.of(
                "conflictType", c.getConflictType(),
                "description", c.getDescription()
        )).toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/ical")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> getICalendar(@PathVariable UUID id) {
        log.info("Request received to export iCal file for schedule: {}", id);
        String iCalData = schedulingService.generateICalendar(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.valueOf("text/calendar"));
        headers.setContentDispositionFormData("attachment", "hearing-schedule-" + id + ".ics");

        return new ResponseEntity<>(iCalData, headers, HttpStatus.OK);
    }

    @Data
    public static class CreateScheduleRequest {
        @NotNull(message = "Case ID is required")
        private UUID caseId;

        @NotNull(message = "Start time is required")
        private LocalDateTime startTime;

        private Integer durationMinutes = 60;
        private Integer courtroomId;
        private Long judgeId;
        private String priority = "NORMAL";
    }

    @Data
    public static class UpdateScheduleRequest {
        private LocalDateTime startTime;
        private Integer durationMinutes;
        private Integer courtroomId;
        private Long judgeId;
        private String priority;
    }

    @Data
    public static class SchedulingConflictResponse {
        private UUID id;
        private UUID scheduleId;
        private String conflictType;
        private String description;
        private UUID conflictingScheduleId;
        private Boolean resolved;
    }
}
