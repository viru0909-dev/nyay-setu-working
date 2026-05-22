package com.nyaysetu.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationSlotDTO {
    private Long id;
    private Long lawyerId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
}
