package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.CreateCaseRequest;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.entity.LegalCase;
import com.nyaysetu.backend.exception.NotFoundException;
import com.nyaysetu.backend.repository.LegalCaseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.junit.jupiter.api.Assertions.*;

class CaseServiceTest {

    private LegalCaseRepository legalCaseRepository;
    private CaseTimelineService caseTimelineService;
    private CaseService caseService;

    @BeforeEach
    void setUp() {
        legalCaseRepository = Mockito.mock(LegalCaseRepository.class);
        caseTimelineService = Mockito.mock(CaseTimelineService.class);

        caseService = new CaseService(legalCaseRepository, caseTimelineService);
    }

    @Test
    void createCase_shouldSaveCaseAndAddTimelineEvent() {
        CreateCaseRequest caseRequest = new CreateCaseRequest();
        caseRequest.setTitle("Test Case");
        caseRequest.setDescription("Test Case Description");

        LegalCase savedCase = LegalCase.builder()
                .id(UUID.randomUUID())
                .title("Test Case")
                .description("Test Case Description")
                .status(CaseStatus.OPEN)
                .build();

        when(legalCaseRepository.save(any(LegalCase.class))).thenReturn(savedCase);

        LegalCase caseResult = caseService.createCase(caseRequest);

        assertNotNull(caseResult);
        assertEquals(CaseStatus.OPEN, caseResult.getStatus());

        verify(legalCaseRepository).save(any(LegalCase.class));
        verify(caseTimelineService).addEvent(caseResult.getId(), "Case created");
    }

    @Test
    void getCase_shouldReturnCase_whenExists() {
        UUID id = UUID.randomUUID();

        LegalCase legalCase = LegalCase.builder()
                .id(id)
                .title("Test Case")
                .build();

        when(legalCaseRepository.findById(id)).thenReturn(Optional.of(legalCase));

        LegalCase caseResult = caseService.getCase(id);

        assertEquals(id, caseResult.getId());
    }

    @Test
    void getCase_shouldReturnException_whenNotFound() {
        UUID id = UUID.randomUUID();

        when(legalCaseRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> caseService.getCase(id));
    }

    @Test
    void updateCase_shouldReturnPaginationCases() {
        LegalCase legalCase = LegalCase.builder()
                .id(UUID.randomUUID())
                .title("Test Case")
                .build();

        Page<LegalCase> page = new PageImpl<>(List.of(legalCase));
        when(legalCaseRepository.findAll(PageRequest.of(0, 10))).thenReturn(page);

        Page<LegalCase> caseResult = caseService.getAllCases(0, 10);

        assertEquals(1, caseResult.getTotalElements());
        assertEquals("Test Case", caseResult.getContent().get(0).getTitle());
    }

    @Test
    void updateStatus_shouldUpdateCaseAndAddTimelineEvent() {
        UUID id = UUID.randomUUID();
        LegalCase legalCase = LegalCase.builder()
                .id(id)
                .title("Test Case")
                .status(CaseStatus.OPEN)
                .build();

        when(legalCaseRepository.findById(id)).thenReturn(Optional.of(legalCase));
        when(legalCaseRepository.save(any(LegalCase.class))).thenReturn(legalCase);

        LegalCase caseResult = caseService.updateStatus(id, CaseStatus.CLOSED);

        assertEquals(CaseStatus.CLOSED, caseResult.getStatus());

        verify(caseTimelineService).addEvent(id, "Case status updated to " + CaseStatus.CLOSED);
    }
}