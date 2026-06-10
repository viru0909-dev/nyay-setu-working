package com.nyaysetu.backend.dto;

import com.nyaysetu.backend.entity.CaseStage;
import com.nyaysetu.backend.entity.HearingOutcomeType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HearingOutcomeRequest {

    @NotNull(message = "Outcome type is required")
    private HearingOutcomeType outcomeType;

    private String judgeNotes;           // optional
    private CaseStage nextStage;         // optional
    private LocalDateTime nextHearingDate; // optional
}
