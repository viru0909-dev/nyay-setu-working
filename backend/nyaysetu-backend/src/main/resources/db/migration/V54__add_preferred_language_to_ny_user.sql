-- Issue #1629: Persist the litigant's interface language with their account so it
-- survives a new device or a cleared browser, instead of living only in localStorage.
-- Values are BCP-47 base codes ('en', 'hi', 'mr', 'ta', 'te'); NULL means "not chosen
-- yet", which lets the frontend keep using browser detection for existing users.
ALTER TABLE ny_user ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(8);
