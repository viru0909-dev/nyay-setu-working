package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.SendMessageRequest;
import com.nyaysetu.backend.entity.CaseMessage;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.exception.NotFoundException;
import com.nyaysetu.backend.repository.CaseMessageRepository;
import com.nyaysetu.backend.repository.CaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final CaseRepository caseRepository;
    private final CaseMessageRepository messageRepository;
    private final CaseTimelineService timelineService;

    public CaseMessage sendMessage(UUID caseId, SendMessageRequest dto) {

        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new NotFoundException("Case not found: " + caseId));

        CaseMessage msg = CaseMessage.builder()
                .legalCaseId(caseId)
                .senderId(dto.getSenderId())
                .message(dto.getMessage())
                .type(dto.getType() != null ? dto.getType() : "TEXT")
                .attachmentUrl(dto.getAttachmentUrl())
                .timestamp(LocalDateTime.now())
                .build();

        messageRepository.save(msg);

        timelineService.addEvent(caseId, "Message sent");

        // Update case timestamp so it bubbles up in chat list
        caseEntity.setUpdatedAt(LocalDateTime.now());
        caseRepository.save(caseEntity);

        return msg;
    }

    public List<CaseMessage> getMessages(UUID caseId) {
        return messageRepository.findByLegalCaseIdOrderByTimestampAsc(caseId);
    }
}