package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.AdminStatsResponse;
import com.nyaysetu.backend.service.AdminStatsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Tag(name = "Admin Dashboard", description = "Admin dashboard statistics")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_JUDGE', 'TECH_ADMIN')")
@Controller
@ResponseBody
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminStatsService.getStats());
    }
}
