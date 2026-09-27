package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.LawyerAvailability;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.LawyerAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LawyerAvailabilityService {

    private final LawyerAvailabilityRepository repository;

    @Transactional
    public LawyerAvailability setAvailability(User lawyer, LocalDate date, Boolean isAvailable, String reason) {
        Optional<LawyerAvailability> existing = repository.findByLawyerIdAndDate(lawyer.getId(), date);
        LawyerAvailability availability;
        if (existing.isPresent()) {
            availability = existing.get();
            availability.setIsAvailable(isAvailable);
            availability.setReason(reason);
        } else {
            availability = LawyerAvailability.builder()
                    .lawyer(lawyer)
                    .date(date)
                    .isAvailable(isAvailable != null ? isAvailable : false)
                    .reason(reason != null ? reason : "Unavailable")
                    .build();
        }
        LawyerAvailability saved = repository.save(availability);
        log.info("Set availability for lawyer {} on {}: isAvailable={}, reason={}", 
                lawyer.getEmail(), date, isAvailable, reason);
        return saved;
    }

    public List<Map<String, Object>> getAvailability(Long lawyerId, String monthStr) {
        LocalDate startDate;
        LocalDate endDate;
        if (monthStr != null && monthStr.matches("\\d{4}-\\d{2}")) {
            YearMonth ym = YearMonth.parse(monthStr, DateTimeFormatter.ofPattern("yyyy-MM"));
            startDate = ym.atDay(1);
            endDate = ym.atEndOfMonth();
        } else {
            startDate = LocalDate.now().withDayOfMonth(1);
            endDate = startDate.plusMonths(3).withDayOfMonth(1).minusDays(1);
        }

        List<LawyerAvailability> records = repository.findByLawyerIdAndDateBetween(lawyerId, startDate, endDate);
        return records.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("date", r.getDate().toString());
            map.put("isAvailable", r.getIsAvailable());
            map.put("reason", r.getReason());
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteAvailability(Long id, User lawyer) {
        LawyerAvailability availability = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Availability entry not found"));
        if (!availability.getLawyer().getId().equals(lawyer.getId())) {
            throw new RuntimeException("Unauthorized to delete this availability record");
        }
        repository.delete(availability);
        log.info("Deleted availability record {} for lawyer {}", id, lawyer.getEmail());
    }

    public Map<String, Object> checkConflict(Long lawyerId, LocalDate date) {
        Map<String, Object> result = new HashMap<>();
        result.put("lawyerId", lawyerId);
        result.put("date", date.toString());

        if (lawyerId == null) {
            result.put("hasConflict", false);
            result.put("reason", null);
            return result;
        }

        Optional<LawyerAvailability> record = repository.findByLawyerIdAndDate(lawyerId, date);
        if (record.isPresent() && Boolean.FALSE.equals(record.get().getIsAvailable())) {
            result.put("hasConflict", true);
            result.put("reason", record.get().getReason() != null ? record.get().getReason() : "Marked Unavailable");
        } else {
            result.put("hasConflict", false);
            result.put("reason", null);
        }
        return result;
    }
}
