package com.nyaysetu.backend.notification.controller;

import com.nyaysetu.backend.notification.entity.Notification;
import com.nyaysetu.backend.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Notifications", description = "Real-time user notification management")
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Send notification", description = "Create and dispatch notification for user")
    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody Notification notification) {
        Notification saved = notificationService.save(notification);
        return ResponseEntity.ok(saved);
    }

    @Operation(summary = "Get user notifications", description = "Fetch unread notifications for specified user ID")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> forUser(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.findForUser(userId));
    }

    @Operation(summary = "Mark notification as read", description = "Update notification read status to true")
    @PostMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok().build();
    }
}