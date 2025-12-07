package com.nyaysetu.backend.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JoinMeetingRequest {
    private String meetingCode;
    private UUID userId;
}
