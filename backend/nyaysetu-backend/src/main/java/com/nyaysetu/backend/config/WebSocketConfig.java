package com.nyaysetu.backend.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.nyaysetu.backend.handler.NotificationWebSocketHandler;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final NotificationWebSocketHandler notificationHandler;

    @Value("${app.websocket.allowed-origins}")
    private String[] allowedOrigins;

    public WebSocketConfig(NotificationWebSocketHandler notificationHandler) {
        this.notificationHandler = notificationHandler;
    }

    /**
     * Validate WebSocket origins to prevent CSWSH (CWE-942)
     */
    private String[] getValidatedOrigins() {
        if (allowedOrigins == null || allowedOrigins.length == 0) {
            throw new IllegalStateException(
                "WebSocket allowed origins must be explicitly configured. Wildcard '*' is not allowed."
            );
        }
        for (String origin : allowedOrigins) {
            if (origin == null || origin.trim().isEmpty()) {
                throw new IllegalStateException("WebSocket origin cannot be empty");
            }
            if ("*".equals(origin.trim())) {
                throw new IllegalStateException(
                    "Wildcard '*' is not allowed for WebSocket origins (CWE-942). " +
                    "Define explicit trusted origins only."
                );
            }
        }
        log.info("WebSocket allowed origins: {}", Arrays.toString(allowedOrigins));
        return allowedOrigins;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(notificationHandler, "/api/ws/notifications")
                .setAllowedOrigins(getValidatedOrigins());
    }
}