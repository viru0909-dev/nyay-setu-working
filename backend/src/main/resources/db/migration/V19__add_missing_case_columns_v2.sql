-- Migration V19: Add missing columns to case_entity with robust checks
-- This handles cases where columns might have been partially added in failed attempts
-- And ensures correct data types for judge_id

DO $$ 
BEGIN 
    -- Add lawyer_proposal_status if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='case_entity' AND column_name='lawyer_proposal_status') THEN
        ALTER TABLE case_entity ADD COLUMN lawyer_proposal_status VARCHAR(50);
    END IF;

    -- Add or fix judge_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='case_entity' AND column_name='judge_id') THEN
        ALTER TABLE case_entity ADD COLUMN judge_id BIGINT;
    ELSE
        -- If it exists but is UUID (which caused the error), we need to change it
        -- We'll drop and recreate it to be safe since UUID to BIGINT conversion isn't direct
        IF (SELECT data_type FROM information_schema.columns 
            WHERE table_name='case_entity' AND column_name='judge_id') = 'uuid' THEN
            ALTER TABLE case_entity DROP COLUMN judge_id;
            ALTER TABLE case_entity ADD COLUMN judge_id BIGINT;
        END IF;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_case_entity_lawyer_proposal ON case_entity(lawyer_proposal_status);
CREATE INDEX IF NOT EXISTS idx_case_entity_judge_id ON case_entity(judge_id);

-- Update comments
COMMENT ON COLUMN case_entity.lawyer_proposal_status IS 'Status of lawyer hiring proposal: PENDING, ACCEPTED, REJECTED';
COMMENT ON COLUMN case_entity.judge_id IS 'ID of the assigned judge (Long/BIGINT)';
