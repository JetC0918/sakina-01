-- Index for journal entries by user and date (used in all list queries)
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_created 
ON journal_entries(user_id, created_at DESC);

-- Index for interventions by user and date
CREATE INDEX IF NOT EXISTS idx_intervention_logs_user_created 
ON intervention_logs(user_id, created_at DESC);

-- Index for journal entries mood filter
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_mood 
ON journal_entries(user_id, mood);
