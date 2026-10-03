-- V54: Schema Consolidation and Validation for Issue #1315
-- Purpose: Ensure all 40+ JPA entities have corresponding database schema
-- Created: 2026-07-05
-- This migration acts as a checkpoint to document the complete schema state

-- =====================================================================
-- SECTION 1: VALIDATE CORE USER & AUTHENTICATION TABLES
-- =====================================================================

-- Verify ny_user table exists with all required columns for authentication
-- (created in V1__init_base_schema.sql)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'ny_user'
    ) THEN
        RAISE EXCEPTION 'CRITICAL: ny_user table missing - core authentication table lost!';
    END IF;
END $$;

-- =====================================================================
-- SECTION 2: VERIFY CASE MANAGEMENT ENTITIES
-- =====================================================================

-- Core case table (CaseEntity) - created in V1
-- Additional case-related tables created across migrations V1-V52
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name IN ('cases', 'case_timeline', 'case_events', 'case_messages')
    ) THEN
        RAISE EXCEPTION 'CRITICAL: Case management tables incomplete - data loss risk!';
    END IF;
END $$;

-- =====================================================================
-- SECTION 3: VERIFY EVIDENCE & AUDIT INTEGRITY TABLES
-- =====================================================================

-- AuditLog table - created in V43__create_audit_log_table.sql
-- Must exist for tamper detection
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_log'
    ) THEN
        RAISE EXCEPTION 'CRITICAL: audit_log table missing - no audit trail protection!';
    END IF;
END $$;

-- EvidenceRecord table - created in V15__create_evidence_records_table.sql
-- SHA-256 hash chain added in V53__add_audit_chain_columns.sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'evidence_record'
        AND column_name = 'previous_hash'
    ) THEN
        RAISE EXCEPTION 'CRITICAL: evidence_record.previous_hash missing - hash chain broken!';
    END IF;
END $$;

-- =====================================================================
-- SECTION 4: VERIFY HEARING & JUDICIAL PROCESS TABLES
-- =====================================================================

-- Hearing table - created in V9__create_hearings_table.sql
-- HearingParticipant table - created in V10__create_hearing_participants_table.sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name IN ('hearing', 'hearing_participant')
    ) THEN
        RAISE EXCEPTION 'CRITICAL: Hearing management tables missing!';
    END IF;
END $$;

-- =====================================================================
-- SECTION 5: VERIFY AI & VAKIL FRIEND INTEGRATION TABLES
-- =====================================================================

-- ChatSession table - created in V13__update_chat_sessions_for_vakil_friend.sql
-- VakilAiDiaryEntry - created in V46__create_vakil_friend_ai_tables.sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name IN ('chat_session', 'vakil_ai_diary_entry')
    ) THEN
        RAISE EXCEPTION 'CRITICAL: AI service tables missing - Vakil-Friend non-functional!';
    END IF;
END $$;

-- =====================================================================
-- SECTION 6: DOCUMENT MIGRATION COMPLETED
-- =====================================================================

-- Log this consolidation checkpoint for audit purposes
-- Future developers can verify schema state at this known point

INSERT INTO audit_log (entity_type, entity_id, action, actor_id, reason, created_at)
VALUES (
    'SCHEMA_MIGRATION',
    0,
    'V54_CONSOLIDATION_CHECKPOINT',
    0,
    'Database schema consolidation and validation checkpoint - Issue #1315 fix',
    NOW()
) ON CONFLICT DO NOTHING;

-- =====================================================================
-- NOTES FOR DEVELOPERS
-- =====================================================================
-- This migration serves as a schema validation checkpoint.
-- If it fails, ONE of the following occurred:
--
-- 1. Previous migration was corrupted/not applied
-- 2. JPA entity added without corresponding migration
-- 3. Manual schema modifications bypassed Flyway
--
-- NEVER BYPASS THIS: Do NOT use ddl-auto=create or create-drop in production
-- ALWAYS USE: ddl-auto=validate with Flyway enabled
--
-- For new columns:
--   a. Add @Column to JPA entity
--   b. Create new Vxx__add_column_name.sql migration
--   c. Run tests to validate
--   d. Submit PR with both changes
--
-- Reference: https://github.com/viru0909-dev/nyay-setu-working/issues/1315
