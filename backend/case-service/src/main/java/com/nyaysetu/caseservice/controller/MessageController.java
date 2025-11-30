package com.nyaysetu.caseservice.controller;

import com.nyaysetu.caseservice.dto.SendMessageRequest;
import com.nyaysetu.caseservice.entity.CaseMessage;
import com.nyaysetu.caseservice.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/cases/{caseId}/messages")
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