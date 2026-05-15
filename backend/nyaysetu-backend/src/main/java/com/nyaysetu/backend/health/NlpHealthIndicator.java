package com.nyaysetu.backend.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.Duration;

@Component
public class NlpHealthIndicator implements HealthIndicator {

    private final WebClient webClient;

    public NlpHealthIndicator(WebClient.Builder webClientBuilder) {
        // This uses the default Ollama port from your properties
        this.webClient = webClientBuilder.baseUrl("http://localhost:11434").build();
    }

    @Override
    public Health health() {
        try {
            // Pings the AI service to ensure it's responsive
            webClient.get()
                    .uri("/api/tags") 
                    .retrieve()
                    .toBodilessEntity()
                    .block(Duration.ofSeconds(3));

            return Health.up()
                    .withDetail("service", "NLP/Ollama")
                    .withDetail("status", "Reachable")
                    .build();
        } catch (Exception e) {
            return Health.down()
                    .withDetail("service", "NLP/Ollama")
                    .withDetail("error", "Service Unreachable or Timed Out")
                    .build();
        }
    }
}