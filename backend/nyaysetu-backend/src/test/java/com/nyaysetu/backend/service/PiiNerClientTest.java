package com.nyaysetu.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class PiiNerClientTest {

    @Test
    void sendsMinorProtectionFlagAndReadsEntities() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        String url = "http://localhost:8001/internal/pii/entities";
        server.expect(once(), requestTo(url))
                .andExpect(content().json("""
                        {"text":"Victim Raju","minor_protection":true}
                        """))
                .andRespond(withSuccess("""
                        {"entities":[{"value":"Raju","type":"PERSON"}]}
                        """, MediaType.APPLICATION_JSON));

        List<PiiEntityDetector.DetectedEntity> entities =
                new PiiNerClient(restTemplate, url).detectEntities("Victim Raju", true);

        assertThat(entities).containsExactly(
                new PiiEntityDetector.DetectedEntity("Raju", "PERSON"));
        server.verify();
    }
}
