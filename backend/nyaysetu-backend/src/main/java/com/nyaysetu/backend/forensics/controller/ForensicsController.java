package com.nyaysetu.backend.forensics.controller;

import com.nyaysetu.backend.forensics.entity.AccidentCase;
import com.nyaysetu.backend.forensics.service.ForensicsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "Forensics", description = "AI Courtroom media video analysis and report streaming")
@RestController
@RequestMapping("/forensics")
@RequiredArgsConstructor
public class ForensicsController {

    private final ForensicsService service;

    @Operation(summary = "Upload video for forensic analysis", description = "Upload accident/CCTV footage for multi-frame AI analysis")
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

    @Operation(summary = "Stream forensic analysis progress", description = "Server-Sent Events (SSE) stream for real-time video processing logs")
    @GetMapping(value = "/stream/{jobId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamAnalysis(@PathVariable UUID jobId) {
        return service.streamAnalysis(jobId);
    }
    
    @Operation(summary = "Get forensic analysis report", description = "Fetch completed accident/CCTV forensic report by job ID")
    @GetMapping("/report/{jobId}")
    public ResponseEntity<AccidentCase> getReport(@PathVariable UUID jobId) {
        return ResponseEntity.ok(service.getReport(jobId));
    }
}
