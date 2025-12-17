package com.nyaysetu.backend.handler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = extractUserIdFromSession(session);
        sessions.put(userId, session);
        log.info("WebSocket connection established for user: {}", userId);
        
        // Send welcome message
        sendNotification(userId, Map.of(
            "id", System.currentTimeMillis(),
            "title", "Connected",
            "message", "Real-time notifications enabled",
            "timestamp", new java.util.Date().toString(),
            "read", false
        ));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String userId = extractUserIdFromSession(session);
        sessions.remove(userId);
        log.info("WebSocket connection closed for user: {}", userId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        log.debug("Received message: {}", message.getPayload());
        // Handle incoming messages if needed
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket error for session {}: {}", session.getId(), exception.getMessage());
    }

    /**
     * Send notification to a specific user
     */
    public void sendNotification(String userId, Map<String, Object> notification) {
        WebSocketSession session = sessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                String json = objectMapper.writeValueAsString(notification);
                session.sendMessage(new TextMessage(json));
                log.debug("Notification sent to user {}: {}", userId, notification.get("title"));
            } catch (IOException e) {
                log.error("Failed to send notification to user {}: {}", userId, e.getMessage());
            }
        }
    }

    /**
     * Broadcast notification to all connected users
     */
    public void broadcastNotification(Map<String, Object> notification) {
        sessions.forEach((userId, session) -> {
            if (session.isOpen()) {
                try {
                    String json = objectMapper.writeValueAsString(notification);
                    session.sendMessage(new TextMessage(json));
                } catch (IOException e) {
                    log.error("Failed to broadcast notification to user {}: {}", userId, e.getMessage());
                }
            }
        });
    }

    private String extractUserIdFromSession(WebSocketSession session) {
        // Extract user ID from query params or headers
        // For now, using session ID as fallback
        String query = session.getUri().getQuery();
        if (query != null && query.contains("token=")) {
            // Parse token and extract user ID (implement based on your JWT logic)
            return session.getId(); // Placeholder
        }
        return session.getId();
    }
}
