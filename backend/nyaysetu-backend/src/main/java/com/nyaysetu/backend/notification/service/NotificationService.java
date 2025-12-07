package com.nyaysetu.backend.notification.service;

import com.nyaysetu.backend.notification.entity.Notification;
import com.nyaysetu.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    public Notification save(Notification notification) {
        return repository.save(notification);
    }

    public List<Notification> findForUser(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markRead(Long id) {
        Optional<Notification> o = repository.findById(id);
        o.ifPresent(n -> {
            n.setReadFlag(true);
            repository.save(n);
        });
    }
}