package com.nyaysetu.backend.forensics.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.forensics.dto.ForensicsRequest;
import com.nyaysetu.backend.forensics.entity.AccidentCase;
import com.nyaysetu.backend.forensics.repository.AccidentCaseRepository;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForensicsService {

    private final AccidentCaseRepository repository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    
    // Configured for local FastAPI Orchestrator
    private final WebClient webClient = WebClient.builder()
            .baseUrl("http://localhost:8001")
            .build();

    // In-memory store of SSE streams per jobId
    private final Map<UUID, Sinks.Many<String>> activeStreams = new ConcurrentHashMap<>();

    // Mock MinIO / Local Storage approach
    private final String UPLOAD_DIR = "uploads/forensics/";

    public UUID initializeAnalysis(List<MultipartFile> videos, String description, String username) {
        User user = userRepository.findByEmail(username).orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        List<String> savedPaths = new ArrayList<>();
        
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            for (MultipartFile video : videos) {
                String filename = UUID.randomUUID() + "_" + video.getOriginalFilename();
                Path filePath = uploadPath.resolve(filename);
                Files.copy(video.getInputStream(), filePath);
                // For local fastAPI to access, we can give absolute paths
                savedPaths.add(filePath.toAbsolutePath().toString());
            }
        } catch (IOException e) {
            log.error("Failed to store video files", e);
            throw new RuntimeException("Failed to store video files", e);
        }

        AccidentCase accidentCase = new AccidentCase();
        accidentCase.setUser(user);
        accidentCase.setVideoStoragePaths(savedPaths);
        accidentCase.setStatus(AccidentCase.Status.UPLOADED);
        accidentCase.setCreatedAt(LocalDateTime.now());
        
        accidentCase = repository.save(accidentCase);
        
        // Initialize the SSE Sink for this job
        Sinks.Many<String> sink = Sinks.many().multicast().onBackpressureBuffer();
        activeStreams.put(accidentCase.getId(), sink);
        
        // Async processing
        triggerPythonAnalysis(accidentCase.getId(), savedPaths, description);
        
        return accidentCase.getId();
    }

    @Async
    protected void triggerPythonAnalysis(UUID jobId, List<String> videoPaths, String description) {
        log.info("Starting background analysis for job {}", jobId);
        
        AccidentCase accidentCase = repository.findById(jobId).orElseThrow();
        accidentCase.setStatus(AccidentCase.Status.PROCESSING);
        repository.save(accidentCase);
        
        Sinks.Many<String> sink = activeStreams.get(jobId);

        ForensicsRequest request = new ForensicsRequest();
        request.setJobId(jobId.toString());
        request.setVideoUrls(videoPaths);
        request.setCitizenDescription(description);

        // Stream from Python and forward to frontend
        webClient.post()
                .uri("/forensics/analyze-stream")
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(request)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .retrieve()
                .bodyToFlux(String.class)
                .doOnNext(eventData -> {
                    // Forward straight to React SSE
                    if (sink != null) sink.tryEmitNext(eventData);
                    
                    try {
                        // Parse JSON to see if we need to update DB
                        Map<String, Object> eventMap = objectMapper.readValue(eventData, Map.class);
                        String type = (String) eventMap.get("type");
                        
                        // Just an example of persisting intermediate/final state
                        if ("complete".equals(type)) {
                            Map<String, Object> reportData = (Map<String, Object>) eventMap.get("report");
                            accidentCase.setLiabilityReport(objectMapper.writeValueAsString(reportData));
                            accidentCase.setStatus(AccidentCase.Status.COMPLETE);
                            repository.save(accidentCase);
                            
                            if (sink != null) sink.tryEmitComplete();
                            activeStreams.remove(jobId);
                        } else if ("error".equals(type)) {
                            accidentCase.setStatus(AccidentCase.Status.FAILED);
                            repository.save(accidentCase);
                            
                            if (sink != null) sink.tryEmitError(new RuntimeException((String) eventMap.get("message")));
                            activeStreams.remove(jobId);
                        }
                    } catch (Exception e) {
                        log.error("Error parsing Python SSE event", e);
                    }
                })
                .doOnError(error -> {
                    log.error("Error streaming from Python Orchestrator", error);
                    accidentCase.setStatus(AccidentCase.Status.FAILED);
                    repository.save(accidentCase);
                    if (sink != null) {
                        sink.tryEmitError(error);
                        activeStreams.remove(jobId);
                    }
                })
                .subscribe(); // Subscribe non-blocking
    }

    public Flux<String> streamAnalysis(UUID jobId) {
        Sinks.Many<String> sink = activeStreams.get(jobId);
        if (sink == null) {
            // Check if it's already complete in DB
            return repository.findById(jobId).map(accidentCase -> {
                if (accidentCase.getStatus() == AccidentCase.Status.COMPLETE) {
                    return Flux.just("{\"type\": \"complete\", \"report\": " + accidentCase.getLiabilityReport() + "}");
                }
                return Flux.just("{\"type\": \"error\", \"message\": \"Job not found or already finished\"}");
            }).orElse(Flux.error(new RuntimeException("Job ID not valid")));
        }
        return sink.asFlux();
    }
    
    public AccidentCase getReport(UUID jobId) {
        return repository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Report not found for jobId " + jobId));
    }
}
