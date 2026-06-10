package com.nyaysetu.backend;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@Slf4j
public class NyaySetuBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(NyaySetuBackendApplication.class, args);
        log.info("NyaySetu backend started successfully");
    }
}
