package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.CaseNotificationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CaseNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyUser(String caseId, String caseTitle, String status,
                           String message, String role, Long userId) {
        CaseNotificationDTO notification = new CaseNotificationDTO(
            caseId, caseTitle, status, message, role, userId, LocalDateTime.now()
        );
        String topic = "/topic/" + role.toLowerCase() + "/" + userId;
        messagingTemplate.convertAndSend(topic, notification);
    }

    public void notifyAllRoles(String caseId, String caseTitle, String status,
                                String message,
                                Long litigantId, Long lawyerId, Long judgeId) {
        if (litigantId != null)
            notifyUser(caseId, caseTitle, status, message, "litigant", litigantId);
        if (lawyerId != null)
            notifyUser(caseId, caseTitle, status, message, "lawyer", lawyerId);
        if (judgeId != null)
            notifyUser(caseId, caseTitle, status, message, "judge", judgeId);
    }
}
