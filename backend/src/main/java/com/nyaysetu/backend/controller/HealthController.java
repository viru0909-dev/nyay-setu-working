package com.nyaysetu.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        Duration uptime = Duration.ofMillis(uptimeMs);

        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "nyaysetu-backend",
                "uptime", String.format("%dh %dm %ds", uptime.toHours(), uptime.toMinutesPart(), uptime.toSecondsPart())
        ));
    }
}
