package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.DlqStatsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.core.QueueInformation;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class DlqMonitoringService {

    private final RabbitAdmin rabbitAdmin;
    private static final String DLQ_QUEUE_NAME = "court-media-dlq";

    /**
     * Inspects the Dead Letter Queue (DLQ) to monitor message counts.
     * 
     * @return DlqStatsResponse containing queue stats or a default safe response on failure.
     */
    public DlqStatsResponse getDlqStats() {
        try {
            QueueInformation queueInfo = rabbitAdmin.getQueueInfo(DLQ_QUEUE_NAME);
            
            long messageCount = 0L;
            boolean hasFailures = false;
            
            if (queueInfo != null) {
                messageCount = queueInfo.getMessageCount();
                hasFailures = messageCount > 0;
            } else {
                log.warn("Queue '{}' not found or returned null info.", DLQ_QUEUE_NAME);
            }

            return DlqStatsResponse.builder()
                    .queueName(DLQ_QUEUE_NAME)
                    .messageCount(messageCount)
                    .hasFailures(hasFailures)
                    .timestamp(LocalDateTime.now())
                    .build();

        } catch (AmqpException e) {
            log.error("AMQP Exception occurred while fetching stats for queue: {}. Error: {}", DLQ_QUEUE_NAME, e.getMessage(), e);
            // Return safe default instead of crashing thread
            return DlqStatsResponse.builder()
                    .queueName(DLQ_QUEUE_NAME)
                    .messageCount(-1L)
                    .hasFailures(null) // Indeterminate state due to error
                    .timestamp(LocalDateTime.now())
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error occurred while fetching stats for queue: {}. Error: {}", DLQ_QUEUE_NAME, e.getMessage(), e);
            return DlqStatsResponse.builder()
                    .queueName(DLQ_QUEUE_NAME)
                    .messageCount(-1L)
                    .hasFailures(null)
                    .timestamp(LocalDateTime.now())
                    .build();
        }
    }
}
