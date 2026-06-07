package com.nyaysetu.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CaseNotificationDTO {
    private String caseId;
    private String caseTitle;
    private String status;
    private String message;
    private String role;
    private Long userId;
    private LocalDateTime timestamp;
}
