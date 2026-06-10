package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ScheduleHearingRequest {

    @NotNull(message = "Hearing date and time is required")
    private LocalDateTime when;

    @NotBlank(message = "Location is required")
    private String location;

    private String notes; // optional
}