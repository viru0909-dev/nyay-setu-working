package com.nyaysetu.service;
import com.nyaysetu.dto.FeedbackRequest;
import com.nyaysetu.model.Feedback;
import com.nyaysetu.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

@Service
public class FeedbackService {
    private final FeedbackRepository repo;
    public FeedbackService(FeedbackRepository repo) { this.repo = repo; }

    public Feedback saveFeedback(FeedbackRequest req) {
        Feedback f = new Feedback();
        f.setName(req.getName()); f.setEmail(req.getEmail());
        f.setCategory(req.getCategory()); f.setRating(req.getRating());
        f.setMessage(req.getMessage());
        return repo.save(f);
    }
}
