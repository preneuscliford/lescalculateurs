-- ============================================================================
-- OBSERVATOIRE COMMUNAUTAIRE - VERSION SIMPLIFIEE (sans triggers)
-- ============================================================================
-- Execute ce script via l'API ou SQL Editor
-- Les triggers seront ajoutes separement
-- ============================================================================

-- 1. TABLE DES FEEDBACKS
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_hash TEXT NOT NULL,
    simulator_type TEXT NOT NULL,
    obtention TEXT NOT NULL,
    delai TEXT,
    controle TEXT NOT NULL,
    satisfaction INTEGER,
    commentaire TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE DES STATS AGREGES
CREATE TABLE IF NOT EXISTS profile_stats (
    profile_hash TEXT NOT NULL,
    simulator_type TEXT NOT NULL,
    total_responses INTEGER DEFAULT 0,
    approval_count INTEGER DEFAULT 0,
    refusal_count INTEGER DEFAULT 0,
    pending_count INTEGER DEFAULT 0,
    approval_rate DECIMAL(5,2) DEFAULT 0,
    avg_delay_days DECIMAL(5,1) DEFAULT 0,
    control_rate DECIMAL(5,2) DEFAULT 0,
    last_7d_approval_rate DECIMAL(5,2) DEFAULT 0,
    last_30d_responses INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (profile_hash, simulator_type)
);

-- 3. INDEX
CREATE INDEX IF NOT EXISTS idx_user_feedback_profile_hash ON user_feedback(profile_hash);
CREATE INDEX IF NOT EXISTS idx_user_feedback_simulator ON user_feedback(simulator_type);
CREATE INDEX IF NOT EXISTS idx_profile_stats_simulator ON profile_stats(simulator_type);

-- 4. RLS (Row Level Security)
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_stats ENABLE ROW LEVEL SECURITY;

-- Politique: insertion publique
DROP POLICY IF EXISTS "Feedback inserable par tous" ON user_feedback;
CREATE POLICY "Feedback inserable par tous" ON user_feedback
    FOR INSERT WITH CHECK (true);

-- Politique: lecture publique  
DROP POLICY IF EXISTS "Feedbacks lisibles" ON user_feedback;
CREATE POLICY "Feedbacks lisibles" ON user_feedback
    FOR SELECT USING (true);

-- Politique: stats visibles publiquement
DROP POLICY IF EXISTS "Stats visibles publiquement" ON profile_stats;
CREATE POLICY "Stats visibles publiquement" ON profile_stats
    FOR SELECT USING (true);

SELECT 'Tables creees avec succes' as status;
