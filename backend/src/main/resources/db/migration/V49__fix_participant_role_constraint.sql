-- Fix the hearing_participants role constraint to match ParticipantRole enum
-- The enum has LITIGANT but the constraint had CLIENT

ALTER TABLE hearing_participants 
DROP CONSTRAINT IF EXISTS valid_participant_role;

ALTER TABLE hearing_participants 
ADD CONSTRAINT valid_participant_role CHECK (role IN ('JUDGE', 'LITIGANT', 'LAWYER', 'DEFENDANT'));
