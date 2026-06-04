package com.nyaysetu.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.beans.factory.annotation.Value;

import com.nyaysetu.backend.handler.NotificationWebSocketHandler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
                "app.websocket.allowed-origins must be explicitly configured. " +
                "Wildcard '*' is not permitted (CWE-942)."
            );
        }
        for (String origin : allowedOrigins) {
            if ("*".equals(origin.trim())) {
                throw new IllegalStateException(
                    "Wildcard '*' is not allowed in app.websocket.allowed-origins. " +
                    "Specify explicit origins to prevent Cross-Site WebSocket Hijacking (CWE-942)."
                );
            }
        }
        log.info("WebSocket allowed origins: {}", String.join(", ", allowedOrigins));
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