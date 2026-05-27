package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.SendMessageRequest;
import com.nyaysetu.backend.entity.CaseMessage;
import com.nyaysetu.backend.service.MessageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Case Messages", description = "Send and retrieve messages between parties in a case")
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