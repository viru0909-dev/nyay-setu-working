package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.service.CourtSchedulingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CourtScheduleControllerTest {

    private CourtScheduleController controller;

    @Mock private CourtSchedulingService schedulingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        controller = new CourtScheduleController(schedulingService);
    }

    @Test
    void createScheduleEndpointInvokesService() {
        UUID caseId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();
        
        CourtSchedule mockSchedule = CourtSchedule.builder()
                .id(UUID.randomUUID())
                .startTime(now)
                .endTime(now.plusHours(1))
                .caseEntity(CaseEntity.builder().id(caseId).title("Test Case").build())
                .courtroom(Courtroom.builder().id(1).name("Courtroom A").build())
                .judge(User.builder().id(2L).name("Judge J").build())
                .status("SCHEDULED")
                .priority("NORMAL")
                .build();

        when(schedulingService.createSchedule(any(), any(), anyInt(), any(), any(), any()))
                .thenReturn(mockSchedule);

        CourtScheduleController.CreateScheduleRequest request = new CourtScheduleController.CreateScheduleRequest();
        request.setCaseId(caseId);
        request.setStartTime(now);
        request.setDurationMinutes(60);
        request.setCourtroomId(1);
        request.setJudgeId(2L);
        request.setPriority("NORMAL");

        ResponseEntity<Map<String, Object>> response = controller.createSchedule(request);

        assertEquals(201, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Schedule created successfully", response.getBody().get("message"));
        verify(schedulingService).createSchedule(caseId, now, 60, 1, 2L, "NORMAL");
    }

    @Test
    void getConflictsEndpointReturnsDtoList() {
        UUID conflictId = UUID.randomUUID();
        UUID scheduleId = UUID.randomUUID();
        
        SchedulingConflict conflict = SchedulingConflict.builder()
                .id(conflictId)
                .schedule(CourtSchedule.builder().id(scheduleId).build())
                .conflictType("JUDGE_CONFLICT")
                .description("Overlap detected")
                .resolved(false)
                .build();

        when(schedulingService.getActiveConflicts()).thenReturn(List.of(conflict));

        ResponseEntity<List<CourtScheduleController.SchedulingConflictResponse>> response = controller.getConflicts();

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("JUDGE_CONFLICT", response.getBody().get(0).getConflictType());
    }
}
