package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.notification.service.NotificationService;
import com.nyaysetu.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CourtSchedulingServiceTest {

    private CourtSchedulingService service;

    private static final int YEAR = 2026;
    private static final int MONTH = 6;
    private static final int SATURDAY_DAY = 20;
    private static final int MONDAY_DAY = 22;
    private static final int HOUR_9 = 9;
    private static final int HOUR_10 = 10;
    private static final int HOUR_11 = 11;
    private static final int HOUR_12 = 12;
    private static final int MINUTE_0 = 0;
    private static final int MINUTE_30 = 30;

    private static final LocalDateTime DATE_SAT_10AM = LocalDateTime.of(YEAR, MONTH, SATURDAY_DAY, HOUR_10, MINUTE_0);
    private static final LocalDateTime DATE_SAT_11AM = LocalDateTime.of(YEAR, MONTH, SATURDAY_DAY, HOUR_11, MINUTE_0);
    private static final LocalDateTime DATE_SAT_1030AM = LocalDateTime.of(YEAR, MONTH, SATURDAY_DAY, HOUR_10, MINUTE_30);
    private static final LocalDateTime DATE_SAT_1130AM = LocalDateTime.of(YEAR, MONTH, SATURDAY_DAY, HOUR_11, MINUTE_30);

    private static final LocalDateTime DATE_MON_9AM = LocalDateTime.of(YEAR, MONTH, MONDAY_DAY, HOUR_9, MINUTE_0);
    private static final LocalDateTime DATE_MON_10AM = LocalDateTime.of(YEAR, MONTH, MONDAY_DAY, HOUR_10, MINUTE_0);
    private static final LocalDateTime DATE_MON_11AM = LocalDateTime.of(YEAR, MONTH, MONDAY_DAY, HOUR_11, MINUTE_0);
    private static final LocalDateTime DATE_MON_12PM = LocalDateTime.of(YEAR, MONTH, MONDAY_DAY, HOUR_12, MINUTE_0);

    private static final String TEST_UUID = "12345678-1234-1234-1234-1234567890ab";

    @Mock private CourtScheduleRepository courtScheduleRepository;
    @Mock private CourtroomRepository courtroomRepository;
    @Mock private SchedulingConflictRepository schedulingConflictRepository;
    @Mock private CaseRepository caseRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;
    @Mock private HearingRepository hearingRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new CourtSchedulingService(
                courtScheduleRepository,
                courtroomRepository,
                schedulingConflictRepository,
                caseRepository,
                userRepository,
                notificationService,
                hearingRepository
        );
    }

    @Test
    void detectConflictsNoConflictsWhenEmpty() {
        CourtSchedule schedule = CourtSchedule.builder()
                .id(UUID.randomUUID())
                .startTime(DATE_SAT_10AM)
                .endTime(DATE_SAT_11AM)
                .judge(User.builder().id(1L).name("Judge A").build())
                .courtroom(Courtroom.builder().id(1).name("Courtroom A").build())
                .caseEntity(CaseEntity.builder().id(UUID.randomUUID()).title("Case Title").build())
                .status("SCHEDULED")
                .build();

        when(courtScheduleRepository.findOverlappingJudgeSchedules(any(), any(), any())).thenReturn(Collections.emptyList());
        when(courtScheduleRepository.findOverlappingCourtroomSchedules(any(), any(), any())).thenReturn(Collections.emptyList());
        when(courtScheduleRepository.findOverlappingCaseSchedules(any(), any(), any())).thenReturn(Collections.emptyList());

        List<SchedulingConflict> conflicts = service.detectConflicts(schedule);

        assertTrue(conflicts.isEmpty());
    }

    @Test
    void detectConflictsFindsJudgeConflict() {
        User judge = User.builder().id(1L).name("Judge A").build();
        CaseEntity case1 = CaseEntity.builder().id(UUID.randomUUID()).title("Case 1").build();
        CaseEntity case2 = CaseEntity.builder().id(UUID.randomUUID()).title("Case 2").build();
        
        CourtSchedule schedule1 = CourtSchedule.builder()
                .id(UUID.randomUUID())
                .startTime(DATE_SAT_10AM)
                .endTime(DATE_SAT_11AM)
                .judge(judge)
                .caseEntity(case1)
                .status("SCHEDULED")
                .build();

        CourtSchedule conflictingSchedule = CourtSchedule.builder()
                .id(UUID.randomUUID())
                .startTime(DATE_SAT_1030AM)
                .endTime(DATE_SAT_1130AM)
                .judge(judge)
                .caseEntity(case2)
                .status("SCHEDULED")
                .build();

        when(courtScheduleRepository.findOverlappingJudgeSchedules(eq(1L), any(), any()))
                .thenReturn(List.of(conflictingSchedule));

        List<SchedulingConflict> conflicts = service.detectConflicts(schedule1);

        assertEquals(1, conflicts.size());
        assertEquals("JUDGE_CONFLICT", conflicts.get(0).getConflictType());
        assertTrue(conflicts.get(0).getDescription().contains("Judge A"));
    }

    @Test
    void findNextAvailableSlotFindsFirstFreeWorkingHoursSlot() {
        Courtroom room = Courtroom.builder().id(1).name("Courtroom A").status("AVAILABLE").roomNumber("101").build();
        when(courtroomRepository.findByStatus("AVAILABLE")).thenReturn(List.of(room));

        // Start search Saturday morning (weekend), should move to Monday 9:00 AM
        LocalDateTime searchFrom = DATE_SAT_10AM; // Saturday
        LocalDateTime expectedStart = DATE_MON_9AM; // Monday morning

        when(courtScheduleRepository.findOverlappingJudgeSchedules(anyLong(), any(), any())).thenReturn(Collections.emptyList());
        when(courtScheduleRepository.findOverlappingCourtroomSchedules(anyInt(), any(), any())).thenReturn(Collections.emptyList());

        CourtSchedulingService.SlotSearchResult result = service.findNextAvailableSlot(1L, null, 60, searchFrom);

        assertEquals(expectedStart, result.getStartTime());
        assertEquals(expectedStart.plusHours(1), result.getEndTime());
        assertEquals(room, result.getCourtroom());
    }

    @Test
    void autoRescheduleFindsNextFreeSlotAndPersists() {
        User judge = User.builder().id(1L).name("Judge A").build();
        CaseEntity caseObj = CaseEntity.builder().id(UUID.randomUUID()).title("Case A").build();
        Courtroom room = Courtroom.builder().id(1).name("Courtroom A").status("AVAILABLE").roomNumber("101").build();

        CourtSchedule schedule = CourtSchedule.builder()
                .id(UUID.randomUUID())
                .startTime(DATE_MON_10AM) // Monday
                .endTime(DATE_MON_11AM)
                .judge(judge)
                .caseEntity(caseObj)
                .courtroom(room)
                .status("SCHEDULED")
                .build();

        when(courtScheduleRepository.findById(schedule.getId())).thenReturn(Optional.of(schedule));
        when(courtroomRepository.findByStatus("AVAILABLE")).thenReturn(List.of(room));
        
        CourtSchedule busySchedule = CourtSchedule.builder()
                .id(UUID.randomUUID())
                .startTime(DATE_MON_10AM)
                .endTime(DATE_MON_11AM)
                .judge(judge)
                .build();

        when(courtScheduleRepository.findOverlappingJudgeSchedules(eq(1L), any(), any()))
                .thenAnswer(invocation -> {
                    LocalDateTime start = invocation.getArgument(1);
                    LocalDateTime end = invocation.getArgument(2);
                    if (start.isBefore(DATE_MON_11AM)) {
                        return List.of(busySchedule);
                    }
                    return Collections.emptyList();
                });

        when(courtScheduleRepository.findOverlappingCourtroomSchedules(anyInt(), any(), any())).thenReturn(Collections.emptyList());

        service.autoReschedule(schedule.getId());

        assertEquals(DATE_MON_11AM, schedule.getStartTime());
        assertEquals(DATE_MON_12PM, schedule.getEndTime());
        assertEquals("RESCHEDULED", schedule.getStatus());
        verify(courtScheduleRepository).save(schedule);
    }

    @Test
    void generateICalendarReturnsValidICSString() {
        CourtSchedule schedule = CourtSchedule.builder()
                .id(UUID.fromString(TEST_UUID))
                .startTime(DATE_MON_10AM)
                .endTime(DATE_MON_11AM)
                .judge(User.builder().name("Judge A").build())
                .lawyer(User.builder().name("Lawyer B").build())
                .courtroom(Courtroom.builder().name("Courtroom A").roomNumber("101").build())
                .caseEntity(CaseEntity.builder().title("Case Title").build())
                .priority("NORMAL")
                .build();

        when(courtScheduleRepository.findById(schedule.getId())).thenReturn(Optional.of(schedule));

        String ics = service.generateICalendar(schedule.getId());

        assertTrue(ics.contains("BEGIN:VCALENDAR"));
        assertTrue(ics.contains("VERSION:2.0"));
        assertTrue(ics.contains("SUMMARY:Case Title - Court Hearing"));
        assertTrue(ics.contains("DTSTART:20260622T100000"));
        assertTrue(ics.contains("DTEND:20260622T110000"));
        assertTrue(ics.contains("LOCATION:Courtroom A (Room 101)"));
        assertTrue(ics.contains("END:VCALENDAR"));
    }
}
