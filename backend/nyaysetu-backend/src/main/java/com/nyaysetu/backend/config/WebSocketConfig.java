package com.nyaysetu.backend.config;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.nyaysetu.backend.handler.NotificationWebSocketHandler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private static final List<String> DEFAULT_ORIGINS = Arrays.asList(
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost"
    );

    private final NotificationWebSocketHandler notificationHandler;

    @Value("${cors.allowed.origins:}")
    private String allowedOrigins;

    private String[] resolveAllowedOrigins() {
        if (allowedOrigins != null && !allowedOrigins.trim().isEmpty()) {
            List<String> origins = Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());

            if (origins.contains("*")) {
                log.warn("CORS_ALLOWED_ORIGINS contains bare '*'. Falling back to localhost defaults for WebSocket.");
                return DEFAULT_ORIGINS.toArray(new String[0]);
            }

            return origins.toArray(new String[0]);
        }

        return DEFAULT_ORIGINS.toArray(new String[0]);
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(notificationHandler, "/api/ws/notifications")
                .setAllowedOriginPatterns(resolveAllowedOrigins());
    }
}
