package com.nyaysetu.aiservice.config;

import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OllamaConfig {

    @Bean
    public OllamaChatModel ollamaChatModel() {
        OllamaApi api = new OllamaApi("http://localhost:11434");
        return new OllamaChatModel(api);
    }
}