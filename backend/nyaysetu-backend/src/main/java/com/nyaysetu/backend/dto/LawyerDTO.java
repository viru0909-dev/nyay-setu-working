package com.nyaysetu.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LawyerDTO {
    private Long id;
    private String name;
    private String email;
    private String specialization;
    private Integer casesHandled;
    private Double rating;
}
