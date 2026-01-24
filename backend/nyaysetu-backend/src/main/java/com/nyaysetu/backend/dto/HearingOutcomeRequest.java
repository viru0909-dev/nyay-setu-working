package com.nyaysetu.backend.dto;

import com.nyaysetu.backend.entity.CaseStage;
import com.nyaysetu.backend.entity.HearingOutcomeType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HearingOutcomeRequest {
    private HearingOutcomeType outcomeType;
    private String judgeNotes;
    private CaseStage nextStage;
    private LocalDateTime nextHearingDate;
}
