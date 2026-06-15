-- Migration to add deleted_at column to ny_user for soft deletes
ALTER TABLE ny_user ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
