package com.nyaysetu.backend.notification.event;

import com.nyaysetu.backend.handler.NotificationWebSocketHandler;
import com.nyaysetu.backend.notification.entity.Notification;
import com.nyaysetu.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation; // Add this import
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationWebSocketEventListener {

    private final NotificationRepository notificationRepository;
    private final NotificationWebSocketHandler webSocketHandler;

    // FIX: Changed from plain @Transactional to explicitly use REQUIRES_NEW propagation
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT,
            fallbackExecution = true
    )
    public void handleNotificationCreated(NotificationCreatedEvent event) {
        if (event.notificationId() == null) {
            return;
        }
        notificationRepository.findById(event.notificationId())
                .ifPresent(this::sendLiveNotification);
    }

    private void sendLiveNotification(Notification notification) {
        if (notification.getUserId() == null) {
            return;
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", notification.getId());
        payload.put("title", notification.getTitle());
        payload.put("message", notification.getMessage());
        payload.put("timestamp", notification.getCreatedAt() != null
                ? notification.getCreatedAt().toString()
                : Instant.now().toString());
        payload.put("read", Boolean.TRUE.equals(notification.getReadFlag()));

        webSocketHandler.sendNotification(notification.getUserId(), payload);
        log.debug("Live notification sent after commit for user {}", notification.getUserId());
    }
}