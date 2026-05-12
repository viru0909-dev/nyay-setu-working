-- Migration V21: Definite drop and recreate for problematic columns
-- This is a hammer approach to fix the UUID vs BIGINT issue once and for all.

-- Drop indexes first to avoid conflicts
DROP INDEX IF EXISTS idx_case_entity_judge_id;
DROP INDEX IF EXISTS idx_case_entity_lawyer_proposal;

-- Drop columns if they exist (ignoring their type)
ALTER TABLE case_entity DROP COLUMN IF EXISTS judge_id;
ALTER TABLE case_entity DROP COLUMN IF EXISTS lawyer_proposal_status;

-- Re-add with correct types
ALTER TABLE case_entity ADD COLUMN judge_id BIGINT;
ALTER TABLE case_entity ADD COLUMN lawyer_proposal_status VARCHAR(50);

-- Re-create indexes
CREATE INDEX idx_case_entity_judge_id ON case_entity(judge_id);
CREATE INDEX idx_case_entity_lawyer_proposal ON case_entity(lawyer_proposal_status);

-- Update comments
COMMENT ON COLUMN case_entity.lawyer_proposal_status IS 'Status of lawyer hiring proposal: PENDING, ACCEPTED, REJECTED';
COMMENT ON COLUMN case_entity.judge_id IS 'ID of the assigned judge (Long/BIGINT)';
