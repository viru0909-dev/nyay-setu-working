package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.CreateFeedbackRequest;
import com.nyaysetu.backend.entity.Feedback;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    @Transactional
    public Feedback submitFeedback(CreateFeedbackRequest request, User user) {
        Feedback feedback = Feedback.builder()
                .userId(user.getId())
                .lawyerId(request.getLawyerId())
                .content(request.getContent())
                .rating(request.getRating())
                .createdAt(LocalDateTime.now())
                .build();

        return feedbackRepository.save(feedback);
    }
}
