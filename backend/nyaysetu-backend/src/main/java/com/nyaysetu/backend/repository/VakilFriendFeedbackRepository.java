package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.VakilFriendFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository interface that exposes standardized database operations,
 * inserts, and custom query boundaries for the vakil_friend_feedback analytics matrix.
 */
@Repository
public interface VakilFriendFeedbackRepository extends JpaRepository<VakilFriendFeedback, Long> {
    
    /**
     * Retrieves all user feedback entries associated with a specific AI processing session query.
     */
    List<VakilFriendFeedback> findByQueryId(String queryId);

    /**
     * Retrieves all feedback filtered by rating type (e.g., HELPFUL, NOT_HELPFUL) for analytical processing.
     */
    List<VakilFriendFeedback> findByFeedbackType(String feedbackType);
}

