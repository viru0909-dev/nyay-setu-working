package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.CreateMeetingRequest;
import com.nyaysetu.backend.dto.MeetingResponse;
import com.nyaysetu.backend.entity.Meeting;
import com.nyaysetu.backend.entity.MeetingStatus;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.exception.AccessDeniedException;
import com.nyaysetu.backend.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository repository;
    private final CaseAccessService caseAccessService;
    private final AuthService authService;

    public MeetingResponse createMeeting(CreateMeetingRequest dto) {

        String meetingCode = generateCode();

        // If participants list is null
        List<Long> participants = dto.getParticipants() != null
                ? new ArrayList<>(dto.getParticipants())
                : new ArrayList<>();

        Meeting meeting = Meeting.builder()
                .caseId(dto.getCaseId())
                .meetingCode(meetingCode)
                .scheduledAt(dto.getScheduledAt() != null ? dto.getScheduledAt() : LocalDateTime.now())
                .participants(participants)
                .status(MeetingStatus.SCHEDULED)
                .build();

        repository.save(meeting);

        return toResponse(meeting);
    }

    public MeetingResponse joinMeeting(String meetingCode, User user) {

        Meeting meeting = repository.findByMeetingCode(meetingCode)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        Long callerId = user.getId();

        // Validate user has access to the case this meeting belongs to
        caseAccessService.requireCaseAccess(meeting.getCaseId(), user);

        if (!meeting.getParticipants().contains(callerId)) {
            meeting.getParticipants().add(callerId);
        }

        meeting.setStatus(MeetingStatus.ACTIVE);

        repository.save(meeting);

        return toResponse(meeting);
    }

    public MeetingResponse endMeeting(UUID id) {

        Meeting meeting = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        meeting.setStatus(MeetingStatus.ENDED);

        repository.save(meeting);

        return toResponse(meeting);
    }

    public void validateRoomAccess(String meetingCode, User user) {
        Meeting meeting = repository.findByMeetingCode(meetingCode)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        caseAccessService.requireCaseAccess(meeting.getCaseId(), user);
    }

    public List<MeetingResponse> getMeetingsByCase(UUID caseId) {

        return repository.findByCaseId(caseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public MeetingResponse toResponse(Meeting meeting) {
        return MeetingResponse.builder()
                .id(meeting.getId())
                .caseId(meeting.getCaseId())
                .meetingCode(meeting.getMeetingCode())
                .status(meeting.getStatus())
                .participants(meeting.getParticipants())
                .scheduledAt(meeting.getScheduledAt())
                .build();
    }

    private String generateCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }

        return sb.toString();
    }
}