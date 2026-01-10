-- Migration V27: Add missing assigned_judge column to case_entity
-- This fixes the 500 Error: ERROR: column "assigned_judge" of relation "case_entity" does not exist

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='case_entity' AND column_name='assigned_judge') THEN
        ALTER TABLE case_entity ADD COLUMN assigned_judge VARCHAR(255);
    END IF;
END $$;

COMMENT ON COLUMN case_entity.assigned_judge IS 'Name or identifier of the assigned judge (String variant)';
