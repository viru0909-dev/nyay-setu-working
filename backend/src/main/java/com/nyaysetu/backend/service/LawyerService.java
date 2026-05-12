package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.CaseDTO;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.CaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LawyerService {

    private final AiService aiService;
    private final CaseRepository caseRepository;
    private final CaseManagementService caseManagementService;

    public String generateDraft(UUID caseId, String templateType) {
        log.info("Generating AI draft for case {} with template {}", caseId, templateType);
        
        CaseDTO caseDetails = caseManagementService.getCaseById(caseId);
        
        String prompt = String.format(
            "You are an expert Indian legal drafter. Generate a formal legal document for the following case:\n\n" +
            "Case Title: %s\n" +
            "Petitioner: %s\n" +
            "Respondent: %s\n" +
            "Case Type: %s\n" +
            "Description: %s\n\n" +
            "Document Template Type: %s\n\n" +
            "Instructions:\n" +
            "1. Use professional Indian legal formatting (IN THE COURT OF...).\n" +
            "2. Include proper section headers (FACTS, GROUNDS, PRAYER).\n" +
            "3. Reference relevant Indian statutes where applicable.\n" +
            "4. Keep the tone formal and authoritative.\n" +
            "5. The draft should be ready for a lawyer to review and sign.",
            caseDetails.getTitle(),
            caseDetails.getPetitioner(),
            caseDetails.getRespondent(),
            caseDetails.getCaseType(),
            caseDetails.getDescription(),
            templateType
        );

        return aiService.chat(prompt);
    }

    public void saveDraft(UUID caseId, String draftContent) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));
        caseEntity.setDraftPetition(draftContent);
        caseRepository.save(caseEntity);
    }

    public Map<String, Object> getLawyerStats(User lawyer) {
        long totalCases = caseRepository.countByLawyer(lawyer);
        long activeClients = caseRepository.findByLawyer(lawyer).stream()
                .map(CaseEntity::getClient)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count();
        
        // Additional stats can be added here
        return Map.of(
            "totalCases", totalCases,
            "activeClients", activeClients,
            "resolvedCases", 0 // Placeholder
        );
    }
}
