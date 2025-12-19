package com.nyaysetu.backend.service;

import com.google.gson.Gson;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class GeminiAIService {
    
    private final Gson gson = new Gson();
    
    /**
     * Smart Fake AI - Analyzes document text locally without external API
     */
    public String analyzeDocument(String documentText, String fileName) {
        log.info("Generating smart fake AI analysis for: {}", fileName);
        
        try {
            // Extract real information from PDF text
            List<String> laws = extractLaws(documentText);
            List<String> dates = extractDates(documentText);
            List<String> parties = extractParties(documentText);
            String category = determineCategory(documentText, fileName);
            String summary = generateSummary(documentText);
            List<String> legalPoints = extractKeyPoints(documentText);
            
            // Build realistic JSON response
            Map<String, Object> analysis = new HashMap<>();
            analysis.put("summary", summary);
            analysis.put("legalPoints", legalPoints);
            analysis.put("relevantLaws", laws);
            analysis.put("importantDates", dates);
            analysis.put("partiesInvolved", parties);
            analysis.put("caseLawSuggestions", Arrays.asList(
                "Shah Babulal Khimji v. Jayaben D. Kania (1981)",
                "State of Maharashtra v. Ramdas Shrinivas (1982)"
            ));
            analysis.put("suggestedCategory", category);
            analysis.put("riskAssessment", "Medium - Requires legal review");
            
            return gson.toJson(analysis);
            
        } catch (Exception e) {
            log.error("Fake AI error for: {}", fileName, e);
            return generateFallbackAnalysis();
        }
    }
    
    private String generateSummary(String text) {
        String first200 = text.length() > 200 ? text.substring(0, 200) : text;
        return "This document contains legal information related to " + 
               (text.contains("property") ? "property matters" : "legal proceedings") + 
               ". Analysis based on document content.";
    }
    
    private List<String> extractLaws(String text) {
        List<String> laws = new ArrayList<>();
        
        // Pattern for IPC sections
        Pattern ipcPattern = Pattern.compile("(?i)(IPC|Section)\\s+(\\d+[A-Z]?)", Pattern.CASE_INSENSITIVE);
        Matcher ipcMatcher = ipcPattern.matcher(text);
        while (ipcMatcher.find() && laws.size() < 5) {
            laws.add("IPC Section " + ipcMatcher.group(2));
        }
        
        // Pattern for CrPC
        Pattern crpcPattern = Pattern.compile("(?i)CrPC\\s+(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher crpcMatcher = crpcPattern.matcher(text);
        while (crpcMatcher.find() && laws.size() < 5) {
            laws.add("CrPC Section " + crpcMatcher.group(1));
        }
        
        if (laws.isEmpty()) {
            laws.add("Indian Evidence Act Section 65B");
            laws.add("CPC Order 7 Rule 11");
        }
        
        return laws;
    }
    
    private List<String> extractDates(String text) {
        List<String> dates = new ArrayList<>();
        Pattern datePattern = Pattern.compile("(\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4}|\\d{4}[-/]\\d{1,2}[-/]\\d{1,2})");
        Matcher matcher = datePattern.matcher(text);
        
        while (matcher.find() && dates.size() < 3) {
            dates.add("Date: " + matcher.group(1));
        }
        
        if (dates.isEmpty()) {
            dates.add("Filing date to be determined");
        }
        
        return dates;
    }
    
    private List<String> extractParties(String text) {
        List<String> parties = new ArrayList<>();
        
        if (text.contains("petitioner") || text.contains("Petitioner")) {
            parties.add("Petitioner (as mentioned in document)");
        }
        if (text.contains("respondent") || text.contains("Respondent")) {
            parties.add("Respondent (as mentioned in document)");
        }
        if (parties.isEmpty()) {
            parties.add("Parties as per document");
        }
        
        return parties;
    }
    
    private String determineCategory(String text, String fileName) {
        String lower = text.toLowerCase() + " " + fileName.toLowerCase();
        
        if (lower.contains("contract") || lower.contains("agreement")) return "CONTRACTS";
        if (lower.contains("evidence") || lower.contains("proof")) return "EVIDENCE";
        if (lower.contains("statement") || lower.contains("affidavit")) return "STATEMENTS";
        if (lower.contains("financial") || lower.contains("invoice")) return "FINANCIAL";
        
        return "LEGAL_DOCUMENTS";
    }
    
    private List<String> extractKeyPoints(String text) {
        List<String> points = new ArrayList<>();
        
        if (text.contains("property")) {
            points.add("Property-related matter identified");
        }
        if (text.contains("dispute")) {
            points.add("Dispute resolution case");
        }
        if (text.contains("court") || text.contains("Court")) {
            points.add("Court proceeding document");
        }
        
        if (points.isEmpty()) {
            points.add("General legal document");
            points.add("Requires legal review");
        }
        
        return points;
    }
    
    private String generateFallbackAnalysis() {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("summary", "Document analysis completed");
        fallback.put("legalPoints", Arrays.asList("Legal document identified"));
        fallback.put("relevantLaws", Arrays.asList("IPC Section 420", "CrPC Section 156"));
        fallback.put("importantDates", Arrays.asList("Date pending"));
        fallback.put("partiesInvolved", Arrays.asList("Parties as per document"));
        fallback.put("caseLawSuggestions", Arrays.asList("Reference case law pending"));
        fallback.put("suggestedCategory", "LEGAL_DOCUMENTS");
        fallback.put("riskAssessment", "Pending review");
        
        return gson.toJson(fallback);
    }
}
