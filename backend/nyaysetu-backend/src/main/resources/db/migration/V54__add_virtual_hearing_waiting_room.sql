ALTER TABLE hearing_participants
ADD COLUMN IF NOT EXISTS admission_status VARCHAR(20) NOT NULL DEFAULT 'INVITED';

ALTER TABLE hearing_participants
ADD COLUMN IF NOT EXISTS access_token_hash VARCHAR(64);

ALTER TABLE hearing_participants
ADD COLUMN IF NOT EXISTS access_token_expires_at TIMESTAMP;

ALTER TABLE hearing_participants
ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP;

ALTER TABLE hearing_participants
ADD COLUMN IF NOT EXISTS admitted_at TIMESTAMP;

ALTER TABLE hearing_participants
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;

UPDATE hearing_participants
SET admission_status = 'INVITED'
WHERE admission_status IS NULL;

CREATE INDEX IF NOT EXISTS idx_hearing_participants_admission_status
ON hearing_participants(hearing_id, admission_status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_hearing_participants_access_token_hash
ON hearing_participants(access_token_hash)
WHERE access_token_hash IS NOT NULL;