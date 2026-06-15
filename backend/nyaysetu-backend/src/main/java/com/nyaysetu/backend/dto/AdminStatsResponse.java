package com.nyaysetu.backend.dto;

public record AdminStatsResponse(
        long totalCases,
        long totalUsers,
        long casesResolvedThisMonth
) {
}
