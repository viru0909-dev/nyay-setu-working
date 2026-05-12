package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.ChatSession;
import com.nyaysetu.backend.entity.ChatSessionStatus;
import com.nyaysetu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {
    
    // For Vakil-Friend service
    List<ChatSession> findByUserOrderByCreatedAtDesc(User user);
    
    List<ChatSession> findByUserAndStatus(User user, ChatSessionStatus status);
    
    // Legacy methods for backward compatibility
    List<ChatSession> findByUser_IdAndStatus(Long userId, ChatSessionStatus status);
    
    Optional<ChatSession> findByIdAndUser_Id(UUID id, Long userId);
    
    List<ChatSession> findByUser_Id(Long userId);
    
    Optional<ChatSession> findByCaseEntity_Id(UUID caseId);
}
