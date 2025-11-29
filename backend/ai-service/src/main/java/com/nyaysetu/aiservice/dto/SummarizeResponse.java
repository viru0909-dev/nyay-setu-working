package com.nyaysetu.aiservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@Builder
@Data
@AllArgsConstructor
public class SummarizeResponse {
    private String summary;
}
