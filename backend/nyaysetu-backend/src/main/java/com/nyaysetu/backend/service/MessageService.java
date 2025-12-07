package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.SendMessageRequest;
import com.nyaysetu.backend.entity.CaseMessage;
import com.nyaysetu.backend.entity.LegalCase;
import com.nyaysetu.backend.exception.NotFoundException;
import com.nyaysetu.backend.repository.CaseMessageRepository;
import com.nyaysetu.backend.repository.LegalCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final LegalCaseRepository legalCaseRepository;
    private final CaseMessageRepository messageRepository;
    private final CaseTimelineService timelineService;

    public CaseMessage sendMessage(UUID caseId, SendMessageRequest dto) {

        LegalCase lc = legalCaseRepository.findById(caseId)
                .orElseThrow(() -> new NotFoundException("Case not found: " + caseId));

        CaseMessage msg = CaseMessage.builder()
                .legalCaseId(caseId)
                .senderId(dto.getSenderId())
                .message(dto.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        messageRepository.save(msg);

        timelineService.addEvent(caseId, "Message sent");

        return msg;
    }

    public List<CaseMessage> getMessages(UUID caseId) {
        return messageRepository.findByLegalCaseIdOrderByTimestampAsc(caseId);
    }
}