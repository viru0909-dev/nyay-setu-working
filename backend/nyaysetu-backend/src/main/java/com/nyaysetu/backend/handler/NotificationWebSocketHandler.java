package com.nyaysetu.backend.handler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.JwtService;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.nio.channels.ClosedChannelException;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private static final CloseStatus AUTH_REQUIRED =
            new CloseStatus(1008, "Authentication required");

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<Long, WebSocketSession> sessionsByUserId = new ConcurrentHashMap<>();
    private final Map<String, Long> userIdBySessionId = new ConcurrentHashMap<>();
    private final Map<String, ScheduledFuture<?>> authTimeouts = new ConcurrentHashMap<>();

    private final ScheduledExecutorService authTimeoutExecutor =
            Executors.newSingleThreadScheduledExecutor();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("Notification WebSocket opened: {}", session.getId());

        ScheduledFuture<?> timeout = authTimeoutExecutor.schedule(() -> {
            if (session.isOpen() && !userIdBySessionId.containsKey(session.getId())) {
                try {
                    log.warn("Closing unauthenticated WebSocket session: {}", session.getId());
                    session.close(AUTH_REQUIRED);
                } catch (IOException e) {
                    log.warn("Failed to close unauthenticated WebSocket session: {}", session.getId());
                }
            }
        }, 15, TimeUnit.SECONDS);

        authTimeouts.put(session.getId(), timeout);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode payload;

        try {
            payload = objectMapper.readTree(message.getPayload());
        } catch (Exception e) {
            session.close(new CloseStatus(1003, "Invalid message format"));
            return;
        }

        String type = payload.path("type").asText("");

        if (!userIdBySessionId.containsKey(session.getId())) {
            if (!"AUTH".equals(type)) {
                session.close(AUTH_REQUIRED);
                return;
            }

            authenticateSession(session, payload);
            return;
        }

        if ("PING".equals(type)) {
            sendJson(session, Map.of("type", "PONG"));
        }
    }

    private void authenticateSession(WebSocketSession session, JsonNode payload) throws IOException {
        String token = payload.path("token").asText("");

        if (token.isBlank()) {
            sendJson(session, Map.of("type", "AUTH_ERROR", "message", "Missing token"));
            session.close(AUTH_REQUIRED);
            return;
        }

        try {
            String email = jwtService.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            if (!jwtService.isTokenValid(token, userDetails)) {
                sendJson(session, Map.of("type", "AUTH_ERROR", "message", "Invalid token"));
                session.close(AUTH_REQUIRED);
                return;
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("User not found"));

            cancelAuthTimeout(session);

            sessionsByUserId.put(user.getId(), session);
            userIdBySessionId.put(session.getId(), user.getId());

            sendJson(session, Map.of("type", "AUTH_SUCCESS"));

            sendNotification(user.getId(), Map.of(
                    "id", System.currentTimeMillis(),
                    "title", "Connected",
                    "message", "Real-time notifications enabled",
                    "timestamp", new Date().toString(),
                    "read", false
            ));

            log.info("Notification WebSocket authenticated for user: {}", user.getId());
        } catch (Exception e) {
            log.warn("Notification WebSocket authentication failed: {}", e.getMessage());
            sendJson(session, Map.of("type", "AUTH_ERROR", "message", "Authentication failed"));
            session.close(AUTH_REQUIRED);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        cancelAuthTimeout(session);

        Long userId = userIdBySessionId.remove(session.getId());
        if (userId != null) {
            sessionsByUserId.remove(userId, session);
            log.info("Notification WebSocket closed for user: {}", userId);
        } else {
            log.info("Unauthenticated notification WebSocket closed: {}", session.getId());
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        if (exception instanceof ClosedChannelException) {
            log.debug("Notification WebSocket closed during transport: {}", session.getId());
        } else {
            log.error("Notification WebSocket error for session {}: {}", session.getId(), exception.getMessage());
        }
    }

    public void sendNotification(Long userId, Map<String, Object> notification) {
        WebSocketSession session = sessionsByUserId.get(userId);

        if (session == null || !session.isOpen()) {
            return;
        }

        try {
            sendJson(session, Map.of(
                    "type", "NOTIFICATION",
                    "payload", notification
            ));
        } catch (IOException e) {
            log.error("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }

    public void broadcastNotification(Map<String, Object> notification) {
        sessionsByUserId.forEach((userId, session) -> {
            if (session.isOpen()) {
                try {
                    sendJson(session, Map.of(
                            "type", "NOTIFICATION",
                            "payload", notification
                    ));
                } catch (IOException e) {
                    log.error("Failed to broadcast notification to user {}: {}", userId, e.getMessage());
                }
            }
        });
    }

    private void sendJson(WebSocketSession session, Map<String, Object> payload) throws IOException {
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
    }

    private void cancelAuthTimeout(WebSocketSession session) {
        ScheduledFuture<?> timeout = authTimeouts.remove(session.getId());
        if (timeout != null) {
            timeout.cancel(false);
        }
    }

    @PreDestroy
    public void shutdown() {
        authTimeoutExecutor.shutdownNow();
    }
}