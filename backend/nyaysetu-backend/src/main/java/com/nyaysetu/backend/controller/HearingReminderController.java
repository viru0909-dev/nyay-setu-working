package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.Hearing;
import com.nyaysetu.backend.entity.HearingReminder;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.HearingReminderRepository;
import com.nyaysetu.backend.repository.HearingRepository;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/hearing-reminders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class HearingReminderController {

    private final HearingReminderRepository hearingReminderRepository;
    private final HearingRepository hearingRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getMyReminders(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            List<HearingReminder> reminders = hearingReminderRepository.findByUserIdOrderByReminderTimeAsc(user.getId());
            List<Map<String, Object>> response = reminders.stream().map(this::mapToResponse).toList();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get reminders", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrUpdateReminder(
            @RequestBody CreateReminderRequest request,
            Authentication authentication
    ) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            Hearing hearing = hearingRepository.findById(request.getHearingId())
                    .orElseThrow(() -> new RuntimeException("Hearing not found: " + request.getHearingId()));

            // Check if reminder already exists for this hearing and user
            List<HearingReminder> existing = hearingReminderRepository.findByHearingIdAndUserId(request.getHearingId(), user.getId());
            HearingReminder reminder;
            if (!existing.isEmpty()) {
                reminder = existing.get(0);
                reminder.setReminderTime(request.getReminderTime());
                reminder.setReminderMessage(request.getReminderMessage());
            } else {
                reminder = HearingReminder.builder()
                        .hearing(hearing)
                        .user(user)
                        .reminderTime(request.getReminderTime())
                        .reminderMessage(request.getReminderMessage())
                        .build();
            }

            HearingReminder saved = hearingReminderRepository.save(reminder);
            return ResponseEntity.ok(mapToResponse(saved));
        } catch (Exception e) {
            log.error("Failed to save reminder", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReminder(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            HearingReminder reminder = hearingReminderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reminder not found: " + id));

            if (!reminder.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Not authorized to delete this reminder"));
            }

            hearingReminderRepository.delete(reminder);
            return ResponseEntity.ok(Map.of("message", "Reminder deleted successfully"));
        } catch (Exception e) {
            log.error("Failed to delete reminder", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> mapToResponse(HearingReminder reminder) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", reminder.getId());
        map.put("reminderTime", reminder.getReminderTime());
        map.put("reminderMessage", reminder.getReminderMessage());
        map.put("createdAt", reminder.getCreatedAt());

        if (reminder.getHearing() != null) {
            map.put("hearingId", reminder.getHearing().getId());
            map.put("scheduledDate", reminder.getHearing().getScheduledDate());
            map.put("videoRoomId", reminder.getHearing().getVideoRoomId());
            map.put("status", reminder.getHearing().getStatus().name());

            if (reminder.getHearing().getCaseEntity() != null) {
                map.put("caseId", reminder.getHearing().getCaseEntity().getId());
                map.put("caseTitle", reminder.getHearing().getCaseEntity().getTitle());
                map.put("caseNumber", reminder.getHearing().getCaseEntity().getId().toString().substring(0, 8).toUpperCase());
            }
        }
        return map;
    }

    @lombok.Data
    public static class CreateReminderRequest {
        private UUID hearingId;
        private LocalDateTime reminderTime;
        private String reminderMessage;
    }
}