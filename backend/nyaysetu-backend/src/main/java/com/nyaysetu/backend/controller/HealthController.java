package com.nyaysetu.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.util.Map;

@RestController
@Tag(name = "Health", description = "Server health check — uptime, version and status")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        Duration uptime = Duration.ofMillis(uptimeMs);
        String version = getClass().getPackage().getImplementationVersion();
        if (version == null) {
            version = "dev";
        }
        String javaVersion = System.getProperty("java.version");

        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "nyaysetu-backend",
                "uptime", String.format("%dh %dm %ds", uptime.toHours(), uptime.toMinutesPart(), uptime.toSecondsPart()),
                "version", version,
                "java", javaVersion
        ));
    }
}
