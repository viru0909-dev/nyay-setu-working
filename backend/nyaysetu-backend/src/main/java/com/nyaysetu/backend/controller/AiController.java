package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.*;
import com.nyaysetu.backend.service.AiService;
import com.nyaysetu.backend.service.OllamaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;


@Tag(name = "AI Services", description = "Text summarization and AI chat via Groq and Ollama")
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final OllamaService ollamaService;

    @PostMapping("/summarize")
    public SummarizeResponse summarize(@Valid @RequestBody SummarizeRequest request) {
        String result = aiService.summarize(request.getText());
        return new SummarizeResponse(result);
    }

    @PostMapping("/chat")
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        String result = aiService.chat(request.getMessage());
        return new ChatResponse(result);
    }

    // NEW: Ollama Chat Endpoint
    @PostMapping("/chat/ollama")
    public OllamaChatResponse chatWithOllama(@RequestBody OllamaChatRequest request) {
        String model = request.getModel();
        
        if (model != null && !model.isEmpty()) {
            return ollamaService.chat(request.getMessage(), model);
        } else {
            return ollamaService.chat(request.getMessage());
        }
    }

    // Constitution Q&A with Ollama
    @PostMapping("/constitution/qa")
    public OllamaChatResponse constitutionQA(@RequestBody OllamaChatRequest request) {
        String articleText = request.getContext() != null ? request.getContext() : "";
        return ollamaService.constitutionQA(request.getMessage(), articleText);
    }

    // Check Ollama status
    @GetMapping("/ollama/status")
    public String checkOllamaStatus() {
        boolean available = ollamaService.isOllamaAvailable();
        return available ? "Ollama is running" : "Ollama is not available";
    }

    // Get available models
    @GetMapping("/ollama/models")
    public String[] getAvailableModels() {
        return ollamaService.getAvailableModels();
    }
}