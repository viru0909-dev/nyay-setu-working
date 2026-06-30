package com.nyaysetu.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Spring Configuration to enable background task processing.
 * Configures an isolated, custom background thread pool specifically for AI tasks
 * to prevent HTTP thread pool exhaustion and database connection starvation.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Custom ThreadPoolTaskExecutor tuned specifically to isolate heavy inter-service
     * AI document analysis payloads from the main Tomcat worker threads.
     */
    @Bean(name = "aiTaskExecutor")
    public Executor aiTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10); // Standard background concurrent workers
        executor.setMaxPoolSize(25);  // Burst cap capacity parameter
        executor.setQueueCapacity(500); // Backlog queue size boundary
        executor.setThreadNamePrefix("AI-Worker-");
        executor.initialize();
        return executor;
    }
}

