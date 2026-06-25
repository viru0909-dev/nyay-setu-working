package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.VakilFriendFeedback;
import com.nyaysetu.backend.repository.VakilFriendFeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller that exposes API endpoints for submitting user feedback loops 
 * and retrieving AI response quality tracking metrics for Vakil Friend queries.
 * Hardened with strict role-based access controls on administrative endpoints.
 */
@RestController
@RequestMapping("/api/v1/vakil-friend/feedback")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class VakilFriendFeedbackController {

    private final VakilFriendFeedbackRepository feedbackRepository;

    /**
     * POST endpoint to submit user feedback loop parameters for an AI response.
     * Mapped publicly to allow any authenticated user to rate responses.
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> submitFeedback(@RequestBody VakilFriendFeedback feedbackPayload) {
        log.info("[FeedbackAPI] Ingesting feedback parameters loop for Query ID: {}", feedbackPayload.getQueryId());
        Map<String, Object> responseMetadata = new HashMap<>();

        if (feedbackPayload.getQueryId() == null || feedbackPayload.getQueryId().isBlank() ||
            feedbackPayload.getResponseId() == null || feedbackPayload.getResponseId().isBlank() ||
            feedbackPayload.getFeedbackType() == null || feedbackPayload.getFeedbackType().isBlank()) {
            
            log.warn("[FeedbackAPI] Validation failed across input parameters payload data structure keys.");
            responseMetadata.put("success", false);
            responseMetadata.put("message", "Required parameters missing: queryId, responseId, and feedbackType are mandatory.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseMetadata);
        }

        try {
            VakilFriendFeedback savedFeedback = feedbackRepository.save(feedbackPayload);
            log.info("[FeedbackAPI] User feedback successfully committed to data pools with ID: {}", savedFeedback.getId());
            
            responseMetadata.put("success", true);
            responseMetadata.put("message", "Feedback logged successfully.");
            responseMetadata.put("feedbackId", savedFeedback.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseMetadata);
        } catch (Exception e) {
            log.error("[FeedbackAPI] Persistence runtime error encounter intercepted:", e);
            responseMetadata.put("success", false);
            responseMetadata.put("message", "Internal persistence failure: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMetadata);
        }
    }

    /**
     * GET endpoint to aggregate all logs for administrator analytics dashboard panels.
     * Hardened Security: Restricts execution explicitly to HIGH-PRIVILEGE ADMIN users.
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VakilFriendFeedback>> getAdminAnalyticsMetrics() {
        log.info("[FeedbackAPI] Dispatching global feedback log histories row collection layer for admin metrics tracking.");
        try {
            List<VakilFriendFeedback> feedbackLogsCollection = feedbackRepository.findAll();
            return ResponseEntity.ok(feedbackLogsCollection);
        } catch (Exception e) {
            log.error("[FeedbackAPI] Administrative records compilation failure:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET endpoint to filter feedback tracking parameters by target feedback type (e.g., NOT_HELPFUL).
     * Hardened Security: Restricts execution explicitly to HIGH-PRIVILEGE ADMIN users.
     */
    @GetMapping("/analytics/filter")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VakilFriendFeedback>> filterMetricsByType(@RequestParam String type) {
        log.info("[FeedbackAPI] Executing granular filter parameter query against feedback type matching: {}", type);
        try {
            List<VakilFriendFeedback> filteredLogs = feedbackRepository.findByFeedbackType(type);
            return ResponseEntity.ok(filteredLogs);
        } catch (Exception e) {
            log.error("[FeedbackAPI] Granular record isolation extraction failure:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

