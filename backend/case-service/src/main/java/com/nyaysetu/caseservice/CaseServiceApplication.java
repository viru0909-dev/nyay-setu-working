package com.nyaysetu.caseservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class CaseServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CaseServiceApplication.class, args);
    }
}