-- Create document_analysis table for AI-generated insights
CREATE TABLE IF NOT EXISTS document_analysis (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL UNIQUE,
    summary TEXT,
    legal_points TEXT,
    relevant_laws TEXT,
    important_dates TEXT,
    parties_involved TEXT,
    case_law_suggestions TEXT,
    suggested_category VARCHAR(50),
    risk_assessment TEXT,
    full_analysis_json TEXT,
    analyzed_at TIMESTAMP,
    analysis_success BOOLEAN,
    error_message TEXT,
    
    CONSTRAINT fk_document_analysis_document
        FOREIGN KEY (document_id)
        REFERENCES document(id)
        ON DELETE CASCADE
);

-- Add index for faster lookups
CREATE INDEX idx_document_analysis_document_id ON document_analysis(document_id);
CREATE INDEX idx_document_analysis_success ON document_analysis(analysis_success);
