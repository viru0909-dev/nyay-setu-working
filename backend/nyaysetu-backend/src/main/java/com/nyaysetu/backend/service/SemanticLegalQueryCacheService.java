package com.nyaysetu.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nyaysetu.backend.entity.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class SemanticLegalQueryCacheService {

    private static final String INDEX_KEY = "nyaysetu:semantic-cache:legal-query:index";
    private static final String ITEM_PREFIX = "nyaysetu:semantic-cache:legal-query:item:";
    private static final int VECTOR_DIMENSIONS = 128;

    private static final Pattern NON_ALNUM = Pattern.compile("[^a-z0-9\\s]");
    private static final Pattern MULTI_SPACE = Pattern.compile("\\s+");
    private static final Pattern SECTION_PATTERN = Pattern.compile("\\b(section|sec)\\s+(\\d+[a-z]?)\\b");

    private static final Set<String> STOP_WORDS = Set.of(
        "what", "is", "are", "the", "a", "an", "of", "for", "to", "in", "on",
        "me", "my", "please", "tell", "about", "meaning", "explain", "define",
        "under", "and", "or", "with", "by", "as", "does", "do", "can", "i"
    );

    private static final Set<String> LEGAL_TERMS = Set.of(
        "ipc", "bns", "crpc", "bnss", "bsa", "constitution", "article", "section",
        "act", "law", "legal", "rights", "right", "court", "fir", "bail",
        "arrest", "warrant", "property", "divorce", "tenant", "consumer",
        "contract", "evidence", "case", "lawyer", "judge", "police"
    );

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${semantic-cache.legal.enabled:true}")
    private boolean enabled;

    @Value("${semantic-cache.legal.ttl-seconds:86400}")
    private long ttlSeconds;

    @Value("${semantic-cache.legal.similarity-threshold:0.82}")
    private double similarityThreshold;

    @Value("${semantic-cache.legal.max-candidates:200}")
    private int maxCandidates;

    @Value("${semantic-cache.legal.min-query-length:8}")
    private int minQueryLength;

    public Optional<String> findCachedResponse(String query, Role role, String dynamicContext, int conversationSize) {
        if (!isCacheable(query, role, dynamicContext, conversationSize)) {
            return Optional.empty();
        }

        try {
            String normalizedQuery = normalizeQuery(query);
            double[] queryVector = toVector(normalizedQuery);

            Set<String> keys = redisTemplate.opsForSet().members(INDEX_KEY);
            if (keys == null || keys.isEmpty()) {
                return Optional.empty();
            }

            CacheEntry bestEntry = null;
            double bestScore = 0.0;
            int checked = 0;

            for (String key : keys) {
                if (checked++ >= maxCandidates) {
                    break;
                }

                String json = redisTemplate.opsForValue().get(key);
                if (json == null || json.isBlank()) {
                    redisTemplate.opsForSet().remove(INDEX_KEY, key);
                    continue;
                }

                CacheEntry entry = objectMapper.readValue(json, CacheEntry.class);
                double score = cosineSimilarity(queryVector, entry.vector);

                if (score > bestScore) {
                    bestScore = score;
                    bestEntry = entry;
                }
            }

            if (bestEntry != null && bestScore >= similarityThreshold) {
                log.info("Semantic legal query cache hit. score={}, query='{}'", bestScore, normalizedQuery);
                return Optional.ofNullable(bestEntry.response);
            }

            log.debug("Semantic legal query cache miss. bestScore={}, query='{}'", bestScore, normalizedQuery);
        } catch (Exception e) {
            log.warn("Semantic legal query cache lookup failed; continuing without cache: {}", e.getMessage());
        }

        return Optional.empty();
    }

    public void cacheResponse(String query, Role role, String dynamicContext, int conversationSize, String response) {
        if (!isCacheable(query, role, dynamicContext, conversationSize) || response == null || response.isBlank()) {
            return;
        }

        try {
            String normalizedQuery = normalizeQuery(query);
            String key = ITEM_PREFIX + sha256(normalizedQuery);

            CacheEntry entry = new CacheEntry();
            entry.normalizedQuery = normalizedQuery;
            entry.response = response;
            entry.vector = toVector(normalizedQuery);
            entry.createdAtEpochSecond = Instant.now().getEpochSecond();

            String json = objectMapper.writeValueAsString(entry);

            redisTemplate.opsForValue().set(key, json, ttlSeconds, TimeUnit.SECONDS);
            redisTemplate.opsForSet().add(INDEX_KEY, key);
            redisTemplate.expire(INDEX_KEY, Math.max(ttlSeconds * 2, ttlSeconds), TimeUnit.SECONDS);

            log.info("Cached semantic legal query response for '{}'", normalizedQuery);
        } catch (Exception e) {
            log.warn("Semantic legal query cache write failed; response still returned normally: {}", e.getMessage());
        }
    }

    boolean isCacheable(String query, Role role, String dynamicContext, int conversationSize) {
        if (!enabled || query == null || query.isBlank()) {
            return false;
        }

        if (role != Role.LITIGANT) {
            return false;
        }

        // Internal/context-enriched callers have already passed request validation upstream.
        // They are intentionally excluded from semantic caching to avoid reusing
        // case-specific, lawyer-specific, or system-generated responses.
        if (dynamicContext != null && !dynamicContext.isBlank()) {
            return false;
        }

        if (conversationSize != 1) {
            return false;
        }

        String normalized = normalizeQuery(query);
        return normalized.length() >= minQueryLength && looksLikeReusableLegalQuery(normalized);
    }

    static boolean looksLikeReusableLegalQuery(String normalizedQuery) {
        if (normalizedQuery == null || normalizedQuery.isBlank()) {
            return false;
        }

        String[] tokens = normalizedQuery.split(" ");
        boolean hasLegalTerm = Arrays.stream(tokens).anyMatch(LEGAL_TERMS::contains);
        boolean hasSectionReference = SECTION_PATTERN.matcher(normalizedQuery).find();

        return hasLegalTerm || hasSectionReference;
    }

    static String normalizeQuery(String query) {
        if (query == null) {
            return "";
        }

        String normalized = query.toLowerCase(Locale.ROOT)
            .replace("indian penal code", "ipc")
            .replace("bharatiya nyaya sanhita", "bns")
            .replace("bharatiya nagarik suraksha sanhita", "bnss")
            .replace("criminal procedure code", "crpc")
            .replace("bharatiya sakshya adhiniyam", "bsa")
            .replace("sec.", "section")
            .replace("sec ", "section ")
            .replace("s.", "section ");

        normalized = NON_ALNUM.matcher(normalized).replaceAll(" ");
        normalized = MULTI_SPACE.matcher(normalized).replaceAll(" ").trim();

        if (normalized.isBlank()) {
            return "";
        }

        return Arrays.stream(normalized.split(" "))
            .filter(token -> !token.isBlank())
            .filter(token -> !STOP_WORDS.contains(token))
            .reduce((left, right) -> left + " " + right)
            .orElse("");
    }

    static double[] toVector(String normalizedQuery) {
        double[] vector = new double[VECTOR_DIMENSIONS];

        if (normalizedQuery == null || normalizedQuery.isBlank()) {
            return vector;
        }

        String[] tokens = normalizedQuery.split(" ");
        for (String token : tokens) {
            addToken(vector, token, 1.0);
        }

        for (int i = 0; i < tokens.length - 1; i++) {
            addToken(vector, tokens[i] + "_" + tokens[i + 1], 0.5);
        }

        normalizeVector(vector);
        return vector;
    }

    static double cosineSimilarity(double[] left, double[] right) {
        if (left == null || right == null || left.length != right.length) {
            return 0.0;
        }

        double dot = 0.0;
        double leftNorm = 0.0;
        double rightNorm = 0.0;

        for (int i = 0; i < left.length; i++) {
            dot += left[i] * right[i];
            leftNorm += left[i] * left[i];
            rightNorm += right[i] * right[i];
        }

        if (leftNorm == 0.0 || rightNorm == 0.0) {
            return 0.0;
        }

        return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
    }

    private static void addToken(double[] vector, String token, double weight) {
        int index = Math.floorMod(token.hashCode(), vector.length);
        vector[index] += weight;
    }

    private static void normalizeVector(double[] vector) {
        double norm = 0.0;
        for (double value : vector) {
            norm += value * value;
        }

        if (norm == 0.0) {
            return;
        }

        double scale = Math.sqrt(norm);
        for (int i = 0; i < vector.length; i++) {
            vector[i] = vector[i] / scale;
        }
    }

    private static String sha256(String value) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));

        StringBuilder hex = new StringBuilder();
        for (byte b : hash) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    public static class CacheEntry {
        public String normalizedQuery;
        public String response;
        public double[] vector;
        public long createdAtEpochSecond;
    }
}