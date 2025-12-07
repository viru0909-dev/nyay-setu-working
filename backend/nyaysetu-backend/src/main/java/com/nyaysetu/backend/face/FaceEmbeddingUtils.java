package com.nyaysetu.backend.face;

import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class FaceEmbeddingUtils {

    /**
     * Placeholder method that converts image bytes to an embedding vector.
     * Replace with real embedding extraction (TensorFlow/PyTorch/face-api etc).
     */
    public double[] extractEmbedding(byte[] imageBytes) {
        // Very naive deterministic pseudo-embedding for demo/testing:
        double[] emb = new double[128];
        int seed = Arrays.hashCode(imageBytes);
        for (int i = 0; i < emb.length; i++) {
            emb[i] = ((seed >> (i % 8)) & 0xff) / 255.0;
        }
        return emb;
    }

    /**
     * Cosine similarity
     */
    public double cosineSimilarity(double[] a, double[] b) {
        double dot = 0, na = 0, nb = 0;
        int n = Math.min(a.length, b.length);
        for (int i = 0; i < n; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        if (na == 0 || nb == 0) return 0.0;
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }
}