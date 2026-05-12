-- Add LegalTech compliance fields to evidence_records
ALTER TABLE evidence_records 
ADD COLUMN IF NOT EXISTS upload_ip VARCHAR(255);

-- Add LegalTech compliance fields to document table
ALTER TABLE document 
ADD COLUMN IF NOT EXISTS file_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS upload_ip VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE;

-- Add Source FIR ID to case_entity for Police Handover
ALTER TABLE case_entity
ADD COLUMN IF NOT EXISTS source_fir_id BIGINT;
