package com.nyaysetu.aiservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class SummarizeRequest {
    private String text;
}