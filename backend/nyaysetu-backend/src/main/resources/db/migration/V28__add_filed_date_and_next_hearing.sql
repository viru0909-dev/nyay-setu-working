-- Migration V28: Add missing date/time columns to case_entity
-- Fixes 500 Error caused by missing fields expected by JPA Entity: filedDate, nextHearing

DO $$ 
BEGIN 
    -- Check and add filed_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='case_entity' AND column_name='filed_date') THEN
        ALTER TABLE case_entity ADD COLUMN filed_date TIMESTAMP;
    END IF;

    -- Check and add next_hearing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='case_entity' AND column_name='next_hearing') THEN
        ALTER TABLE case_entity ADD COLUMN next_hearing TIMESTAMP;
    END IF;
END $$;

COMMENT ON COLUMN case_entity.filed_date IS 'Date when the case was officially filed';
COMMENT ON COLUMN case_entity.next_hearing IS 'Scheduled date and time for the next hearing';
