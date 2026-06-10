package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateMeetingRequest {

    @NotNull(message = "Case ID is required")
    private UUID caseId;

    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledAt;

    private List<UUID> participants; // optional
}
