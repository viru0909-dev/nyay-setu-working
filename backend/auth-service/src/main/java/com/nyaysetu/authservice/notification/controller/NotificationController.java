package com.nyaysetu.authservice.notification.controller;

import com.nyaysetu.authservice.notification.entity.Notification;
import com.nyaysetu.authservice.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody Notification notification) {
        Notification saved = notificationService.save(notification);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> forUser(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.findForUser(userId));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok().build();
    }
}