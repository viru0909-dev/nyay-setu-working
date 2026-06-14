-- Unify CaseEvidence with the primary CaseEntity mapping.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'case_evidence'
          AND column_name = 'legal_case_id'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'case_evidence'
          AND column_name = 'case_id'
    ) THEN
        ALTER TABLE case_evidence
            RENAME COLUMN legal_case_id TO case_id;
    END IF;
END $$;

ALTER TABLE case_evidence
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE evidence_records
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_case_evidence_case_id
    ON case_evidence(case_id);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM case_evidence ce
        LEFT JOIN case_entity c ON c.id = ce.case_id
        WHERE ce.case_id IS NOT NULL
          AND c.id IS NULL
    ) THEN
        RAISE EXCEPTION
            'Cannot add case_evidence foreign key: orphaned case_id values exist';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_case_evidence_case'
    ) THEN
        ALTER TABLE case_evidence
            ADD CONSTRAINT fk_case_evidence_case
            FOREIGN KEY (case_id)
            REFERENCES case_entity(id)
            ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE case_evidence
    ALTER COLUMN case_id SET NOT NULL;