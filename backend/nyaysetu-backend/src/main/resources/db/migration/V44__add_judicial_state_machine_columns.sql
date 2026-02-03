-- V44: Add judicial state machine columns to case_entity
-- These columns support the Chain Reaction workflow and BSA 63(4) compliance

-- Summons delivery tracking
ALTER TABLE case_entity ADD COLUMN IF NOT EXISTS summons_delivered BOOLEAN DEFAULT FALSE;

-- BSA Section 63(4) certification status
ALTER TABLE case_entity ADD COLUMN IF NOT EXISTS bsa634certified BOOLEAN DEFAULT FALSE;

-- Draft approval status (AWAITING_CLIENT, APPROVED, REJECTED)
ALTER TABLE case_entity ADD COLUMN IF NOT EXISTS draft_approval_status VARCHAR(50);

-- Current stage in the 7-step judicial process (1-7)
ALTER TABLE case_entity ADD COLUMN IF NOT EXISTS current_judicial_stage INTEGER DEFAULT 0;

-- Blocking errors that prevent case progression
ALTER TABLE case_entity ADD COLUMN IF NOT EXISTS blocking_errors TEXT;
