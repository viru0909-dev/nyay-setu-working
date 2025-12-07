package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.ChatRequest;
import com.nyaysetu.backend.dto.ChatResponse;
import com.nyaysetu.backend.dto.SummarizeRequest;
import com.nyaysetu.backend.dto.SummarizeResponse;
import com.nyaysetu.backend.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/summarize")
    public SummarizeResponse summarize(@RequestBody SummarizeRequest request) {
        String result = aiService.summarize(request.getText());
        return new SummarizeResponse(result);
    }

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        String result = aiService.chat(request.getMessage());
        return new ChatResponse(result);
    }
}