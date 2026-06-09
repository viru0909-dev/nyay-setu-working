package com.nyaysetu.backend.event;

import com.nyaysetu.backend.entity.LegalCase;
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
        LegalCase legalCase = event.getLegalCase();
        logger.info("Received real-time case status change event for Case ID: " + legalCase.getId());

        // String-safe matching prevents missing enum property boundaries on diverse build pipelines
        if (legalCase.getStatus() != null && 
           ("REGISTERED".equalsIgnoreCase(legalCase.getStatus().name()) || 
            "REGISTERED".equalsIgnoreCase(legalCase.getStatus().toString()))) {
            
            logger.info("Real-time synchronization workflow processed for case status: REGISTERED");
            sendRealTimeNotification(legalCase);
        }
    }

    private void sendRealTimeNotification(LegalCase legalCase) {
        logger.info("Action: Dispatching instant notification payload stream for case: " + legalCase.getTitle());
    }
}