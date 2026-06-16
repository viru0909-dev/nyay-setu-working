package com.nyaysetu.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DlqStatsResponse {
    private String queueName;
    private Long messageCount;
    private Boolean hasFailures;
    private LocalDateTime timestamp;
}
