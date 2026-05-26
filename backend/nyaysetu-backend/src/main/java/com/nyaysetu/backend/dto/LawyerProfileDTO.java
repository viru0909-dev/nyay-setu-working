package com.nyaysetu.backend.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LawyerProfileDTO {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String bio;
    private Integer yearsOfExperience;
    private Double hourlyRate;
    private List<String> specializations;
    private Double averageRating;
    private Integer totalRatings;
    private Boolean verified;
    private Boolean active;
    private String profileImageUrl;
}
