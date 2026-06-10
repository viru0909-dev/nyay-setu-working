package com.nyaysetu.backend.notification.service;

import com.nyaysetu.backend.notification.entity.Notification;
import com.nyaysetu.backend.notification.event.NotificationCreatedEvent;
import com.nyaysetu.backend.notification.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository repository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void saveShouldPublishNotificationCreatedEvent() {
        Notification notification = new Notification();
        Notification savedNotification = new Notification();
        savedNotification.setId(1L);

        when(repository.save(notification)).thenReturn(savedNotification);

        Notification result = notificationService.save(notification);

        assertSame(savedNotification, result);

        ArgumentCaptor<NotificationCreatedEvent> eventCaptor =
                ArgumentCaptor.forClass(NotificationCreatedEvent.class);

        verify(eventPublisher).publishEvent(eventCaptor.capture());
        assertEquals(1L, eventCaptor.getValue().notificationId());
    }
}