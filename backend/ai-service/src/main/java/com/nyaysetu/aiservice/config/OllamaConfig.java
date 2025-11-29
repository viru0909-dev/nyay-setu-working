package com.nyaysetu.aiservice.config;

import org.springframework.ai.ollama.OllamaChatClient;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OllamaConfig {

    @Bean
    public OllamaApi ollamaApi() {
        return new OllamaApi("http://localhost:11434"); // default Ollama endpoint
    }

    @Bean
    public OllamaChatClient chatClient(OllamaApi api) {
        return new OllamaChatClient(api);
    }
}