package com.nyaysetu.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class NyaySetuBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(NyaySetuBackendApplication.class, args);
    }
}
