package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.AiArtifactCompareResponse;
import com.nyaysetu.backend.dto.DocumentCompareResponse;
import com.nyaysetu.backend.dto.DiffModification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Word-level diff analysis shared by document and AI artifact comparison.
 */
@Service
@RequiredArgsConstructor
public class TextDiffService {

    public DocumentCompareResponse compare(String baseText, String compareText) {
        List<Token> tokens = diffWords(
                baseText == null ? "" : baseText,
                compareText == null ? "" : compareText
        );

        List<String> additions = new ArrayList<>();
        List<String> removals = new ArrayList<>();
        List<DiffModification> modifications = new ArrayList<>();

        for (int i = 0; i < tokens.size(); i++) {
            Token token = tokens.get(i);
            Token next = i + 1 < tokens.size() ? tokens.get(i + 1) : null;

            if (token.removed && next != null && next.added) {
                modifications.add(DiffModification.builder()
                        .from(token.value.trim())
                        .to(next.value.trim())
                        .build());
                i++;
                continue;
            }

            if (token.added && !token.value.isBlank()) {
                additions.add(token.value.trim());
            } else if (token.removed && !token.value.isBlank()) {
                removals.add(token.value.trim());
            }
        }

        return DocumentCompareResponse.builder()
                .additions(additions)
                .removals(removals)
                .modifications(modifications)
                .build();
    }

    public AiArtifactCompareResponse compareAiArtifacts(
            String originalText,
            String summaryText
    ) {
        DocumentCompareResponse diff = compare(originalText, summaryText);

        List<String> added = new ArrayList<>(diff.getAdditions());
        List<String> removed = new ArrayList<>(diff.getRemovals());
        List<String> condensed = new ArrayList<>();

        diff.getModifications().forEach(mod -> {
            if (mod.getTo().length() < mod.getFrom().length()) {
                condensed.add(mod.getFrom());
            } else {
                added.add(mod.getTo());
                removed.add(mod.getFrom());
            }
        });

        return AiArtifactCompareResponse.builder()
                .added(added)
                .removed(removed)
                .condensed(condensed)
                .build();
    }

    private List<Token> diffWords(String oldText, String newText) {
        String[] oldParts = splitWords(oldText);
        String[] newParts = splitWords(newText);

        int[][] lcs = buildLcsTable(oldParts, newParts);
        List<Token> result = new ArrayList<>();

        int i = oldParts.length;
        int j = newParts.length;

        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && oldParts[i - 1].equals(newParts[j - 1])) {
                result.add(0, Token.common(oldParts[i - 1]));
                i--;
                j--;
            } else if (j > 0 && (i == 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
                result.add(0, Token.added(newParts[j - 1]));
                j--;
            } else {
                result.add(0, Token.removed(oldParts[i - 1]));
                i--;
            }
        }

        return mergeAdjacent(result);
    }

    private List<Token> mergeAdjacent(List<Token> tokens) {
        List<Token> merged = new ArrayList<>();

        for (Token token : tokens) {
            if (merged.isEmpty()) {
                merged.add(token);
                continue;
            }

            Token last = merged.get(merged.size() - 1);

            if (last.added == token.added
                    && last.removed == token.removed
                    && last.common == token.common) {
                last.value = last.value + token.value;
            } else {
                merged.add(token);
            }
        }

        return merged;
    }

    private String[] splitWords(String text) {
        if (text == null || text.isEmpty()) {
            return new String[0];
        }

        return text.split("(?<=\\s)|(?=\\s)");
    }

    private int[][] buildLcsTable(String[] oldParts, String[] newParts) {
        int[][] table = new int[oldParts.length + 1][newParts.length + 1];

        for (int i = 1; i <= oldParts.length; i++) {
            for (int j = 1; j <= newParts.length; j++) {
                if (oldParts[i - 1].equals(newParts[j - 1])) {
                    table[i][j] = table[i - 1][j - 1] + 1;
                } else {
                    table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
                }
            }
        }

        return table;
    }

    private static class Token {
        String value;
        boolean added;
        boolean removed;
        boolean common;

        static Token added(String value) {
            Token token = new Token();
            token.value = value;
            token.added = true;
            return token;
        }

        static Token removed(String value) {
            Token token = new Token();
            token.value = value;
            token.removed = true;
            return token;
        }

        static Token common(String value) {
            Token token = new Token();
            token.value = value;
            token.common = true;
            return token;
        }
    }
}
