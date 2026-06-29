package com.nyaysetu.backend.feedback.service;

import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.feedback.entity.Feedback;
import com.nyaysetu.backend.feedback.repository.FeedbackRepository;
import com.nyaysetu.backend.notification.entity.Notification;
import com.nyaysetu.backend.notification.service.NotificationService;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Transactional
    public Feedback submitFeedback(User user, String category, String subject, String message, Integer rating, MultipartFile screenshot) {
        String screenshotPath = null;
        if (screenshot != null && !screenshot.isEmpty()) {
            screenshotPath = fileStorageService.storeFile(screenshot, "feedback");
        }

        Feedback feedback = Feedback.builder()
                .userId(user.getId())
                .userName(user.getName())
                .userEmail(user.getEmail())
                .category(category)
                .subject(subject)
                .message(message)
                .rating(rating)
                .screenshotPath(screenshotPath)
                .createdAt(LocalDateTime.now())
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        notifyAdmins(saved, user);
        return saved;
    }

    public List<Feedback> getMyFeedback(Long userId) {
        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    private void notifyAdmins(Feedback feedback, User submitter) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        if (admins == null || admins.isEmpty()) {
            return;
        }

        String title = "New feedback received";
        String message = String.format(
                "%s submitted feedback: %s",
                submitter.getName() != null ? submitter.getName() : submitter.getEmail(),
                feedback.getCategory() != null ? feedback.getCategory() : "General"
        );

        for (User admin : admins) {
            Notification notification = Notification.builder()
                    .userId(admin.getId())
                    .title(title)
                    .message(message)
                    .build();
            notificationService.save(notification);
        }
    }
}
