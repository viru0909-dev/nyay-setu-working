package com.nyaysetu.controller;
import com.nyaysetu.dto.FeedbackRequest;
import com.nyaysetu.model.Feedback;
import com.nyaysetu.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {
    private final FeedbackService service;
    public FeedbackController(FeedbackService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<?> submit(@Valid @RequestBody FeedbackRequest req) {
        Feedback saved = service.saveFeedback(req);
        return ResponseEntity.ok("Feedback submitted with ID: " + saved.getId());
    }
}
