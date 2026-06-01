package com.nyaysetu.backend.notification.service;

import com.nyaysetu.backend.notification.entity.Notification;
import com.nyaysetu.backend.notification.event.NotificationCreatedEvent;
import com.nyaysetu.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Notification save(Notification notification) {
        Notification saved = repository.save(notification);
        eventPublisher.publishEvent(new NotificationCreatedEvent(saved.getId()));
        return saved;
    }

    public List<Notification> findForUser(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markRead(Long id) {
        Optional<Notification> o = repository.findById(id);
        o.ifPresent(n -> {
            n.setReadFlag(true);
            repository.save(n);
        });
    }
}