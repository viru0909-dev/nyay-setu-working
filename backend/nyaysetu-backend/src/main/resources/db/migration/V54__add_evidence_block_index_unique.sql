ALTER TABLE evidence_records
    ADD CONSTRAINT uq_evidence_case_block UNIQUE (case_id, block_index);
