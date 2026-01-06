-- Migration V26: Increase column lengths for case_entity
-- This ensures that AI-generated titles and descriptions (especially in Hindi) do not cause 500 errors

-- 1. Convert title from VARCHAR(255) to TEXT
ALTER TABLE case_entity ALTER COLUMN title TYPE TEXT;

-- 2. Convert petitioner and respondent to TEXT to handle long names or Hindi descriptions
ALTER TABLE case_entity ALTER COLUMN petitioner TYPE TEXT;
ALTER TABLE case_entity ALTER COLUMN respondent TYPE TEXT;

-- 3. Ensure description is TEXT (it was usually TEXT or VARCHAR(2000), but TEXT is safest)
ALTER TABLE case_entity ALTER COLUMN description TYPE TEXT;

-- Add comments
COMMENT ON COLUMN case_entity.title IS 'Title of the case (TEXT to support long/Hindi titles)';
COMMENT ON COLUMN case_entity.petitioner IS 'Name or description of the petitioner';
COMMENT ON COLUMN case_entity.respondent IS 'Name or description of the respondent';
