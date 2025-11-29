package com.nyaysetu.aiservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiService {

    private final OllamaChatModel chatModel;

    public String summarize(String text) {
        return chatModel.call("Summarize this: " + text);
    }

    public String chat(String message) {
        return chatModel.call(message);
    }
}