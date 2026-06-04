package com.nyaysetu.backend.config;

import com.nyaysetu.backend.handler.NotificationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;

@Slf4j
@Configuration
@EnableWebSocket
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer, WebSocketMessageBrokerConfigurer {

    private final NotificationWebSocketHandler notificationHandler;

    @Value("${app.websocket.allowed-origins}")
    private String[] allowedOrigins;

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

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/api/ws/stomp")
                .setAllowedOrigins(getValidatedOrigins())
                .withSockJS();
        registry.addEndpoint("/api/ws/stomp")
                .setAllowedOrigins(getValidatedOrigins());
    }
}