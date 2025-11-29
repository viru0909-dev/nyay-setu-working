package com.nyaysetu.meetingservice.dto;

import com.nyaysetu.meetingservice.entity.MeetingStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingResponse {
    private UUID id;
    private String meetingCode;
    private MeetingStatus status;
    private List<UUID> participants;
    private UUID caseId;
    private LocalDateTime scheduledAt;
}
