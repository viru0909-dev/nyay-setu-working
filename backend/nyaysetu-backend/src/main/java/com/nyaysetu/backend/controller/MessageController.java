package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.SendMessageRequest;
import com.nyaysetu.backend.entity.CaseMessage;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.CaseAccessService;
import com.nyaysetu.backend.service.MessageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Case Messages", description = "Send and retrieve messages between parties in a case")
@RestController
@RequestMapping("/cases/{caseId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final AuthService authService;
    private final CaseAccessService caseAccessService;

    @PostMapping
    public CaseMessage sendMessage(
            @PathVariable UUID caseId,
            @Valid @RequestBody SendMessageRequest request,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(caseId, user);
        return messageService.sendMessage(caseId, user.getId(), request);
    }

    @GetMapping
    public List<CaseMessage> getMessages(@PathVariable UUID caseId) {
        return messageService.getMessages(caseId);
    }
}