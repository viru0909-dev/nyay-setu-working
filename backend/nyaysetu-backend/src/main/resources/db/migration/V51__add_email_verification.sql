-- V51: Add email verification fields to ny_user
--
-- email_verified   : false until user clicks the verification link
-- verification_token : one-time UUID sent in the verification email; nulled after use
-- verification_token_expiry : token expires 24 hours after registration
--
-- Existing accounts (admin, judge, lawyer etc.) are marked verified so they
-- are not locked out. New registrations start with email_verified = false.

ALTER TABLE ny_user
    ADD COLUMN IF NOT EXISTS email_verified          BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS verification_token      VARCHAR(255) UNIQUE,
    ADD COLUMN IF NOT EXISTS verification_token_expiry TIMESTAMP;

-- Seed accounts and any pre-existing users are considered already verified
UPDATE ny_user SET email_verified = TRUE WHERE email_verified = FALSE;

-- Index for fast token lookup on the verify-email endpoint
CREATE INDEX IF NOT EXISTS idx_ny_user_verification_token ON ny_user(verification_token);