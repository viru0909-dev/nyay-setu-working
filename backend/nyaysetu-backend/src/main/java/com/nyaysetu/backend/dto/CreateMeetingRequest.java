package com.nyaysetu.backend.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMeetingRequest {
    private UUID caseId;
    private LocalDateTime scheduledAt;
    private List<UUID> participants;
}
