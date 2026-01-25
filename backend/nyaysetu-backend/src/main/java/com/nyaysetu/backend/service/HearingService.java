package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.repository.HearingParticipantRepository;
import com.nyaysetu.backend.repository.HearingRepository;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class HearingService {
    
    private final HearingRepository hearingRepository;
    private final HearingParticipantRepository participantRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;
    private final CaseTimelineService timelineService;
    
    @Transactional
    public Hearing scheduleHearing(UUID caseId, LocalDateTime scheduledDate, Integer durationMinutes) {
        log.info("Scheduling hearing for case: {}", caseId);
        
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found: " + caseId));
        
        String videoRoomId = generateVideoRoomId();
        
        Hearing hearing = Hearing.builder()
                .caseEntity(caseEntity)
                .scheduledDate(scheduledDate)
                .durationMinutes(durationMinutes != null ? durationMinutes : 60)
                .videoRoomId(videoRoomId)
                .status(HearingStatus.SCHEDULED)
                .build();
        
        // Update next hearing date on case
        caseEntity.setNextHearing(scheduledDate);
        caseRepository.save(caseEntity);
        
        Hearing savedHearing = hearingRepository.save(hearing);

        // Timeline Log
        try {
            timelineService.logHearingScheduled(caseId, scheduledDate);
        } catch (Exception e) {
            log.error("Failed to log timeline event", e);
        }

        return savedHearing;
    }
    
    @Transactional
    public HearingParticipant addParticipant(UUID hearingId, Long userId, ParticipantRole role) {
        Hearing hearing = hearingRepository.findById(hearingId)
                .orElseThrow(() -> new RuntimeException("Hearing not found"));
        
        if (participantRepository.existsByHearingIdAndUserId(hearingId, userId)) {
            throw new RuntimeException("User already added to hearing");
        }
        
        HearingParticipant participant = HearingParticipant.builder()
                .hearing(hearing)
                .user(User.builder().id(userId).build())
                .role(role)
                .canSpeak(true)
                .isVideoOn(true)
                .isAudioOn(true)
                .build();
        
        return participantRepository.save(participant);
    }
    
    @Transactional
    public void joinHearing(UUID hearingId, Long userId) {
        HearingParticipant participant = participantRepository
                .findByHearingIdAndUserId(hearingId, userId)
                .orElseThrow(() -> new RuntimeException("User not authorized for this hearing"));
        
        participant.setJoinedAt(LocalDateTime.now());
        participantRepository.save(participant);
        
        Hearing hearing = hearingRepository.findById(hearingId).orElseThrow();
        if (hearing.getStatus() == HearingStatus.SCHEDULED) {
            hearing.setStatus(HearingStatus.IN_PROGRESS);
            hearingRepository.save(hearing);
        }
    }
    
    @Transactional
    public void leaveHearing(UUID hearingId, Long userId) {
        HearingParticipant participant = participantRepository
                .findByHearingIdAndUserId(hearingId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        participant.setLeftAt(LocalDateTime.now());
        participantRepository.save(participant);
    }
    
    @Transactional
    public Hearing completeHearing(UUID hearingId, String judgeNotes) {
        Hearing hearing = hearingRepository.findById(hearingId)
                .orElseThrow(() -> new RuntimeException("Hearing not found"));
        
        hearing.setStatus(HearingStatus.COMPLETED);
        hearing.setJudgeNotes(judgeNotes);
        return hearingRepository.save(hearing);
    }
    
    public List<Hearing> getCaseHearings(UUID caseId) {
        return hearingRepository.findByCaseEntityId(caseId);
    }

    public List<Hearing> getHearingsForUser(String userEmail) {
        // Get user and their cases, then find hearings for those cases
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) {
            return java.util.Collections.emptyList();
        }
        
        List<CaseEntity> userCases = new java.util.ArrayList<>();
        
        if (user.getRole() == Role.LITIGANT) {
            userCases = caseRepository.findByClient(user);
        } else if (user.getRole() == Role.LAWYER) {
            userCases = caseRepository.findByLawyer(user);
        } else if (user.getRole() == Role.JUDGE) {
            userCases = caseRepository.findByAssignedJudge(user.getName());
        }
        
        if (userCases.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        
        return hearingRepository.findByCaseEntityInOrderByScheduledDateDesc(userCases);
    }
    
    public List<HearingParticipant> getHearingParticipants(UUID hearingId) {
        return participantRepository.findByHearingId(hearingId);
    }
    
    public Hearing getHearing(UUID hearingId) {
        return hearingRepository.findById(hearingId)
                .orElseThrow(() -> new RuntimeException("Hearing not found"));
    }
    
    private String generateVideoRoomId() {
        return "hearing-" + UUID.randomUUID().toString().substring(0, 12);
    }
    
    @Transactional
    public Hearing recordOutcome(UUID hearingId, com.nyaysetu.backend.dto.HearingOutcomeRequest request) {
        log.info("Recording outcome for hearing: {}", hearingId);
        
        Hearing hearing = hearingRepository.findById(hearingId)
                .orElseThrow(() -> new RuntimeException("Hearing not found"));
        
        CaseEntity caseEntity = hearing.getCaseEntity();
        
        // 1. Update Current Hearing
        hearing.setStatus(HearingStatus.COMPLETED);
        hearing.setJudgeNotes(request.getJudgeNotes());
        hearing.setOutcomeType(request.getOutcomeType());
        hearingRepository.save(hearing);
        
        // 2. Update Case Status/Stage
        if (request.getNextStage() != null) {
            caseEntity.setStage(request.getNextStage());
            
            // Auto-update status based on stage
            if (request.getNextStage() == CaseStage.VERDICT || request.getNextStage() == CaseStage.CLOSED) {
                caseEntity.setStatus(CaseStatus.CLOSED);
            } else if (caseEntity.getStatus() == CaseStatus.PENDING) {
                caseEntity.setStatus(CaseStatus.IN_PROGRESS);
            }
        }
        
        // 3. Schedule Next Hearing
        if (request.getNextHearingDate() != null) {
            scheduleHearing(caseEntity.getId(), request.getNextHearingDate(), 60);
        }
        
        caseRepository.save(caseEntity);
        
        // 4. Timeline Log
        try {
            String logMessage = String.format("Hearing held. Outcome: %s. Case moved to %s stage.", 
                request.getOutcomeType(), 
                request.getNextStage() != null ? request.getNextStage() : "current");
                
            if (request.getNextHearingDate() != null) {
                logMessage += " Next hearing: " + request.getNextHearingDate().toLocalDate();
            }
            
            timelineService.addEvent(caseEntity.getId(), "HEARING_OUTCOME", logMessage);
        } catch (Exception e) {
            log.error("Failed to log timeline event", e);
        }
        
        return hearing;
    }

    public boolean canUserJoinHearing(UUID hearingId, Long userId) {
        return participantRepository.existsByHearingIdAndUserId(hearingId, userId);
    }
}