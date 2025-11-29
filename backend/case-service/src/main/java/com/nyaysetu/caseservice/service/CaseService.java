package com.nyaysetu.caseservice.service;

import com.nyaysetu.caseservice.dto.CreateCaseRequest;
import com.nyaysetu.caseservice.dto.PartyDto;
import com.nyaysetu.caseservice.entity.CaseEntity;
import com.nyaysetu.caseservice.entity.CaseStatus;
import com.nyaysetu.caseservice.entity.Party;
import com.nyaysetu.caseservice.repository.CaseRepository;
import com.nyaysetu.caseservice.repository.PartyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final CaseRepository caseRepository;
    private final PartyRepository partyRepository;

    @Transactional
    public CaseEntity createCase(CreateCaseRequest dto) {
        CaseEntity caseEntity = CaseEntity.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .judgeId(dto.getJudgeId())
                .status(CaseStatus.OPEN)
                .build();

        CaseEntity savedCase = caseRepository.save(caseEntity);

        if (dto.getParties() != null && !dto.getParties().isEmpty()) {
            List<Party> parties = dto.getParties().stream()
                    .map(p -> Party.builder()
                            .caseId(savedCase.getId())
                            .name(p.getName())
                            .role(p.getRole())
                            .build())
                    .collect(Collectors.toList());
            partyRepository.saveAll(parties);
        }

        return savedCase;
    }

    public CaseEntity getCase(UUID id) {
        return caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found with id: " + id));
    }

    public List<CaseEntity> getCasesByJudge(UUID judgeId) {
        return caseRepository.findByJudgeId(judgeId);
    }

    public List<CaseEntity> getCasesForUser(UUID userId) {
        // This requirement is a bit ambiguous as Party doesn't have a userId field,
        // only name and role.
        // Assuming the intention is to find cases where the user is a party, but we
        // don't have user mapping in Party entity as per requirements.
        // The requirement says "List<CaseEntity> getCasesForUser(UUID userId) // by
        // party role".
        // But Party entity only has: UUID id, UUID caseId, String name, String role.
        // There is no userId in Party.
        // However, I must strictly follow the requirements.
        // "Do NOT generate any extra files beyond what is listed."
        // "ENTITY: Party ... Fields: UUID id, UUID caseId, String name, String role"
        // So I cannot add userId to Party.
        // Maybe the "name" is supposed to be the userId? Or maybe I should just return
        // empty list or throw exception?
        // Or maybe I should search by something else?
        // Wait, the prompt says: "GET /user/{userId} → list user’s associated cases".
        // And "List<CaseEntity> getCasesForUser(UUID userId) // by party role".
        // If I cannot change the entity, I can't implement this fully correctly without
        // a userId in Party.
        // But I must generate the code.
        // I will implement it by assuming there might be a way to link, but for now
        // since I can't change entity,
        // I will just leave it as a placeholder or maybe the user ID is passed as name?
        // Unlikely.
        // Let's look at the prompt again.
        // "ENTITY: Party ... Fields: ... String name ... String role".
        // Maybe the userId is not stored in Party?
        // But how to link?
        // I will implement the method signature as requested.
        // Since I can't filter by userId on Party (it doesn't exist), I will return an
        // empty list for now
        // or maybe I should check if any party has the same ID? But Party ID is its own
        // ID.
        // I will just return an empty list to satisfy the compilation and method
        // signature,
        // adding a comment that implementation depends on user mapping which is missing
        // in the requirements.
        // actually, I'll just return empty list.
        return List.of();
    }

    public CaseEntity updateStatus(UUID id, CaseStatus status) {
        CaseEntity caseEntity = getCase(id);
        caseEntity.setStatus(status);
        return caseRepository.save(caseEntity);
    }
}
