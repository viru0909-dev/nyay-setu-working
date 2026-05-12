package com.nyaysetu.backend.forensics.dto;

import lombok.Data;
import java.util.List;

@Data
public class ForensicsRequest {
    private String jobId;
    private List<String> videoUrls;
    private String citizenDescription;
}
