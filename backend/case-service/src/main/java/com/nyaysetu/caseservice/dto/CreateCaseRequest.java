package com.nyaysetu.caseservice.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCaseRequest {
    private String title;
    private String description;
    private UUID judgeId;
    private List<PartyDto> parties;
}
