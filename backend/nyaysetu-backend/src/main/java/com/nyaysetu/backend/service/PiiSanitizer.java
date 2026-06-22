package com.nyaysetu.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Fail-closed privacy boundary for text sent to third-party LLMs.
 * Pseudonym maps exist only for the duration of one sanitize call.
 */
@Service
@Slf4j
public class PiiSanitizer {

    private enum Type {
        AADHAAR,
        PAN,
        PHONE,
        VOTER_ID,
        PASSPORT,
        DRIVING_LICENCE,
        EMAIL,
        CASTE,
        MEDICAL,
        PERSON,
        ORGANIZATION,
        ADDRESS
    }

    private record Rule(Type type, Pattern pattern) {}

    private static final List<Rule> STRUCTURAL_RULES = List.of(
            new Rule(Type.AADHAAR, Pattern.compile("(?<!\\d)\\d{4}[ -]?\\d{4}[ -]?\\d{4}(?!\\d)")),
            new Rule(Type.PAN, Pattern.compile("(?i)(?<![A-Z0-9])[A-Z]{5}\\d{4}[A-Z](?![A-Z0-9])")),
            new Rule(Type.PHONE, Pattern.compile(
                    "(?<!\\d)(?:(?:\\+|00)91[- ]?|0)?[6-9]\\d{4}[- ]?\\d{5}(?!\\d)")),
            new Rule(Type.VOTER_ID, Pattern.compile(
                    "(?i)(?<![A-Z0-9])[A-Z]{3}[ -]?\\d{7}(?![A-Z0-9])")),
            new Rule(Type.PASSPORT, Pattern.compile(
                    "(?i)(?<![A-Z0-9])[A-Z][1-9]\\d{6}(?![A-Z0-9])")),
            new Rule(Type.DRIVING_LICENCE, Pattern.compile(
                    "(?i)(?<![A-Z0-9])[A-Z]{2}[- ]?\\d{2}[- ]?(?:19|20)?\\d{2}"
                            + "[- ]?\\d{7}(?![A-Z0-9])")),
            new Rule(Type.EMAIL, Pattern.compile(
                    "(?i)(?<![A-Z0-9._%+-])[A-Z0-9._%+-]+@[A-Z0-9.-]+"
                            + "\\.[A-Z]{2,}(?![A-Z0-9.-])")),
            new Rule(Type.CASTE, Pattern.compile(
                    "(?i)(?<![\\p{L}])(?:SC\\s*/\\s*ST|SC|ST|OBC|EWS|Scheduled\\s+Caste|"
                            + "Scheduled\\s+Tribe|Dalit|Brahmin|Brahminical)(?![\\p{L}])"))
    );

    private static final Pattern POCSO = Pattern.compile(
            "(?i)\\b(?:POCSO|minor|child victim|age\\s*[:=]?\\s*(?:[0-9]|1[0-7])\\b)");
    private static final Pattern ADDRESS_FIELD = Pattern.compile(
            "(?iu)(?<prefix>(?:address|residence)\\s*(?:[:=]|is)\\s*[\\\"']?)"
                    + "(?<value>[^,\\n\\r\\\"}]{5,100})");
    private static final Pattern MEDICAL_FIELD = Pattern.compile(
            "(?iu)(?<prefix>(?:diagnosis|medical\\s+history|health\\s+condition|blood\\s+group)"
                    + "\\s*(?:[:=]|is)\\s*[\\\"']?)(?<value>[^,\\n\\r\\\"}]{2,100})");

    private final boolean strictMode;
    private final PiiEntityDetector piiEntityDetector;

    public PiiSanitizer(
            @Value("${pii.sanitizer.strict-mode:true}") boolean strictMode,
            PiiEntityDetector piiEntityDetector) {
        this.strictMode = strictMode;
        this.piiEntityDetector = piiEntityDetector;
    }

    /**
     * Applies structural redaction and local multilingual NER before a Groq request.
     * The token map is request-scoped and is never persisted or transmitted.
     *
     * @param input outbound prompt content
     * @return sanitized content containing stable relationship-preserving tokens
     * @throws PiiSanitizationException when strict mode is enabled and sanitization fails
     */
    public String sanitizeForGroq(String input) {
        return sanitizeBatchForGroq(Collections.singletonList(input)).get(0);
    }

