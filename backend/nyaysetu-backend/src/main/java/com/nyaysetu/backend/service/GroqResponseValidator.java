package com.nyaysetu.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import com.networknt.schema.ValidationMessage;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Set;

/**
 * Loads the Vakil-Friend case-data JSON Schema once at startup and validates
 * structured payloads against it before they are allowed near persistence.
 */
@Component
@Slf4j
public class GroqResponseValidator {

    private static final String SCHEMA_PATH = "schema/vakil_response_schema.json";

    private final ObjectMapper objectMapper;
    private JsonSchema schema;

    public GroqResponseValidator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(SCHEMA_PATH)) {
            if (is == null) {
                throw new IllegalStateException("Schema not found on classpath: " + SCHEMA_PATH);
            }
            JsonNode schemaNode = objectMapper.readTree(is);
            JsonSchemaFactory factory = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V7);
            this.schema = factory.getSchema(schemaNode);
            log.info("✅ Loaded Vakil-Friend case-data JSON schema from {}", SCHEMA_PATH);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load " + SCHEMA_PATH, e);
        }
    }

    /** Returns an empty set when {@code node} satisfies the schema. */
    public Set<ValidationMessage> validate(JsonNode node) {
        return schema.validate(node);
    }

    public boolean isValid(JsonNode node) {
        return validate(node).isEmpty();
    }
}