package com.nyaysetu.backend.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LawyerMatchDTO {
    private Long lawyerProfileId;
    private Long userId;
    private String name;
    private String email;
    private String barCouncilNumber;
    private List<String> expertiseTags;
    private String city;
    private Double rating;
    private Integer experienceYears;
    private Integer activeCaseCount;
    private Double matchScore; // percentage 0–100
}