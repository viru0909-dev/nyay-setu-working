package com.nyaysetu.backend.service;

import java.util.List;

/** Detects sensitive named entities inside the local deployment boundary. */
@FunctionalInterface
public interface PiiEntityDetector {

    List<DetectedEntity> detectEntities(String text, boolean minorProtection);

    record DetectedEntity(String value, String type) {}
}
