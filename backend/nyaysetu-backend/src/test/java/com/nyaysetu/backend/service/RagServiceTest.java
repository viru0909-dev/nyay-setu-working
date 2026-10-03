package com.nyaysetu.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RagServiceTest {

    private RestTemplate restTemplate;
    private RagService ragService;

    @BeforeEach
    void setUp() {
        restTemplate = mock(RestTemplate.class);
        ragService = new RagService();
        ReflectionTestUtils.setField(ragService, "lawgptUrl", "http://localhost:8001");
        ReflectionTestUtils.setField(ragService, "restTemplate", restTemplate);
    }

    @SuppressWarnings("unchecked")
    private void stubContextResponse(ResponseEntity<Map> response) {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(response);
    }

    @Test
    void reportsGroundedWhenLawGptReturnsContext() {
        stubContextResponse(ResponseEntity.ok(Map.of("context", "BNS Section 303 defines theft.")));

        RagService.RagContext result = ragService.retrieveContext("punishment for theft", 3);

        assertThat(result.status()).isEqualTo(RagService.RetrievalStatus.GROUNDED);
        assertThat(result.isGrounded()).isTrue();
        assertThat(result.context()).contains("BNS Section 303");
    }

    @Test
    void reportsUnavailableWhenLawGptCannotBeReached() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(new ResourceAccessException("Connection refused"));

        RagService.RagContext result = ragService.retrieveContext("punishment for theft", 3);

        assertThat(result.status()).isEqualTo(RagService.RetrievalStatus.UNAVAILABLE);
        assertThat(result.isGrounded()).isFalse();
    }

    @Test
    void reportsUnavailableWhenLawGptReturnsAnErrorStatus() {
        stubContextResponse(new ResponseEntity<>(Map.of(), HttpStatus.INTERNAL_SERVER_ERROR));

        RagService.RagContext result = ragService.retrieveContext("punishment for theft", 3);

        assertThat(result.status()).isEqualTo(RagService.RetrievalStatus.UNAVAILABLE);
    }

    @Test
    void reportsNoMatchWhenLawGptAnswersWithoutContext() {
        stubContextResponse(ResponseEntity.ok(Map.of("context", "")));

        RagService.RagContext result = ragService.retrieveContext("what is the weather", 3);

        assertThat(result.status()).isEqualTo(RagService.RetrievalStatus.NO_MATCH);
        assertThat(result.isGrounded()).isFalse();
    }

    @Test
    void treatsThePlaceholderStringAsNoMatchRatherThanGrounding() {
        stubContextResponse(ResponseEntity.ok(Map.of("context", RagService.NO_CONTEXT_PLACEHOLDER)));

        RagService.RagContext result = ragService.retrieveContext("what is the weather", 3);

        assertThat(result.status()).isEqualTo(RagService.RetrievalStatus.NO_MATCH);
    }

    @Test
    void searchPrecedentsStillDegradesToAnEmptyListWhenLawGptIsDown() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(java.util.List.class)))
                .thenThrow(new ResourceAccessException("Connection refused"));

        assertThat(ragService.searchPrecedents("bail precedent", 5)).isEmpty();
    }
}
