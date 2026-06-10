package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.exception.AccessDeniedException;
import com.nyaysetu.backend.repository.CaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CaseAccessService {

    private final CaseRepository caseRepository;

    public CaseEntity requireCaseAccess(UUID caseId, User user) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found: " + caseId));

        if (!canAccessCase(caseEntity, user)) {
            log.warn("Access denied: user {} (role={}) tried to access case {}", user.getId(), user.getRole(), caseId);
            throw new AccessDeniedException("You do not have access to this case");
        }
        return caseEntity;
    }

    public boolean canAccessCase(CaseEntity caseEntity, User user) {
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_JUDGE) {
            return true;
        }
        if (caseEntity.getClient() != null && caseEntity.getClient().getId().equals(user.getId())) {
            return true;
        }
        if (caseEntity.getLawyer() != null && caseEntity.getLawyer().getId().equals(user.getId())) {
            return true;
        }
        if (caseEntity.getJudgeId() != null && caseEntity.getJudgeId().equals(user.getId())) {
            return true;
        }
        if (user.getEmail() != null && user.getEmail().equals(caseEntity.getRespondentEmail())) {
            return true;
        }
        if (user.getRole() == Role.JUDGE || user.getRole() == Role.POLICE) {
            return true;
        }
        return false;
    }
}
