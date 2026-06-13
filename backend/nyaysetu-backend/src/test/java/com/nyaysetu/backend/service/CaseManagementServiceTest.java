package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.repository.HearingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CaseManagementServiceTest {

    @Mock
    private CaseRepository caseRepository;

    @Mock
    private HearingRepository hearingRepository;

    @Mock
    private com.nyaysetu.backend.notification.service.NotificationService notificationService;

    @Mock
    private com.nyaysetu.backend.service.CaseTimelineService timelineService;

    private CaseManagementService service;

    @BeforeEach
    public void setup() {
        service = new CaseManagementService(caseRepository, hearingRepository, notificationService, timelineService);
    }

    @Test
    public void sendDraftForApproval_swallowsException_whenDraftContentIsNull() {
        UUID caseId = UUID.randomUUID();

        User client = User.builder().id(1L).email("client@example.com").name("Client").build();

        CaseEntity caseEntity = CaseEntity.builder()
                .id(caseId)
                .client(client)
                .build();

        when(caseRepository.findById(caseId)).thenReturn(Optional.of(caseEntity));
        when(caseRepository.save(ArgumentMatchers.any(CaseEntity.class))).thenAnswer(i -> i.getArgument(0));

        // Passing null draftContent should cause a NPE inside the try block, which must be swallowed
        assertDoesNotThrow(() -> service.sendDraftForApproval(caseId, null));

        // Verify that the case was saved (status update) and timeline updated
        verify(caseRepository, atLeastOnce()).save(ArgumentMatchers.any(CaseEntity.class));
        verify(timelineService).addEvent(eq(caseId), eq("DRAFT_SUBMITTED"), anyString());
    }
}
