package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.Role;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SemanticLegalQueryCacheServiceTest {

    @Test
    void similarSectionQueriesProduceHighSimilarity() {
        String first = SemanticLegalQueryCacheService.normalizeQuery("What is Section 420 IPC?");
        String second = SemanticLegalQueryCacheService.normalizeQuery("Explain IPC sec. 420 meaning");

        double similarity = SemanticLegalQueryCacheService.cosineSimilarity(
            SemanticLegalQueryCacheService.toVector(first),
            SemanticLegalQueryCacheService.toVector(second)
        );

        assertTrue(similarity >= 0.70, "similar legal section queries should be close semantically");
    }

    @Test
    void legalQueriesAreDetectedAsReusable() {
        assertTrue(SemanticLegalQueryCacheService.looksLikeReusableLegalQuery(
            SemanticLegalQueryCacheService.normalizeQuery("What are my rights after arrest?")
        ));

        assertTrue(SemanticLegalQueryCacheService.looksLikeReusableLegalQuery(
            SemanticLegalQueryCacheService.normalizeQuery("Explain Article 21 of the Constitution")
        ));
    }

    @Test
    void nonLegalQueriesAreNotDetectedAsReusable() {
        assertFalse(SemanticLegalQueryCacheService.looksLikeReusableLegalQuery(
            SemanticLegalQueryCacheService.normalizeQuery("hello how are you today")
        ));
    }

    @Test
    void contextSpecificQueriesAreNotCacheable() {
        SemanticLegalQueryCacheService service = new SemanticLegalQueryCacheService(null, null);

        assertFalse(service.isCacheable("What should I do in my case?", Role.LAWYER, "case context", 1));
        assertFalse(service.isCacheable("What is Section 420 IPC?", Role.LITIGANT, "", 3));
    }
}