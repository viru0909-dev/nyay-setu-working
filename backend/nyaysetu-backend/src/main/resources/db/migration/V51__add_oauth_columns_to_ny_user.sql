ALTER TABLE ny_user
ADD COLUMN auth_provider VARCHAR(50);

ALTER TABLE ny_user
ADD COLUMN provider_id VARCHAR(255);