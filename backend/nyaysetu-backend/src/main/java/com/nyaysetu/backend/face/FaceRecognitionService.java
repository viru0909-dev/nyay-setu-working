package com.nyaysetu.backend.face;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class FaceRecognitionService {

    private final FaceEmbeddingUtils embeddingUtils;

    // In-memory store of userId -> embedding. Replace with DB in production.
    private final Map<Long, double[]> embeddings = new HashMap<>();

    public FaceRecognitionService(FaceEmbeddingUtils embeddingUtils) {
        this.embeddingUtils = embeddingUtils;
    }

    public void registerFaceForUser(Long userId, byte[] imageBytes) {
        double[] emb = embeddingUtils.extractEmbedding(imageBytes);
        embeddings.put(userId, emb);
    }

    /**
     * Returns userId if a match found with threshold, else null.
     */
    public Long findMatchingUser(byte[] imageBytes, double threshold) {
        double[] probe = embeddingUtils.extractEmbedding(imageBytes);
        Long bestId = null;
        double bestScore = -1.0;
        for (Map.Entry<Long, double[]> e : embeddings.entrySet()) {
            double score = embeddingUtils.cosineSimilarity(probe, e.getValue());
            if (score > bestScore) {
                bestScore = score;
                bestId = e.getKey();
            }
        }
        if (bestScore >= threshold) {
            return bestId;
        }
        return null;
    }
}