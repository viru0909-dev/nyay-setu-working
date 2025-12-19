package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.HearingParticipant;
import com.nyaysetu.backend.entity.ParticipantRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HearingParticipantRepository extends JpaRepository<HearingParticipant, UUID> {
    
    List<HearingParticipant> findByHearingId(UUID hearingId);
    
    List<HearingParticipant> findByUserId(Long userId);
    
    Optional<HearingParticipant> findByHearingIdAndUserId(UUID hearingId, Long userId);
    
    List<HearingParticipant> findByHearingIdAndRole(UUID hearingId, ParticipantRole role);
    
    boolean existsByHearingIdAndUserId(UUID hearingId, Long userId);
}
