package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.CreateVerificationRequest;
import com.nyaysetu.backend.entity.VerificationRequest;
import com.nyaysetu.backend.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/verify")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService service;

    @PostMapping("/request")
    public ResponseEntity<VerificationRequest> createRequest(@RequestBody CreateVerificationRequest dto) {
        return ResponseEntity.ok(service.createRequest(dto));
    }

    @GetMapping("/admin/pending")
    public ResponseEntity<List<VerificationRequest>> getPending() {
        return ResponseEntity.ok(service.getPending());
    }

    @PostMapping("/admin/approve/{id}")
    public ResponseEntity<VerificationRequest> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(service.approve(id));
    }

    @PostMapping("/admin/reject/{id}")
    public ResponseEntity<VerificationRequest> reject(@PathVariable UUID id) {
        return ResponseEntity.ok(service.reject(id));
    }
}
