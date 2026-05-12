-- Migration V20: Forcefully fix judge_id type mismatch
-- This migration drops the UUID judge_id and recreates it as BIGINT
-- It also ensures lawyer_proposal_status exists

DO $$ 
BEGIN 
    -- 1. Handle lawyer_proposal_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='case_entity' AND column_name='lawyer_proposal_status') THEN
        ALTER TABLE case_entity ADD COLUMN lawyer_proposal_status VARCHAR(50);
    END IF;

    -- 2. Handle judge_id
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='case_entity' AND column_name='judge_id') THEN
        
        -- If it is already BIGINT/int8, we do nothing.
        -- If it is UUID, we must drop it because direct cast is complex.
        IF (SELECT data_type FROM information_schema.columns 
            WHERE table_name='case_entity' AND column_name='judge_id') <> 'bigint' THEN
            
            -- Drop dependent index first
            DROP INDEX IF EXISTS idx_case_entity_judge_id;
            
            -- Drop the problematic UUID column
            ALTER TABLE case_entity DROP COLUMN judge_id;
            
            -- Re-add as BIGINT
            ALTER TABLE case_entity ADD COLUMN judge_id BIGINT;
        END IF;
    ELSE
        -- Just add it if it doesn't exist at all
        ALTER TABLE case_entity ADD COLUMN judge_id BIGINT;
    END IF;
END $$;

-- Re-create index to be sure
CREATE INDEX IF NOT EXISTS idx_case_entity_judge_id ON case_entity(judge_id);
CREATE INDEX IF NOT EXISTS idx_case_entity_lawyer_proposal ON case_entity(lawyer_proposal_status);

-- Update comments
COMMENT ON COLUMN case_entity.lawyer_proposal_status IS 'Status of lawyer hiring proposal: PENDING, ACCEPTED, REJECTED';
COMMENT ON COLUMN case_entity.judge_id IS 'ID of the assigned judge (Long/BIGINT)';
