-- Document version history for legal document comparison (Issue #560)
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP,
    file_hash VARCHAR(64),
    is_verified BOOLEAN DEFAULT TRUE,
    notes TEXT,
    CONSTRAINT fk_document_versions_document
        FOREIGN KEY (document_id) REFERENCES document(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id
    ON document_versions(document_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_document_versions_doc_version
    ON document_versions(document_id, version_number);
