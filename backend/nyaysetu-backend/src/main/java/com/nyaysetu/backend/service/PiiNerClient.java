package com.nyaysetu.backend.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

/** Client for the locally hosted multilingual named-entity recognizer. */
@Service
public class PiiNerClient implements PiiEntityDetector {

    private final RestTemplate restTemplate;
    private final String serviceUrl;

    public PiiNerClient(
            RestTemplate restTemplate,
            @Value("${pii.sanitizer.ner-url:http://localhost:8001/internal/pii/entities}")
                    String serviceUrl) {
        this.restTemplate = restTemplate;
        this.serviceUrl = serviceUrl;
    }

    /**
     * Detects sensitive named entities without sending text outside the local deployment.
     *
     * @param text text that has already passed structural identifier redaction
     * @param minorProtection whether the content relates to a child or POCSO case
     * @return detected person, organization, and location entities
     */
    @Override
    public List<DetectedEntity> detectEntities(String text, boolean minorProtection) {
        NerResponse response = restTemplate.postForObject(
                serviceUrl, new NerRequest(text, minorProtection), NerResponse.class);
        if (response == null || response.entities() == null) {
            throw new PiiSanitizationException("Local NER service returned no result");
        }
        return Arrays.asList(response.entities());
    }

    private record NerRequest(
            String text, @JsonProperty("minor_protection") boolean minorProtection) {}

    private record NerResponse(DetectedEntity[] entities) {}
}
