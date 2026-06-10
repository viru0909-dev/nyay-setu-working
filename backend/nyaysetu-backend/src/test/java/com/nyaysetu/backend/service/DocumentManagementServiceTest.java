package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.DocumentEntity;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.repository.DocumentRepository;
import com.nyaysetu.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentManagementServiceTest {

    @Mock
    private DocumentRepository documentRepository;
    @Mock
    private CaseRepository caseRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private FileStorageService fileStorageService;
    @Mock
    private DocumentAnalysisService documentAnalysisService;
    @Mock
    private BlockchainService blockchainService;

    private DocumentManagementService documentManagementService;

    @BeforeEach
    void setUp() {
        documentManagementService = new DocumentManagementService(
                documentRepository,
                caseRepository,
                userRepository,
                fileStorageService,
                documentAnalysisService,
                blockchainService
        );
    }

    @Test
    void ensureDocumentAccess_allowsAssignedLawyerOnRestrictedDocument() {
        UUID caseId = UUID.randomUUID();
        UUID documentId = UUID.randomUUID();
        Long lawyerId = 123L;

        DocumentEntity restrictedDocument = DocumentEntity.builder()
                .id(documentId)
                .caseId(caseId)
                .uploadedBy(456L)
                .visibilityLevel("RESTRICTED")
                .build();

        User assignedLawyer = User.builder().id(lawyerId).build();
        CaseEntity caseEntity = CaseEntity.builder()
                .id(caseId)
                .lawyer(assignedLawyer)
                .build();

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(restrictedDocument));
        when(caseRepository.findById(caseId)).thenReturn(Optional.of(caseEntity));

        assertDoesNotThrow(() -> documentManagementService.ensureDocumentAccess(documentId, lawyerId, "LAWYER"));
    }

    @Test
    void getCaseDocumentsWithAccessControl_allowsAssignedLawyerOnRestrictedDocuments() {
        UUID caseId = UUID.randomUUID();
        UUID documentId = UUID.randomUUID();
        Long lawyerId = 123L;

        DocumentEntity restrictedDocument = DocumentEntity.builder()
                .id(documentId)
                .caseId(caseId)
                .uploadedBy(456L)
                .visibilityLevel("RESTRICTED")
                .build();

        when(documentRepository.findByCaseId(caseId)).thenReturn(List.of(restrictedDocument));

        var documents = documentManagementService.getCaseDocumentsWithAccessControl(
                caseId, lawyerId, "LAWYER", true);

        assertEquals(1, documents.size());
    }

    @Test
    void ensureDocumentAccess_deniesUnassignedLawyerOnRestrictedDocument() {
        UUID caseId = UUID.randomUUID();
        UUID documentId = UUID.randomUUID();
        Long lawyerId = 123L;

        DocumentEntity restrictedDocument = DocumentEntity.builder()
                .id(documentId)
                .caseId(caseId)
                .uploadedBy(456L)
                .visibilityLevel("RESTRICTED")
                .build();

        User otherLawyer = User.builder().id(999L).build();
        CaseEntity caseEntity = CaseEntity.builder()
                .id(caseId)
                .lawyer(otherLawyer)
                .build();

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(restrictedDocument));
        when(caseRepository.findById(caseId)).thenReturn(Optional.of(caseEntity));

        assertThrows(RuntimeException.class,
                () -> documentManagementService.ensureDocumentAccess(documentId, lawyerId, "LAWYER"));
    }
}
