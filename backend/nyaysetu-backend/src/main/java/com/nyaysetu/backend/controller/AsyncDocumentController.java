package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.service.AsyncDocumentAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller implementing fire-and-forget trust boundary mitigations.
 * Instantly acknowledges uploads with HTTP 202 Accepted status codes to avoid thread pool exhaustion.
 */
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AsyncDocumentController {

    private final AsyncDocumentAnalysisService asyncDocumentAnalysisService;

    /**
     * POST endpoint to upload legal documents for AI verification.
     * Hardened Non-Blocking Flow: Instantly logs parameters, queues tasks in the background executor,
     * and returns a rapid HTTP 202 Accepted response within milliseconds.
     */
    @PostMapping("/verify-async")
    public ResponseEntity<Map<String, Object>> uploadAndAnalyzeAsync(@RequestBody Map<String, String> payload) {
        log.info("[IntakeAPI] Intercepting asynchronous document upload verification pass request.");
        Map<String, Object> responseMetadata = new HashMap<>();

        String rawDocumentId = payload.get("documentId");
        String fileUrl = payload.get("fileUrl");

        if (rawDocumentId == null || rawDocumentId.isBlank() || fileUrl == null || fileUrl.isBlank()) {
            log.warn("[IntakeAPI] Validation failed across document intake payload structure keys.");
            responseMetadata.put("success", false);
            responseMetadata.put("message", "Required parameters missing: documentId and fileUrl are mandatory.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseMetadata);
        }

        try {
            Long documentId = Long.parseLong(rawDocumentId);
            
            // 1. Kick off fire-and-forget task execution inside the isolated background worker thread pool
            asyncDocumentAnalysisService.processDocumentAnalysisInBackground(documentId, fileUrl);
            log.info("[IntakeAPI] AI task successfully delegated to background worker pool core queue.");

            // 2. Instantly return HTTP 202 Accepted status envelope to completely clear the web thread
            responseMetadata.put("success", true);
            responseMetadata.put("status", "PROCESSING");
            responseMetadata.put("message", "Document analysis successfully scheduled. Processing is occurring asynchronously in background queues.");
            responseMetadata.put("documentId", documentId);
            
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMetadata);

        } catch (NumberFormatException numEx) {
            log.warn("[IntakeAPI] Malformed document ID constraint infraction parsed: {}", rawDocumentId);
            responseMetadata.put("success", false);
            responseMetadata.put("message", "Invalid format: documentId parameter must be numerical.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseMetadata);
        } catch (Exception e) {
            log.error("[IntakeAPI] Critical intake pipeline failure intercepted:", e);
            responseMetadata.put("success", false);
            responseMetadata.put("message", "Internal pipeline failure context: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMetadata);
        }
    }
}

