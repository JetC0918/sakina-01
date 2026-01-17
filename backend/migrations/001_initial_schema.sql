-- ═══════════════════════════════════════════════════════════════════════════════
-- Sakina Database Migration
-- Run this in Supabase SQL Editor to set up the database schema
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ═══════════════════════════════════════════════════════════════════════════════
-- Users Table
-- Syncs with Supabase Auth (auth.users)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    locale VARCHAR(5) DEFAULT 'en',
    theme VARCHAR(10) DEFAULT 'light',
    subscription VARCHAR(10) DEFAULT 'free',
    nudge_enabled BOOLEAN DEFAULT true,
    daily_reminder BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- Journal Entries Table
-- Stores user journal entries with AI analysis results
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Entry content
    entry_type VARCHAR(10) DEFAULT 'text',
    content TEXT NOT NULL,
    mood VARCHAR(20) NOT NULL,
    
    -- AI Analysis results (populated after creation)
    stress_score INTEGER CHECK (stress_score >= 0 AND stress_score <= 100),
    emotional_tone VARCHAR(50),
    key_themes TEXT[],
    suggested_intervention VARCHAR(20),
    supportive_message TEXT,
    analyzed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- Intervention Logs Table
-- Tracks completed or attempted wellness exercises
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS intervention_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Intervention details
    intervention_type VARCHAR(20) NOT NULL,
    subtype VARCHAR(50),
    trigger_reason VARCHAR(100),
    
    -- Session metrics
    duration_seconds INTEGER NOT NULL,
    completed BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- Indexes for Performance
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_user_created ON journal_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intervention_user_id ON intervention_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_intervention_created_at ON intervention_logs(created_at DESC);


-- ═══════════════════════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- Ensures users can only access their own data
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Intervention logs policies
CREATE POLICY "Users can view own intervention logs" ON intervention_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intervention logs" ON intervention_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- Trigger: Auto-create user profile on signup
-- Creates a row in public.users when a new auth.users row is created
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════════════════════
-- Trigger: Auto-update updated_at timestamp
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════════════════════
-- Service Role Policies (for backend access)
-- Allows the service role to bypass RLS for backend operations
-- ═══════════════════════════════════════════════════════════════════════════════

-- Grant service role full access
CREATE POLICY "Service role has full access to users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to journal_entries" ON journal_entries
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to intervention_logs" ON intervention_logs
    FOR ALL USING (auth.role() = 'service_role');


-- ═══════════════════════════════════════════════════════════════════════════════
-- Verification: Check tables were created
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('users', 'journal_entries', 'intervention_logs');
