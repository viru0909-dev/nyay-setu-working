package com.nyaysetu.aiservice.controller;

import com.nyaysetu.aiservice.dto.ChatRequest;
import com.nyaysetu.aiservice.dto.ChatResponse;
import com.nyaysetu.aiservice.dto.SummarizeRequest;
import com.nyaysetu.aiservice.dto.SummarizeResponse;
import com.nyaysetu.aiservice.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/summarize")
    public SummarizeResponse summarize(@RequestBody SummarizeRequest request) {
        return aiService.summarize(request);
    }

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        return aiService.chat(request);
    }
}