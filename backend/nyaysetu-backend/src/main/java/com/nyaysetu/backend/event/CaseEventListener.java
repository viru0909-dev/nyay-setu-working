package com.nyaysetu.backend.event;

import com.nyaysetu.backend.entity.CaseEntity;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.logging.Logger;

@Component
public class CaseEventListener {

    private static final Logger logger = Logger.getLogger(CaseEventListener.class.getName());

    @Async
    @EventListener
    public void handleCaseStatusChange(CaseStatusChangedEvent event) {
        CaseEntity CaseEntity = event.getCaseEntity();
        logger.info("Received real-time case status change event for Case ID: " + CaseEntity.getId());

        // String-safe matching prevents missing enum property boundaries on diverse build pipelines
        if (CaseEntity.getStatus() != null && 
           ("REGISTERED".equalsIgnoreCase(CaseEntity.getStatus().name()) || 
            "REGISTERED".equalsIgnoreCase(CaseEntity.getStatus().toString()))) {
            
            logger.info("Real-time synchronization workflow processed for case status: REGISTERED");
            sendRealTimeNotification(CaseEntity);
        }
    }

    private void sendRealTimeNotification(CaseEntity CaseEntity) {
        logger.info("Action: Dispatching instant notification payload stream for case: " + CaseEntity.getTitle());
    }
}