-- Stores the previous customer field values before an edit so SUPERADMIN can revert.
ALTER TABLE customer ADD COLUMN IF NOT EXISTS prev_snapshot JSONB DEFAULT NULL;
