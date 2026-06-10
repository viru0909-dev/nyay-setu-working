package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JoinMeetingRequest {

    @NotBlank(message = "Meeting code is required")
    private String meetingCode;

    @NotNull(message = "User ID is required")
    private UUID userId;
}
