package com.nyaysetu.backend.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class CourtAnalyticsRepositoryTest {

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private HearingRepository hearingRepository;

    @Test
    @DisplayName("CaseRepository should load without errors")
    void caseRepository_shouldLoad() {
        assertThat(caseRepository).isNotNull();
    }

    @Test
    @DisplayName("HearingRepository should load without errors")
    void hearingRepository_shouldLoad() {
        assertThat(hearingRepository).isNotNull();
    }
}