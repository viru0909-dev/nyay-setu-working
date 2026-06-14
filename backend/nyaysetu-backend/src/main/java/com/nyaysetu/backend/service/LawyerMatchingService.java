package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.LawyerMatchDTO;
import com.nyaysetu.backend.entity.CaseAssignmentRecord;
import com.nyaysetu.backend.entity.LawyerProfile;
import com.nyaysetu.backend.repository.CaseAssignmentRecordRepository;
import com.nyaysetu.backend.repository.LawyerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LawyerMatchingService {

    private final LawyerProfileRepository lawyerProfileRepository;
    private final CaseAssignmentRecordRepository caseAssignmentRecordRepository;

    private static final int MAX_EXPERIENCE_YEARS = 20;
    private static final int MAX_ACTIVE_CASES = 10;
    private static final double MAX_RATING = 5.0;

    /**
     * Returns top-10 matched lawyers for a case based on required expertise tags.
     * Scoring: expertise(45%) + rating(25%) + experience(15%) + workload(15%)
     */
    public List<LawyerMatchDTO> getTopMatches(UUID caseId, List<String> requiredTags) {
        List<LawyerProfile> allAvailable = lawyerProfileRepository.findByAvailableTrue();

        List<LawyerMatchDTO> ranked = allAvailable.stream()
                .map(lawyer -> {
                    double score = calculateScore(lawyer, requiredTags);
                    return LawyerMatchDTO.builder()
                            .lawyerProfileId(lawyer.getId())
                            .userId(lawyer.getUser().getId())
                            .name(lawyer.getUser().getName())
                            .email(lawyer.getUser().getEmail())
                            .barCouncilNumber(lawyer.getBarCouncilNumber())
                            .expertiseTags(lawyer.getExpertiseTags())
                            .city(lawyer.getCity())
                            .rating(lawyer.getRating())
                            .experienceYears(lawyer.getExperienceYears())
                            .activeCaseCount(lawyer.getActiveCaseCount())
                            .matchScore(Math.round(score * 10000.0) / 100.0) // percentage, 2 decimals
                            .build();
                })
                .sorted(Comparator.comparingDouble(LawyerMatchDTO::getMatchScore).reversed())
                .limit(10)
                .collect(Collectors.toList());

        // Persist match records for audit
        ranked.forEach(match -> {
            LawyerProfile profile = lawyerProfileRepository.findById(match.getLawyerProfileId()).orElseThrow();
            CaseAssignmentRecord record = CaseAssignmentRecord.builder()
                    .caseId(caseId)
                    .lawyerProfile(profile)
                    .matchScore(match.getMatchScore())
                    .build();
            caseAssignmentRecordRepository.save(record);
        });

        log.info("Top {} matches found for case {}", ranked.size(), caseId);
        return ranked;
    }

    private double calculateScore(LawyerProfile lawyer, List<String> requiredTags) {
        // Expertise overlap (45%)
        double expertiseScore = 0.0;
        if (requiredTags != null && !requiredTags.isEmpty() &&
                lawyer.getExpertiseTags() != null && !lawyer.getExpertiseTags().isEmpty()) {
            long matched = lawyer.getExpertiseTags().stream()
                    .map(String::toLowerCase)
                    .filter(tag -> requiredTags.stream()
                            .map(String::toLowerCase)
                            .anyMatch(tag::equals))
                    .count();
            expertiseScore = (double) matched / requiredTags.size();
        }

        // Rating (25%)
        double ratingScore = lawyer.getRating() / MAX_RATING;

        // Experience (15%)
        double expScore = Math.min(lawyer.getExperienceYears(), MAX_EXPERIENCE_YEARS)
                / (double) MAX_EXPERIENCE_YEARS;

        // Workload penalty (15%) — fewer active cases = better
        double workloadScore = 1.0 - Math.min(lawyer.getActiveCaseCount(), MAX_ACTIVE_CASES)
                / (double) MAX_ACTIVE_CASES;

        return (expertiseScore * 0.45) + (ratingScore * 0.25)
                + (expScore * 0.15) + (workloadScore * 0.15);
    }
    public List<LawyerMatchDTO> getDirectory(String city, String expertise) {
        List<LawyerProfile> profiles = (city != null && !city.isBlank())
                ? lawyerProfileRepository.findByCityIgnoreCase(city)
                : lawyerProfileRepository.findAll();

        return profiles.stream()
                .filter(lp -> expertise == null || expertise.isBlank() ||
                        (lp.getExpertiseTags() != null && lp.getExpertiseTags().stream()
                                .anyMatch(t -> t.equalsIgnoreCase(expertise))))
                .map(lp -> LawyerMatchDTO.builder()
                        .lawyerProfileId(lp.getId())
                        .userId(lp.getUser().getId())
                        .name(lp.getUser().getName())
                        .email(lp.getUser().getEmail())
                        .barCouncilNumber(lp.getBarCouncilNumber())
                        .expertiseTags(lp.getExpertiseTags())
                        .city(lp.getCity())
                        .rating(lp.getRating())
                        .experienceYears(lp.getExperienceYears())
                        .activeCaseCount(lp.getActiveCaseCount())
                        .matchScore(null)
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }
}