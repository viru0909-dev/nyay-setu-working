package com.nyaysetu.backend.forensics.controller;

import com.nyaysetu.backend.forensics.entity.AccidentCase;
import com.nyaysetu.backend.forensics.service.ForensicsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/forensics")
@RequiredArgsConstructor
public class ForensicsController {

    private final ForensicsService service;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadVideo(
            @RequestParam("videos") List<MultipartFile> videos,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            Authentication authentication) {
            
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        
        UUID jobId = service.initializeAnalysis(videos, description, authentication.getName());
        return ResponseEntity.ok(Map.of("jobId", jobId.toString(), "message", "Analysis started"));
    }

    @GetMapping(value = "/stream/{jobId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamAnalysis(@PathVariable UUID jobId) {
        return service.streamAnalysis(jobId);
    }
    
    @GetMapping("/report/{jobId}")
    public ResponseEntity<AccidentCase> getReport(@PathVariable UUID jobId) {
        return ResponseEntity.ok(service.getReport(jobId));
    }
}
