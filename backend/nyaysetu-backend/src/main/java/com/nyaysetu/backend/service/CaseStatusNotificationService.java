package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.handler.NotificationWebSocketHandler;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CaseStatusNotificationService {

    private final NotificationWebSocketHandler webSocketHandler;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;

    @Transactional
    public void notifyCaseStatusChange(UUID caseId, CaseStatus oldStatus, CaseStatus newStatus) {
        try {
            CaseEntity caseEntity = caseRepository.findById(caseId).orElse(null);
            if (caseEntity == null) {
                log.warn("Case {} not found for status notification", caseId);
                return;
            }

            String message = getStatusMessage(newStatus);

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "CASE_STATUS_UPDATE");
            notification.put("caseId", caseId.toString());
            notification.put("caseNumber", caseId.toString());
            notification.put("oldStatus", oldStatus != null ? oldStatus.name() : null);
            notification.put("newStatus", newStatus.name());
            notification.put("message", message);
            notification.put("title", "Case Status Updated");
            notification.put("timestamp", java.time.Instant.now().toString());

            Set<Long> userIds = userRepository.findUserIdsByCaseId(caseId);
            
            for (Long userId : userIds) {
                webSocketHandler.sendNotification(userId, notification);
                log.debug("Sent notification to user {} for case {}", userId, caseId);
            }
        } catch (Exception e) {
            log.error("Failed to send notification for case {}: {}", caseId, e.getMessage());
        }
    }

    private String getStatusMessage(CaseStatus status) {
        switch (status) {
            case PENDING_COGNIZANCE: return "Case pending judicial cognizance";
            case IN_ADMISSION: return "Case admitted to court";
            case SUMMONS_SERVED: return "Summons have been served";
            case TRIAL_READY: return "Case ready for trial";
            case JUDGMENT_PENDING: return "Judgment pending";
            case COMPLETED: return "Case completed";
            case CLOSED: return "Case closed";
            default: return "Case status updated to: " + status.name().replace("_", " ").toLowerCase();
        }
    }
}
