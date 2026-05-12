-- Add respondent contact details and identification status to cases table
ALTER TABLE case_entity 
ADD COLUMN respondent_email VARCHAR(255),
ADD COLUMN respondent_phone VARCHAR(50),
ADD COLUMN respondent_address TEXT,
ADD COLUMN respondent_identified BOOLEAN DEFAULT FALSE;
