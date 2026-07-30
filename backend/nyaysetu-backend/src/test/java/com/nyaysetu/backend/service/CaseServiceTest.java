package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.CreateCaseRequest;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.exception.NotFoundException;
import com.nyaysetu.backend.repository.CaseRepository;
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

/**
 * Unit tests for {@link CaseService}.
 *
 * <p>These were committed against entity names that had already been renamed
 * (LegalCase -> CaseEntity, LegalCaseRepository -> CaseRepository), so the test
 * sources never compiled and the whole module's tests could not run. The
 * assertions are unchanged; only the type names are corrected.
 */
class CaseServiceTest {

    private CaseRepository caseRepository;
    private CaseTimelineService caseTimelineService;
    private CaseService caseService;

    @BeforeEach
    void setUp() {
        caseRepository = Mockito.mock(CaseRepository.class);
        caseTimelineService = Mockito.mock(CaseTimelineService.class);

        caseService = new CaseService(caseRepository, caseTimelineService);
    }

    @Test
    void createCase_shouldSaveCaseAndAddTimelineEvent() {
        CreateCaseRequest caseRequest = new CreateCaseRequest();
        caseRequest.setTitle("Test Case");
        caseRequest.setDescription("Test Case Description");

        CaseEntity savedCase = CaseEntity.builder()
                .id(UUID.randomUUID())
                .title("Test Case")
                .description("Test Case Description")
                .status(CaseStatus.OPEN)
                .build();

        when(caseRepository.save(any(CaseEntity.class))).thenReturn(savedCase);

        CaseEntity caseResult = caseService.createCase(caseRequest);

        assertNotNull(caseResult);
        assertEquals(CaseStatus.OPEN, caseResult.getStatus());

        verify(caseRepository).save(any(CaseEntity.class));
        verify(caseTimelineService).addEvent(caseResult.getId(), "Case created");
    }

    @Test
    void getCase_shouldReturnCase_whenExists() {
        UUID id = UUID.randomUUID();

        CaseEntity caseEntity = CaseEntity.builder()
                .id(id)
                .title("Test Case")
                .build();

        when(caseRepository.findById(id)).thenReturn(Optional.of(caseEntity));

        CaseEntity caseResult = caseService.getCase(id);

        assertEquals(id, caseResult.getId());
    }

    @Test
    void getCase_shouldReturnException_whenNotFound() {
        UUID id = UUID.randomUUID();

        when(caseRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> caseService.getCase(id));
    }

    @Test
    void updateCase_shouldReturnPaginationCases() {
        CaseEntity caseEntity = CaseEntity.builder()
                .id(UUID.randomUUID())
                .title("Test Case")
                .build();

        Page<CaseEntity> page = new PageImpl<>(List.of(caseEntity));
        when(caseRepository.findAll(PageRequest.of(0, 10))).thenReturn(page);

        Page<CaseEntity> caseResult = caseService.getAllCases(0, 10);

        assertEquals(1, caseResult.getTotalElements());
        assertEquals("Test Case", caseResult.getContent().get(0).getTitle());
    }

    @Test
    void updateStatus_shouldUpdateCaseAndAddTimelineEvent() {
        UUID id = UUID.randomUUID();
        CaseEntity caseEntity = CaseEntity.builder()
                .id(id)
                .title("Test Case")
                .status(CaseStatus.OPEN)
                .build();

        when(caseRepository.findById(id)).thenReturn(Optional.of(caseEntity));
        when(caseRepository.save(any(CaseEntity.class))).thenReturn(caseEntity);

        CaseEntity caseResult = caseService.updateStatus(id, CaseStatus.CLOSED);

        assertEquals(CaseStatus.CLOSED, caseResult.getStatus());

        verify(caseTimelineService).addEvent(id, "Case status updated to " + CaseStatus.CLOSED);
    }
}