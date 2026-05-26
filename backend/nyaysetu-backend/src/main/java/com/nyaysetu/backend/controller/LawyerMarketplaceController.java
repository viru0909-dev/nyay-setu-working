package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.LawyerProfileDTO;
import com.nyaysetu.backend.service.LawyerProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/lawyers")
@RequiredArgsConstructor
@Slf4j
public class LawyerMarketplaceController {
    private final LawyerProfileService lawyerProfileService;

    @GetMapping
    public ResponseEntity<?> getAllLawyers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<LawyerProfileDTO> lawyers = lawyerProfileService.getAllLawyers(pageable);
            return ResponseEntity.ok(lawyers);
        } catch (Exception e) {
            log.error("Error fetching lawyers", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch lawyers"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchLawyers(
            @RequestParam(required = false) String searchText,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<LawyerProfileDTO> lawyers = lawyerProfileService.searchLawyers(searchText, minRating, pageable);
            return ResponseEntity.ok(lawyers);
        } catch (Exception e) {
            log.error("Error searching lawyers", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Search failed"));
        }
    }

    @GetMapping("/{lawyerId}")
    public ResponseEntity<?> getLawyerDetails(@PathVariable Long lawyerId) {
        try {
            LawyerProfileDTO lawyer = lawyerProfileService.getLawyerById(lawyerId);
            return ResponseEntity.ok(lawyer);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching lawyer details", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch lawyer details"));
        }
    }
}