    /**
     * Sanitizes all content fields in one outbound request with one stable token map.
     *
     * @param inputs prompt and conversation fields belonging to one Groq request
     * @return sanitized fields in input order
     */
    public List<String> sanitizeBatchForGroq(List<String> inputs) {
        try {
            SanitizeState state = new SanitizeState();
            boolean minorProtection = inputs.stream()
                    .filter(value -> value != null)
                    .anyMatch(value -> POCSO.matcher(value).find());
            List<String> sanitizedInputs = new ArrayList<>(inputs.size());
            for (String input : inputs) {
                String sanitized = input == null ? "" : input;
                for (Rule rule : STRUCTURAL_RULES) {
                    sanitized = replace(sanitized, rule.pattern(), rule.type(), state);
                }
                sanitized = replaceFieldValue(sanitized, ADDRESS_FIELD, Type.ADDRESS, state);
                sanitized = replaceFieldValue(sanitized, MEDICAL_FIELD, Type.MEDICAL, state);
                sanitizedInputs.add(replaceNamedEntities(sanitized, minorProtection, state));
            }

            log.info("SANITIZATION_AUDIT destination=GROQ minorProtection={} maskedTypes={}",
                    minorProtection, state.counts);
            return sanitizedInputs;
        } catch (RuntimeException e) {
            log.error(
                    "SANITIZATION_AUDIT destination=GROQ status=FAILED "
                            + "strictMode={} errorType={}",
                    strictMode, e.getClass().getSimpleName());
            if (strictMode) {
                throw new PiiSanitizationException(
                        "Groq call blocked because PII sanitization failed", e);
            }
            return new ArrayList<>(inputs);
        }
    }

    private String replaceNamedEntities(
            String text, boolean minorProtection, SanitizeState state) {
        List<PiiEntityDetector.DetectedEntity> entities =
                piiEntityDetector.detectEntities(text, minorProtection).stream()
                        .filter(entity -> entity.value() != null && !entity.value().isBlank())
                        .sorted((left, right) ->
                                Integer.compare(right.value().length(), left.value().length()))
                        .toList();
        String result = text;
        for (PiiEntityDetector.DetectedEntity entity : entities) {
            Type type = switch (entity.type().toUpperCase(Locale.ROOT)) {
                case "PER", "PERSON" -> Type.PERSON;
                case "ORG", "ORGANIZATION" -> Type.ORGANIZATION;
                case "LOC", "LOCATION", "GPE", "ADDRESS" -> Type.ADDRESS;
                default -> null;
            };
            if (type != null) {
                result = result.replace(entity.value(), state.token(type, entity.value()));
            }
        }
        return result;
    }

    private String replace(String text, Pattern pattern, Type type, SanitizeState state) {
        Matcher matcher = pattern.matcher(text);
        StringBuffer output = new StringBuffer();
        while (matcher.find()) {
            String token = state.token(type, matcher.group());
            matcher.appendReplacement(output, Matcher.quoteReplacement(token));
        }
        matcher.appendTail(output);
        return output.toString();
    }

    private String replaceFieldValue(
            String text, Pattern pattern, Type type, SanitizeState state) {
        Matcher matcher = pattern.matcher(text);
        StringBuffer output = new StringBuffer();
        while (matcher.find()) {
            String replacement = matcher.group("prefix")
                    + state.token(type, matcher.group("value").trim());
            matcher.appendReplacement(output, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(output);
        return output.toString();
    }

    private static final class SanitizeState {
        private final Map<Type, Integer> counts = new EnumMap<>(Type.class);
        private final Map<Type, Map<String, String>> tokens = new EnumMap<>(Type.class);

        private String token(Type type, String value) {
            Map<String, String> values =
                    tokens.computeIfAbsent(type, ignored -> new LinkedHashMap<>());
            String normalized = value.toLowerCase(Locale.ROOT).replaceAll("[ -]", "");
            String existing = values.get(normalized);
            if (existing != null) {
                return existing;
            }

            int index = values.size();
            String token = type == Type.PERSON || type == Type.ORGANIZATION
                    || type == Type.ADDRESS || type == Type.MEDICAL
                    ? type.name() + "_" + alphabeticIndex(index)
                    : "[" + type.name() + "_" + (index + 1) + "]";
            values.put(normalized, token);
            counts.merge(type, 1, Integer::sum);
            return token;
        }

        private static String alphabeticIndex(int index) {
            StringBuilder reversed = new StringBuilder();
            do {
                reversed.append((char) ('A' + index % 26));
                index = index / 26 - 1;
            } while (index >= 0);
            return reversed.reverse().toString();
        }
    }
}
