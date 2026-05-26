package com.nyaysetu.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookConsultationRequest {
    private Long lawyerId;
    private LocalDateTime scheduledTime;
    private Integer durationMinutes;
    private String notes;
}
