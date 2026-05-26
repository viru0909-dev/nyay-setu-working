package com.nyaysetu.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationDTO {
    private Long id;
    private LawyerProfileDTO lawyer;
    private String clientName;
    private String clientEmail;
    private LocalDateTime scheduledTime;
    private Integer durationMinutes;
    private String status;
    private String zoomMeetingUrl;
    private String notes;
    private Double lawyerRating;
    private String clientFeedback;
    private PaymentDTO payment;
}
