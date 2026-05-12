package com.nyaysetu.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nyaysetu.backend.entity.CaseEvent;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.repository.CaseEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service for managing case events (audit trail).
 * Single Source of Truth for all case actions and state transitions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CaseEventService {

    private final CaseEventRepository caseEventRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    // Event Types
    public static final String EVENT_POLICE_SUBMIT = "POLICE_SUBMIT";
    public static final String EVENT_LAWYER_DRAFT_SAVE = "LAWYER_DRAFT_SAVE";
    public static final String EVENT_LITIGANT_APPROVE = "LITIGANT_APPROVE";
    public static final String EVENT_LITIGANT_REJECT = "LITIGANT_REJECT";
    public static final String EVENT_JUDGE_COGNIZANCE = "JUDGE_COGNIZANCE";
    public static final String EVENT_EVIDENCE_UPLOADED = "EVIDENCE_UPLOADED";
    public static final String EVENT_BSA_VALIDATED = "BSA_VALIDATED";
    public static final String EVENT_BSA_FAILED = "BSA_FAILED";
    public static final String EVENT_SUMMONS_ISSUED = "SUMMONS_ISSUED";
    public static final String EVENT_SUMMONS_SERVED = "SUMMONS_SERVED";
    public static final String EVENT_HEARING_SCHEDULED = "HEARING_SCHEDULED";
    public static final String EVENT_STATUS_CHANGE = "STATUS_CHANGE";
    public static final String EVENT_STAGE_CHANGE = "STAGE_CHANGE";
    public static final String EVENT_CASE_CREATED = "CASE_CREATED";
    public static final String EVENT_DOCUMENT_ANALYZED = "DOCUMENT_ANALYZED";

    // Actor Roles
    public static final String ROLE_POLICE = "POLICE";
    public static final String ROLE_LAWYER = "LAWYER";
    public static final String ROLE_LITIGANT = "LITIGANT";
    public static final String ROLE_JUDGE = "JUDGE";
    public static final String ROLE_SYSTEM = "SYSTEM";

    /**
     * Log a case event with full details.
     */
    @Transactional
    public CaseEvent logEvent(
            UUID caseId,
            String eventType,
            String actorId,
            String actorRole,
            String actorName,
            Map<String, Object> eventData,
            CaseStatus previousStatus,
            CaseStatus newStatus,
            String summary
    ) {
        String eventDataJson = null;
        try {
            if (eventData != null) {
                eventDataJson = objectMapper.writeValueAsString(eventData);
            }
        } catch (Exception e) {
            log.error("Failed to serialize event data", e);
            eventDataJson = "{}";
        }

        CaseEvent event = CaseEvent.builder()
                .caseId(caseId)
                .eventType(eventType)
                .actorId(actorId)
                .actorRole(actorRole)
                .actorName(actorName)
                .eventDataJson(eventDataJson)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .summary(summary)
                .timestamp(LocalDateTime.now())
                .build();

        event = caseEventRepository.save(event);

        // Broadcast to relevant WebSocket channels
        broadcastEvent(event);

        log.info("Logged case event: {} for case {} by {} ({})", 
                eventType, caseId, actorName, actorRole);

        return event;
    }

    /**
     * Log a simple event without status change.
     */
    @Transactional
    public CaseEvent logSimpleEvent(
            UUID caseId,
            String eventType,
            String actorId,
            String actorRole,
            String actorName,
            String summary
    ) {
        return logEvent(caseId, eventType, actorId, actorRole, actorName, 
                null, null, null, summary);
    }

    /**
     * Log a status change event.
     */
    @Transactional
    public CaseEvent logStatusChange(
            UUID caseId,
            String actorId,
            String actorRole,
            String actorName,
            CaseStatus previousStatus,
            CaseStatus newStatus,
            String reason
    ) {
        Map<String, Object> eventData = Map.of(
                "previousStatus", previousStatus != null ? previousStatus.name() : "null",
                "newStatus", newStatus.name(),
                "reason", reason != null ? reason : ""
        );

        String summary = String.format("Status changed from %s to %s", 
                previousStatus != null ? previousStatus.name() : "NEW", 
                newStatus.name());

        return logEvent(caseId, EVENT_STATUS_CHANGE, actorId, actorRole, actorName,
                eventData, previousStatus, newStatus, summary);
    }

    /**
     * Log a stage change event (Judge's 7-step process).
     */
    @Transactional
    public CaseEvent logStageChange(
            UUID caseId,
            String judgeId,
            String judgeName,
            Integer previousStage,
            Integer newStage,
            String stageName
    ) {
        Map<String, Object> eventData = Map.of(
                "previousStage", previousStage != null ? previousStage : 0,
                "newStage", newStage,
                "stageName", stageName
        );

        String summary = String.format("Judge advanced case to Stage %d: %s", newStage, stageName);

        CaseEvent event = CaseEvent.builder()
                .caseId(caseId)
                .eventType(EVENT_STAGE_CHANGE)
                .actorId(judgeId)
                .actorRole(ROLE_JUDGE)
                .actorName(judgeName)
                .eventDataJson(serializeEventData(eventData))
                .previousStage(previousStage)
                .newStage(newStage)
                .summary(summary)
                .timestamp(LocalDateTime.now())
                .build();

        event = caseEventRepository.save(event);
        broadcastEvent(event);

        return event;
    }

    /**
     * Get timeline events for a case (for frontend Timeline component).
     */
    public List<CaseEvent> getTimelineForCase(UUID caseId) {
        return caseEventRepository.findByCaseIdOrderByTimestampAsc(caseId);
    }

    /**
     * Get recent events for a case (newest first).
     */
    public List<CaseEvent> getRecentEventsForCase(UUID caseId) {
        return caseEventRepository.findByCaseIdOrderByTimestampDesc(caseId);
    }

    /**
     * Get events for Judge's dashboard.
     */
    public List<CaseEvent> getEventsForJudge(Long judgeId) {
        return caseEventRepository.findEventsForJudge(judgeId);
    }

    /**
     * Broadcast event to relevant WebSocket channels.
     */
    private void broadcastEvent(CaseEvent event) {
        try {
            // Broadcast to case-specific channel
            messagingTemplate.convertAndSend(
                    "/topic/case/" + event.getCaseId() + "/events",
                    event
            );

            // Broadcast status changes to status channel
            if (EVENT_STATUS_CHANGE.equals(event.getEventType())) {
                messagingTemplate.convertAndSend(
                        "/topic/case/" + event.getCaseId() + "/status",
                        Map.of(
                                "caseId", event.getCaseId(),
                                "previousStatus", event.getPreviousStatus(),
                                "newStatus", event.getNewStatus(),
                                "timestamp", event.getTimestamp()
                        )
                );
            }

            // Broadcast stage changes for real-time stepper updates
            if (EVENT_STAGE_CHANGE.equals(event.getEventType())) {
                messagingTemplate.convertAndSend(
                        "/topic/case/" + event.getCaseId() + "/stage",
                        Map.of(
                                "caseId", event.getCaseId(),
                                "previousStage", event.getPreviousStage(),
                                "newStage", event.getNewStage(),
                                "timestamp", event.getTimestamp()
                        )
                );
            }

            // Broadcast police submissions to judge pool
            if (EVENT_POLICE_SUBMIT.equals(event.getEventType())) {
                messagingTemplate.convertAndSend(
                        "/topic/judge/unassigned",
                        Map.of(
                                "caseId", event.getCaseId(),
                                "summary", event.getSummary(),
                                "timestamp", event.getTimestamp()
                        )
                );
            }

        } catch (Exception e) {
            log.error("Failed to broadcast event", e);
        }
    }

    private String serializeEventData(Map<String, Object> eventData) {
        try {
            return objectMapper.writeValueAsString(eventData);
        } catch (Exception e) {
            return "{}";
        }
    }
}
