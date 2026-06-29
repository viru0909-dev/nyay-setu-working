package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.AuditLog;
import com.nyaysetu.backend.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuditChainServiceTest {

    private AuditChainService chainService;
    private AuditLogRepository repository;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(AuditLogRepository.class);
        chainService = new AuditChainService(repository);
    }

    /**
     * Insert 3 entries. Manually corrupt previousHash of entry 2.
     * Verify that verifyChain correctly identifies entry 2 as the tampered record.
     */
    @Test
    void verifyChain_detectsTamperOnEntry2() {
        LocalDateTime base = LocalDateTime.of(2025, 1, 1, 0, 0, 0);

        // Entry 1 — genesis, correctly chained
        AuditLog entry1 = new AuditLog();
        entry1.setId(UUID.randomUUID());
        entry1.setAction("LOGIN");
        entry1.setUserId(1L);
        entry1.setDescription("User logged in");
        entry1.setTimestamp(base);
        entry1.setPreviousHash(AuditChainService.GENESIS_HASH);
        entry1.setEntryHash(chainService.computeHash(entry1, AuditChainService.GENESIS_HASH));

        // Entry 2 — previousHash corrupted (simulates a DB-level deletion/edit attack)
        AuditLog entry2 = new AuditLog();
        entry2.setId(UUID.randomUUID());
        entry2.setAction("CASE_CREATED");
        entry2.setUserId(2L);
        entry2.setDescription("New case filed");
        entry2.setTimestamp(base.plusMinutes(1));
        String attackerHash = "aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899";
        entry2.setPreviousHash(attackerHash);
        entry2.setEntryHash(chainService.computeHash(entry2, attackerHash));

        // Entry 3 — internally consistent with entry2 as stored, but chain from entry1 is broken
        AuditLog entry3 = new AuditLog();
        entry3.setId(UUID.randomUUID());
        entry3.setAction("DOC_UPLOADED");
        entry3.setUserId(1L);
        entry3.setDescription("Evidence uploaded");
        entry3.setTimestamp(base.plusMinutes(2));
        entry3.setPreviousHash(entry2.getEntryHash());
        entry3.setEntryHash(chainService.computeHash(entry3, entry2.getEntryHash()));

        when(repository.findAllByOrderByTimestampAsc()).thenReturn(List.of(entry1, entry2, entry3));

        List<Map<String, Object>> broken = chainService.verifyChain();

        assertEquals(1, broken.size(), "Exactly one broken link expected");
        assertEquals(entry2.getId().toString(), broken.get(0).get("id"),
                "Entry 2 must be identified as the tampered record");
    }

    @Test
    void verifyChain_returnsEmptyWhenChainIsIntact() {
        LocalDateTime base = LocalDateTime.of(2025, 1, 1, 0, 0, 0);

        AuditLog e1 = new AuditLog();
        e1.setId(UUID.randomUUID());
        e1.setAction("LOGIN");
        e1.setUserId(1L);
        e1.setDescription("User login");
        e1.setTimestamp(base);
        e1.setPreviousHash(AuditChainService.GENESIS_HASH);
        e1.setEntryHash(chainService.computeHash(e1, AuditChainService.GENESIS_HASH));

        AuditLog e2 = new AuditLog();
        e2.setId(UUID.randomUUID());
        e2.setAction("CASE_CREATED");
        e2.setUserId(2L);
        e2.setDescription("Case filed");
        e2.setTimestamp(base.plusMinutes(1));
        e2.setPreviousHash(e1.getEntryHash());
        e2.setEntryHash(chainService.computeHash(e2, e1.getEntryHash()));

        AuditLog e3 = new AuditLog();
        e3.setId(UUID.randomUUID());
        e3.setAction("DOC_UPLOADED");
        e3.setUserId(1L);
        e3.setDescription("Evidence");
        e3.setTimestamp(base.plusMinutes(2));
        e3.setPreviousHash(e2.getEntryHash());
        e3.setEntryHash(chainService.computeHash(e3, e2.getEntryHash()));

        when(repository.findAllByOrderByTimestampAsc()).thenReturn(List.of(e1, e2, e3));

        assertTrue(chainService.verifyChain().isEmpty(), "Intact chain must return no broken links");
    }

    @Test
    void appendEntry_setsGenesisHashWhenChainIsEmpty() {
        when(repository.findTopByOrderByTimestampDesc()).thenReturn(Optional.empty());
        when(repository.save(any(AuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

        AuditLog log = new AuditLog();
        log.setAction("LOGIN");
        log.setUserId(1L);
        log.setDescription("first entry");
        log.setTimestamp(LocalDateTime.now());

        AuditLog saved = chainService.appendEntry(log);

        assertEquals(AuditChainService.GENESIS_HASH, saved.getPreviousHash());
        assertNotNull(saved.getEntryHash());
        assertEquals(64, saved.getEntryHash().length());
    }
}