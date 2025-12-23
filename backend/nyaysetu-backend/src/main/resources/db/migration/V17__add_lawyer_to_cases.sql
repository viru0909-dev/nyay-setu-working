-- Add lawyer_id to case_entity table if not already present
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='case_entity' AND column_name='lawyer_id') THEN
        ALTER TABLE case_entity ADD COLUMN lawyer_id BIGINT REFERENCES ny_user(id);
    END IF;
END $$;

-- Create index for lawyer lookup if not already present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_case_entity_lawyer' AND n.nspname = 'public') THEN
        CREATE INDEX idx_case_entity_lawyer ON case_entity(lawyer_id);
    END IF;
END $$;
