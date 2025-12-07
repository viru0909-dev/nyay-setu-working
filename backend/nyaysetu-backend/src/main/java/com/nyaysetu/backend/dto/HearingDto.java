package com.nyaysetu.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HearingDto {

    private Long id;
    private LocalDateTime dateTime;
    private String location;
    private String status;
}