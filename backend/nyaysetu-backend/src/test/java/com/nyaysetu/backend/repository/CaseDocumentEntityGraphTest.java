package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.DocumentEntity;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class CaseDocumentEntityGraphTest {

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Test
    void whenFindingCasesByClient_thenDocumentsAreLoadedWithEntityGraph() {
        User client = User.builder()
                .email("case-doc-graph@example.com")
                .name("Graph Test Client")
                .password("password")
                .role(Role.LITIGANT)
                .build();
        client = userRepository.save(client);
        assertNotNull(client.getId());

        CaseEntity firstCase = CaseEntity.builder()
                .title("First Graph Case")
                .description("This case should load documents eagerly via EntityGraph")
                .client(client)
                .build();
        firstCase = caseRepository.save(firstCase);

        CaseEntity secondCase = CaseEntity.builder()
                .title("Second Graph Case")
                .description("This case should load documents eagerly via EntityGraph")
                .client(client)
                .build();
        secondCase = caseRepository.save(secondCase);

        DocumentEntity firstDoc = DocumentEntity.builder()
                .caseId(firstCase.getId())
                .fileName("first-doc.pdf")
                .fileUrl("/files/first-doc.pdf")
                .contentType("application/pdf")
                .size(123L)
                .uploadedBy(client.getId())
                .build();
        documentRepository.save(firstDoc);

        DocumentEntity secondDoc = DocumentEntity.builder()
                .caseId(secondCase.getId())
                .fileName("second-doc.pdf")
                .fileUrl("/files/second-doc.pdf")
                .contentType("application/pdf")
                .size(456L)
                .uploadedBy(client.getId())
                .build();
        documentRepository.save(secondDoc);

        DocumentEntity thirdDoc = DocumentEntity.builder()
                .caseId(secondCase.getId())
                .fileName("third-doc.pdf")
                .fileUrl("/files/third-doc.pdf")
                .contentType("application/pdf")
                .size(789L)
                .uploadedBy(client.getId())
                .build();
        documentRepository.save(thirdDoc);

        SessionFactory sessionFactory = entityManagerFactory.unwrap(SessionFactory.class);
        Statistics statistics = sessionFactory.getStatistics();
        statistics.setStatisticsEnabled(true);
        statistics.clear();

        List<CaseEntity> cases = caseRepository.findByClient(client);

        assertFalse(cases.isEmpty(), "Expected cases for client to be returned");
        assertEquals(2, cases.size(), "Expected exactly two cases for the client");

        int totalDocuments = cases.stream().mapToInt(c -> c.getDocuments().size()).sum();
        assertEquals(3, totalDocuments, "Expected all case documents to be loaded with the cases");

        long queryCount = statistics.getPrepareStatementCount();
        assertTrue(queryCount <= 2, "Expected entity graph to fetch cases and documents with a low query count, but executed " + queryCount);
    }
}
