-- Add auth_provider and provider_id to support Google SSO
ALTER TABLE ny_user ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'LOCAL';
ALTER TABLE ny_user ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);

-- Make password nullable since SSO users won't have a password
ALTER TABLE ny_user ALTER COLUMN password DROP NOT NULL;
