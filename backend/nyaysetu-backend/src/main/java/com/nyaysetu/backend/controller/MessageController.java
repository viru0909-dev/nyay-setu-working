package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.SendMessageRequest;
import com.nyaysetu.backend.entity.CaseMessage;
import com.nyaysetu.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cases/{caseId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public CaseMessage sendMessage(
            @PathVariable UUID caseId,
            @RequestBody SendMessageRequest request
    ) {
        return messageService.sendMessage(caseId, request);
    }

    @GetMapping
    public List<CaseMessage> getMessages(@PathVariable UUID caseId) {
        return messageService.getMessages(caseId);
    }
}