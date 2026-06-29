-- Issue #1313: Add hash chaining columns to audit_log for tamper detection.
-- previous_hash: stores the entryHash of the preceding row (genesis rows store 64 zeros).
-- entry_hash:    SHA-256 of this row's data concatenated with previous_hash.
-- Nullable to preserve backward compatibility with existing rows.
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS previous_hash VARCHAR(64);
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS entry_hash VARCHAR(64);