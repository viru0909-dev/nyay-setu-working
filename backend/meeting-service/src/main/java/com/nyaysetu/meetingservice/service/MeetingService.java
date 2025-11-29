package com.nyaysetu.meetingservice.service;

import com.nyaysetu.meetingservice.dto.CreateMeetingRequest;
import com.nyaysetu.meetingservice.dto.JoinMeetingRequest;
import com.nyaysetu.meetingservice.dto.MeetingResponse;
import com.nyaysetu.meetingservice.entity.Meeting;
import com.nyaysetu.meetingservice.entity.MeetingStatus;
import com.nyaysetu.meetingservice.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository repository;

    public MeetingResponse createMeeting(CreateMeetingRequest dto) {

        String meetingCode = generateCode();

        // If participants list is null
        List<UUID> participants = dto.getParticipants() != null
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

    public MeetingResponse joinMeeting(JoinMeetingRequest dto) {

        Meeting meeting = repository.findByMeetingCode(dto.getMeetingCode())
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        if (!meeting.getParticipants().contains(dto.getUserId())) {
            meeting.getParticipants().add(dto.getUserId());
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