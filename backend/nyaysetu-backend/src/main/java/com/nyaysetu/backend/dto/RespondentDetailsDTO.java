package com.nyaysetu.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespondentDetailsDTO {
    private String respondentName;
    private String respondentEmail;
    private String respondentPhone;
    private String respondentAddress;
    private Boolean respondentIdentified;
}
