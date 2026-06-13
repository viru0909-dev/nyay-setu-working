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

    @Mock
    private com.nyaysetu.backend.repository.DocumentRepository documentRepository;

    private CaseManagementService service;

    @BeforeEach
    public void setup() {
        service = new CaseManagementService(caseRepository, hearingRepository, notificationService, timelineService, documentRepository);
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

    @Test
    public void orderRespondentNotice_notifiesClientAndLawyer() {
        UUID caseId = UUID.randomUUID();

        User client = User.builder().id(1L).email("client@example.com").name("Client").build();
        User lawyer = User.builder().id(2L).email("lawyer@example.com").name("Lawyer").build();

        CaseEntity caseEntity = CaseEntity.builder()
                .id(caseId)
                .client(client)
                .lawyer(lawyer)
                .build();

        when(caseRepository.findById(caseId)).thenReturn(Optional.of(caseEntity));
        when(caseRepository.save(ArgumentMatchers.any(CaseEntity.class))).thenAnswer(i -> i.getArgument(0));

        service.orderRespondentNotice(caseId);

        verify(notificationService, times(2)).save(ArgumentMatchers.any(com.nyaysetu.backend.notification.entity.Notification.class));
        verify(timelineService).addEvent(eq(caseId), eq("SUMMONS_ISSUED"), anyString());
    }

    @Test
    public void startHearings_notifiesOnlyClient_whenNoLawyerAssigned() {
        UUID caseId = UUID.randomUUID();

        User client = User.builder().id(1L).email("client@example.com").name("Client").build();

        CaseEntity caseEntity = CaseEntity.builder()
                .id(caseId)
                .client(client)
                .build();

        when(caseRepository.findById(caseId)).thenReturn(Optional.of(caseEntity));
        when(caseRepository.save(ArgumentMatchers.any(CaseEntity.class))).thenAnswer(i -> i.getArgument(0));

        service.startHearings(caseId);

        verify(notificationService, times(1)).save(ArgumentMatchers.any(com.nyaysetu.backend.notification.entity.Notification.class));
        verify(timelineService).addEvent(eq(caseId), eq("HEARINGS_STARTED"), anyString());
    }

    @Test
    public void deliverVerdict_notifiesClientWithVerdictMessage() {
        UUID caseId = UUID.randomUUID();

        User client = User.builder().id(1L).email("client@example.com").name("Client").build();

        CaseEntity caseEntity = CaseEntity.builder()
                .id(caseId)
                .client(client)
                .build();

        when(caseRepository.findById(caseId)).thenReturn(Optional.of(caseEntity));
        when(caseRepository.save(ArgumentMatchers.any(CaseEntity.class))).thenAnswer(i -> i.getArgument(0));

        service.deliverVerdict(caseId, "Case dismissed");

        verify(notificationService, times(1)).save(ArgumentMatchers.any(com.nyaysetu.backend.notification.entity.Notification.class));
        verify(timelineService).addEvent(eq(caseId), eq("VERDICT_DELIVERED"), anyString());
    }
}
