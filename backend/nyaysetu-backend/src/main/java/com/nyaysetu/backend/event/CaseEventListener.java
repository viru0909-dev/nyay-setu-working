package com.nyaysetu.backend.event;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.CaseStatus; // Ensure this import matches your project structure
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CaseEventListener {

    @Async
    @EventListener
    public void handleCaseStatusChange(CaseStatusChangedEvent event) {
        CaseEntity caseEntity = event.getCaseEntity();
        
        log.info("Received real-time case status change event for Case ID: {}", caseEntity.getId());

        if (caseEntity.getStatus() != null && caseEntity.getStatus() == CaseStatus.REGISTERED) {
            
            log.info("Real-time synchronization workflow processed for case status: REGISTERED");
            sendRealTimeNotification(caseEntity);
        }
    }

    private void sendRealTimeNotification(CaseEntity caseEntity) {
        log.info("Action: Dispatching instant notification payload stream for case: {}", caseEntity.getTitle());
    }
}
