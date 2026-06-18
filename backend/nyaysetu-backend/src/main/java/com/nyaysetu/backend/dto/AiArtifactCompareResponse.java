package com.nyaysetu.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiArtifactCompareResponse {
    private List<String> added;
    private List<String> removed;
    private List<String> condensed;
}
