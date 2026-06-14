package com.nyaysetu.backend.repository;

import java.util.Set;
import java.util.UUID;

public interface UserRepositoryCustom {
    Set<Long> findUserIdsByCaseId(UUID caseId);
}
