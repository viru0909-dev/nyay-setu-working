package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.DlqStatsResponse;
import com.nyaysetu.backend.service.DlqMonitoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/queues")
@RequiredArgsConstructor
@Slf4j
public class DlqMonitoringController {

    private final DlqMonitoringService dlqMonitoringService;

    /**
     * Endpoint to fetch Dead Letter Queue (DLQ) stats.
     * Accessible only to users with 'ROLE_ADMIN'.
     *
     * @return ResponseEntity with DlqStatsResponse
     */
    @GetMapping("/dlq/stats")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<DlqStatsResponse> getDlqStats() {
        log.info("Received request to fetch DLQ stats.");
        DlqStatsResponse stats = dlqMonitoringService.getDlqStats();
        return ResponseEntity.ok(stats);
    }
}
