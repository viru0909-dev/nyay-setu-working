ALTER TABLE fir_records
ADD COLUMN investigation_details TEXT,
ADD COLUMN submitted_to_court_at TIMESTAMP,
ADD COLUMN is_submitted_to_court BOOLEAN DEFAULT FALSE;
