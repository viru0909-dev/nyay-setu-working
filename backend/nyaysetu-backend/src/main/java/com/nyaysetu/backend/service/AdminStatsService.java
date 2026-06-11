package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.AdminStatsResponse;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private static final List<CaseStatus> RESOLVED_STATUSES =
            List.of(CaseStatus.COMPLETED, CaseStatus.CLOSED);

    private final CaseRepository caseRepository;
    private final UserRepository userRepository;

    public AdminStatsResponse getStats() {
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime nextMonthStart = monthStart.plusMonths(1);

        long totalCases = caseRepository.count();
        long totalUsers = userRepository.count();
        long casesResolvedThisMonth =
                caseRepository.countByStatusInAndUpdatedAtGreaterThanEqualAndUpdatedAtLessThan(
                        RESOLVED_STATUSES,
                        monthStart,
                        nextMonthStart);

        return new AdminStatsResponse(totalCases, totalUsers, casesResolvedThisMonth);
    }
}
