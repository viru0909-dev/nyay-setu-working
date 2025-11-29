package com.nyaysetu.aiservice.service;

import com.nyaysetu.aiservice.dto.ChatRequest;
import com.nyaysetu.aiservice.dto.ChatResponse;
import com.nyaysetu.aiservice.dto.SummarizeRequest;
import com.nyaysetu.aiservice.dto.SummarizeResponse;
import org.springframework.ai.ollama.OllamaChatClient;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiService {

    private final OllamaChatClient chatClient;

    public SummarizeResponse summarize(SummarizeRequest request) {

        String prompt = "Summarize this legal text:\n\n" + request.getText();
        String result = chatClient.call(prompt);

        return SummarizeResponse.builder()
                .summary(result)
                .build();
    }

    public ChatResponse chat(ChatRequest request) {

        String reply = chatClient.call(request.getMessage());

        return ChatResponse.builder()
                .reply(reply)
                .build();
    }
}