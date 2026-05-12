ALTER TABLE case_messages ADD COLUMN type VARCHAR(50) DEFAULT 'TEXT';
ALTER TABLE case_messages ADD COLUMN attachment_url TEXT;
