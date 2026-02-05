-- Add visibility level to documents for access control
ALTER TABLE document 
ADD COLUMN visibility_level VARCHAR(50) DEFAULT 'PUBLIC';

-- PUBLIC: Visible to all parties (court orders, judgments)
-- RESTRICTED: Only visible to uploader, their lawyer, and judge
-- SEALED: Only visible to judge

COMMENT ON COLUMN document.visibility_level IS 'Access control: PUBLIC, RESTRICTED, SEALED';
