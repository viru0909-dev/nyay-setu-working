package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.notification.entity.Notification;
import com.nyaysetu.backend.notification.service.NotificationService;
import com.nyaysetu.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourtSchedulingService {

    private final CourtScheduleRepository courtScheduleRepository;
    private final CourtroomRepository courtroomRepository;
    private final SchedulingConflictRepository schedulingConflictRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final HearingRepository hearingRepository;

    /**
     * Detects overlapping conflicts for a given schedule.
     */
    public List<SchedulingConflict> detectConflicts(CourtSchedule schedule) {
        List<SchedulingConflict> conflicts = new ArrayList<>();
        if ("CANCELLED".equals(schedule.getStatus()) || "COMPLETED".equals(schedule.getStatus())) {
            return conflicts;
        }

        LocalDateTime start = schedule.getStartTime();
        LocalDateTime end = schedule.getEndTime();

        // 1. Judge conflict
        if (schedule.getJudge() != null) {
            List<CourtSchedule> overlaps = courtScheduleRepository.findOverlappingJudgeSchedules(
                    schedule.getJudge().getId(), start, end);
            for (CourtSchedule other : overlaps) {
                if (!other.getId().equals(schedule.getId())) {
                    conflicts.add(SchedulingConflict.builder()
                            .schedule(schedule)
                            .conflictType("JUDGE_CONFLICT")
                            .description("Judge " + schedule.getJudge().getName() + " has an overlapping schedule with Case: " + other.getCaseEntity().getTitle())
                            .conflictingSchedule(other)
                            .build());
                }
            }
        }

        // 2. Courtroom conflict
        if (schedule.getCourtroom() != null) {
            List<CourtSchedule> overlaps = courtScheduleRepository.findOverlappingCourtroomSchedules(
                    schedule.getCourtroom().getId(), start, end);
            for (CourtSchedule other : overlaps) {
                if (!other.getId().equals(schedule.getId())) {
                    conflicts.add(SchedulingConflict.builder()
                            .schedule(schedule)
                            .conflictType("COURTROOM_CONFLICT")
                            .description("Courtroom " + schedule.getCourtroom().getName() + " is already booked for Case: " + other.getCaseEntity().getTitle())
                            .conflictingSchedule(other)
                            .build());
                }
            }
        }

        // 3. Lawyer conflict
        if (schedule.getLawyer() != null) {
            List<CourtSchedule> overlaps = courtScheduleRepository.findOverlappingLawyerSchedules(
                    schedule.getLawyer().getId(), start, end);
            for (CourtSchedule other : overlaps) {
                if (!other.getId().equals(schedule.getId())) {
                    conflicts.add(SchedulingConflict.builder()
                            .schedule(schedule)
                            .conflictType("LAWYER_CONFLICT")
                            .description("Lawyer " + schedule.getLawyer().getName() + " has an overlapping schedule with Case: " + other.getCaseEntity().getTitle())
                            .conflictingSchedule(other)
                            .build());
                }
            }
        }

        // 4. Duplicate case scheduling
        if (schedule.getCaseEntity() != null) {
            List<CourtSchedule> overlaps = courtScheduleRepository.findOverlappingCaseSchedules(
                    schedule.getCaseEntity().getId(), start, end);
            for (CourtSchedule other : overlaps) {
                if (!other.getId().equals(schedule.getId())) {
                    conflicts.add(SchedulingConflict.builder()
                            .schedule(schedule)
                            .conflictType("DUPLICATE_CASE")
                            .description("Case is already scheduled at the same overlapping time.")
                            .conflictingSchedule(other)
                            .build());
                }
            }
        }

        return conflicts;
    }

    /**
     * Create court schedule and run conflict checks.
     */
    @Transactional
    public CourtSchedule createSchedule(UUID caseId, LocalDateTime startTime, int durationMinutes,
                                        Integer courtroomId, Long judgeId, String priority) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found: " + caseId));

        User judge = null;
        if (judgeId != null) {
            judge = userRepository.findById(judgeId)
                    .orElseThrow(() -> new IllegalArgumentException("Judge not found: " + judgeId));
        } else if (caseEntity.getJudgeId() != null) {
            judge = userRepository.findById(caseEntity.getJudgeId()).orElse(null);
        }

        if (judge == null || judge.getRole() != Role.JUDGE) {
            // Find any available judge
            List<User> judges = userRepository.findByRole(Role.JUDGE);
            if (judges.isEmpty()) {
                throw new IllegalStateException("No judges registered in the system.");
            }
            judge = judges.get(0);
        }

        Courtroom courtroom = null;
        if (courtroomId != null) {
            courtroom = courtroomRepository.findById(courtroomId)
                    .orElseThrow(() -> new IllegalArgumentException("Courtroom not found: " + courtroomId));
        } else {
            // Find any available courtroom
            List<Courtroom> rooms = courtroomRepository.findByStatus("AVAILABLE");
            if (rooms.isEmpty()) {
                throw new IllegalStateException("No available courtrooms in the system.");
            }
            courtroom = rooms.get(0);
        }

        User lawyer = caseEntity.getLawyer();
        String activePriority = (priority != null) ? priority : 
                                (caseEntity.getUrgency() != null ? caseEntity.getUrgency() : "NORMAL");

        LocalDateTime endTime = startTime.plusMinutes(durationMinutes);

        // Preempting normal cases if urgent/critical
        if ("CRITICAL".equals(activePriority) || "URGENT".equals(activePriority)) {
            preemptLowerPrioritySchedules(judge, lawyer, courtroom, startTime, endTime);
        }

        CourtSchedule schedule = CourtSchedule.builder()
                .caseEntity(caseEntity)
                .judge(judge)
                .lawyer(lawyer)
                .courtroom(courtroom)
                .startTime(startTime)
                .endTime(endTime)
                .status("SCHEDULED")
                .priority(activePriority)
                .build();

        CourtSchedule saved = courtScheduleRepository.save(schedule);

        // Conflict check
        List<SchedulingConflict> conflicts = detectConflicts(saved);
        if (!conflicts.isEmpty()) {
            schedulingConflictRepository.saveAll(conflicts);
            log.warn("Scheduling conflict detected for schedule: {}. Count: {}", saved.getId(), conflicts.size());
            // Trigger automatic rescheduling
            autoReschedule(saved.getId());
        } else {
            sendScheduleNotifications(saved, "Court Hearing Scheduled", 
                String.format("Hearing for Case '%s' has been scheduled on %s in %s.", 
                    caseEntity.getTitle(), saved.getStartTime(), courtroom.getName()));
        }

        return saved;
    }

    /**
     * Preempts lower priority schedules by rescheduling them.
     */
    private void preemptLowerPrioritySchedules(User judge, User lawyer, Courtroom courtroom, LocalDateTime start, LocalDateTime end) {
        List<CourtSchedule> overlaps = new ArrayList<>();
        if (judge != null) {
            overlaps.addAll(courtScheduleRepository.findOverlappingJudgeSchedules(judge.getId(), start, end));
        }
        if (lawyer != null) {
            overlaps.addAll(courtScheduleRepository.findOverlappingLawyerSchedules(lawyer.getId(), start, end));
        }
        if (courtroom != null) {
            overlaps.addAll(courtScheduleRepository.findOverlappingCourtroomSchedules(courtroom.getId(), start, end));
        }

        for (CourtSchedule overlap : overlaps) {
            if ("NORMAL".equals(overlap.getPriority()) && !"CANCELLED".equals(overlap.getStatus())) {
                overlap.setStatus("RESCHEDULED");
                courtScheduleRepository.save(overlap);
                log.info("Preempted schedule {} for Case {} to accommodate higher-priority slot.", overlap.getId(), overlap.getCaseEntity().getTitle());
                autoReschedule(overlap.getId());
            }
        }
    }

    /**
     * Updates an existing schedule.
     */
    @Transactional
    public CourtSchedule updateSchedule(UUID scheduleId, LocalDateTime startTime, int durationMinutes,
                                        Integer courtroomId, Long judgeId, String priority) {
        CourtSchedule schedule = courtScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found: " + scheduleId));

        if (startTime != null) {
            schedule.setStartTime(startTime);
            schedule.setEndTime(startTime.plusMinutes(durationMinutes));
        }
        if (courtroomId != null) {
            Courtroom courtroom = courtroomRepository.findById(courtroomId)
                    .orElseThrow(() -> new IllegalArgumentException("Courtroom not found: " + courtroomId));
            schedule.setCourtroom(courtroom);
        }
        if (judgeId != null) {
            User judge = userRepository.findById(judgeId)
                    .orElseThrow(() -> new IllegalArgumentException("Judge not found: " + judgeId));
            schedule.setJudge(judge);
        }
        if (priority != null) {
            schedule.setPriority(priority);
        }

        // Clear existing conflicts for this schedule
        List<SchedulingConflict> oldConflicts = schedulingConflictRepository.findByScheduleId(scheduleId);
        schedulingConflictRepository.deleteAll(oldConflicts);

        CourtSchedule updated = courtScheduleRepository.save(schedule);

        List<SchedulingConflict> conflicts = detectConflicts(updated);
        if (!conflicts.isEmpty()) {
            schedulingConflictRepository.saveAll(conflicts);
            autoReschedule(updated.getId());
        } else {
            sendScheduleNotifications(updated, "Court Hearing Updated", 
                String.format("Hearing for Case '%s' has been updated to %s in %s.", 
                    updated.getCaseEntity().getTitle(), updated.getStartTime(), updated.getCourtroom().getName()));
        }

        return updated;
    }

    /**
     * Cancels an active schedule.
     */
    @Transactional
    public CourtSchedule cancelSchedule(UUID scheduleId) {
        CourtSchedule schedule = courtScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found: " + scheduleId));

        schedule.setStatus("CANCELLED");
        CourtSchedule saved = courtScheduleRepository.save(schedule);

        // Resolve conflicts associated with this schedule
        List<SchedulingConflict> conflicts = schedulingConflictRepository.findByScheduleId(scheduleId);
        for (SchedulingConflict conflict : conflicts) {
            conflict.setResolved(true);
        }
        schedulingConflictRepository.saveAll(conflicts);

        sendScheduleNotifications(saved, "Court Hearing Cancelled", 
            String.format("Hearing for Case '%s' on %s has been CANCELLED.", 
                saved.getCaseEntity().getTitle(), saved.getStartTime()));

        return saved;
    }

    /**
     * Automatic rescheduling algorithm when a conflict occurs.
     */
    @Transactional
    public void autoReschedule(UUID scheduleId) {
        CourtSchedule schedule = courtScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found: " + scheduleId));

        if ("CANCELLED".equals(schedule.getStatus()) || "COMPLETED".equals(schedule.getStatus())) {
            return;
        }

        int duration = (int) java.time.Duration.between(schedule.getStartTime(), schedule.getEndTime()).toMinutes();
        SlotSearchResult nextSlot = findNextAvailableSlot(
                schedule.getJudge() != null ? schedule.getJudge().getId() : null,
                schedule.getLawyer() != null ? schedule.getLawyer().getId() : null,
                duration,
                schedule.getStartTime().plusMinutes(30) // Search forward starting 30 mins from current time
        );

        schedule.setStartTime(nextSlot.getStartTime());
        schedule.setEndTime(nextSlot.getEndTime());
        schedule.setCourtroom(nextSlot.getCourtroom());
        schedule.setStatus("RESCHEDULED");

        courtScheduleRepository.save(schedule);

        // Resolve old conflicts
        List<SchedulingConflict> oldConflicts = schedulingConflictRepository.findByScheduleId(scheduleId);
        for (SchedulingConflict c : oldConflicts) {
            c.setResolved(true);
        }
        schedulingConflictRepository.saveAll(oldConflicts);

        sendScheduleNotifications(schedule, "Court Hearing Rescheduled (Auto)", 
            String.format("Due to scheduling conflicts, the hearing for Case '%s' has been auto-rescheduled to %s in %s.", 
                schedule.getCaseEntity().getTitle(), schedule.getStartTime(), schedule.getCourtroom().getName()));
    }

    /**
     * Searches for the next available slot within working hours.
     */
    public SlotSearchResult findNextAvailableSlot(Long judgeId, Long lawyerId, int durationMinutes, LocalDateTime startSearchFrom) {
        LocalDateTime candidateStart = adjustToWorkingHours(startSearchFrom);
        List<Courtroom> courtrooms = courtroomRepository.findByStatus("AVAILABLE");
        if (courtrooms.isEmpty()) {
            throw new IllegalStateException("No active/available courtrooms found in the database.");
        }

        int attempts = 0;
        while (attempts < 500) {
            LocalDateTime candidateEnd = candidateStart.plusMinutes(durationMinutes);

            // Double check working hours (9:00 AM - 5:00 PM)
            if (candidateStart.getHour() < 9 || candidateEnd.getHour() > 17 || (candidateEnd.getHour() == 17 && candidateEnd.getMinute() > 0)) {
                candidateStart = adjustToWorkingHours(candidateStart.plusMinutes(30));
                attempts++;
                continue;
            }

            // Check Judge
            boolean judgeBusy = false;
            if (judgeId != null) {
                List<CourtSchedule> overlaps = courtScheduleRepository.findOverlappingJudgeSchedules(judgeId, candidateStart, candidateEnd);
                if (!overlaps.isEmpty()) {
                    judgeBusy = true;
                    LocalDateTime maxEnd = overlaps.stream().map(CourtSchedule::getEndTime).max(LocalDateTime::compareTo).orElse(candidateEnd);
                    candidateStart = adjustToWorkingHours(maxEnd);
                }
            }
            if (judgeBusy) {
                attempts++;
                continue;
            }

            // Check Lawyer
            boolean lawyerBusy = false;
            if (lawyerId != null) {
                List<CourtSchedule> overlaps = courtScheduleRepository.findOverlappingLawyerSchedules(lawyerId, candidateStart, candidateEnd);
                if (!overlaps.isEmpty()) {
                    lawyerBusy = true;
                    LocalDateTime maxEnd = overlaps.stream().map(CourtSchedule::getEndTime).max(LocalDateTime::compareTo).orElse(candidateEnd);
                    candidateStart = adjustToWorkingHours(maxEnd);
                }
            }
            if (lawyerBusy) {
                attempts++;
                continue;
            }

            // Find Room
            for (Courtroom room : courtrooms) {
                List<CourtSchedule> roomOverlaps = courtScheduleRepository.findOverlappingCourtroomSchedules(room.getId(), candidateStart, candidateEnd);
                if (roomOverlaps.isEmpty()) {
                    return new SlotSearchResult(candidateStart, candidateEnd, room);
                }
            }

            candidateStart = adjustToWorkingHours(candidateStart.plusMinutes(30));
            attempts++;
        }

        throw new IllegalStateException("Failed to find an available scheduling slot after 500 checks.");
    }

    private LocalDateTime adjustToWorkingHours(LocalDateTime dateTime) {
        if (dateTime.getDayOfWeek() == DayOfWeek.SATURDAY) {
            dateTime = dateTime.plusDays(2).withHour(9).withMinute(0).withSecond(0).withNano(0);
        } else if (dateTime.getDayOfWeek() == DayOfWeek.SUNDAY) {
            dateTime = dateTime.plusDays(1).withHour(9).withMinute(0).withSecond(0).withNano(0);
        }

        if (dateTime.getHour() < 9) {
            dateTime = dateTime.withHour(9).withMinute(0).withSecond(0).withNano(0);
        } else if (dateTime.getHour() >= 17 || (dateTime.getHour() == 16 && dateTime.getMinute() > 0)) {
            dateTime = dateTime.plusDays(1).withHour(9).withMinute(0).withSecond(0).withNano(0);
            dateTime = adjustToWorkingHours(dateTime);
        }
        return dateTime;
    }

    /**
     * Generates iCalendar (.ics) format string for compatibility.
     */
    public String generateICalendar(UUID scheduleId) {
        CourtSchedule schedule = courtScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found: " + scheduleId));

        DateTimeFormatter iCalFormatter = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
        String nowStr = LocalDateTime.now().format(iCalFormatter);
        String startStr = schedule.getStartTime().format(iCalFormatter);
        String endStr = schedule.getEndTime().format(iCalFormatter);

        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:-//NyaySetu//Court Scheduling//EN\r\n");
        sb.append("BEGIN:VEVENT\r\n");
        sb.append("UID:").append(schedule.getId()).append("\r\n");
        sb.append("DTSTAMP:").append(nowStr).append("\r\n");
        sb.append("DTSTART:").append(startStr).append("\r\n");
        sb.append("DTEND:").append(endStr).append("\r\n");
        sb.append("SUMMARY:").append(schedule.getCaseEntity().getTitle()).append(" - Court Hearing\r\n");
        sb.append("DESCRIPTION:Court hearing for case: ").append(schedule.getCaseEntity().getTitle())
                .append("\\nJudge: ").append(schedule.getJudge().getName())
                .append("\\nLawyer: ").append(schedule.getLawyer() != null ? schedule.getLawyer().getName() : "None")
                .append("\\nPriority: ").append(schedule.getPriority()).append("\r\n");
        sb.append("LOCATION:").append(schedule.getCourtroom().getName()).append(" (Room ").append(schedule.getCourtroom().getRoomNumber()).append(")\r\n");
        sb.append("END:VEVENT\r\n");
        sb.append("END:VCALENDAR\r\n");

        return sb.toString();
    }

    /**
     * Detect all conflicts currently registered.
     */
    public List<SchedulingConflict> getActiveConflicts() {
        return schedulingConflictRepository.findByResolved(false);
    }

    /**
     * Dispatch notification to involved parties.
     */
    private void sendScheduleNotifications(CourtSchedule schedule, String title, String message) {
        try {
            // Notify Litigant
            if (schedule.getCaseEntity() != null && schedule.getCaseEntity().getClient() != null) {
                notificationService.save(Notification.builder()
                        .userId(schedule.getCaseEntity().getClient().getId())
                        .title(title)
                        .message(message)
                        .readFlag(false)
                        .build());
            }
            // Notify Lawyer
            if (schedule.getLawyer() != null) {
                notificationService.save(Notification.builder()
                        .userId(schedule.getLawyer().getId())
                        .title(title)
                        .message(message)
                        .readFlag(false)
                        .build());
            }
            // Notify Judge
            if (schedule.getJudge() != null) {
                notificationService.save(Notification.builder()
                        .userId(schedule.getJudge().getId())
                        .title(title)
                        .message(message)
                        .readFlag(false)
                        .build());
            }
        } catch (Exception e) {
            log.error("Failed to send schedule notifications", e);
        }
    }

    public static class SlotSearchResult {
        private final LocalDateTime startTime;
        private final LocalDateTime endTime;
        private final Courtroom courtroom;

        public SlotSearchResult(LocalDateTime startTime, LocalDateTime endTime, Courtroom courtroom) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.courtroom = courtroom;
        }

        public LocalDateTime getStartTime() { return startTime; }
        public LocalDateTime getEndTime() { return endTime; }
        public Courtroom getCourtroom() { return courtroom; }
    }
}
