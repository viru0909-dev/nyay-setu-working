package com.nyaysetu.backend.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class UserRepositoryImpl implements UserRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Set<Long> findUserIdsByCaseId(UUID caseId) {
        String jpql = """
            SELECT DISTINCT u.id FROM User u
            WHERE u.id IN (
                SELECT c.client.id FROM CaseEntity c WHERE c.id = :caseId
                UNION
                SELECT c.lawyer.id FROM CaseEntity c WHERE c.id = :caseId
                UNION
                SELECT j.id FROM User j WHERE j.id = c.judgeId AND c.id = :caseId
            )
        """;
        
        return entityManager.createQuery(jpql, Long.class)
            .setParameter("caseId", caseId)
            .getResultStream()
            .collect(Collectors.toSet());
    }
}
