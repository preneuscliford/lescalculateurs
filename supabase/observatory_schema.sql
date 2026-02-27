-- ============================================================================
-- OBSERVATOIRE COMMUNAUTAIRE - SCHEMA SUPABASE
-- ============================================================================
-- Ce script cree les tables necessaires pour le systeme d'observatoire
-- anonyme des simulateurs
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLE DES FEEDBACKS UTILISATEURS (donnees brutes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_hash TEXT NOT NULL,
    simulator_type TEXT NOT NULL CHECK (simulator_type IN ('rsa', 'apl', 'aah', 'are', 'prime-activite')),
    
    -- Reponses aux questions
    obtention TEXT NOT NULL CHECK (obtention IN ('oui', 'refuse', 'en_cours', 'pas_demande')),
    delai TEXT CHECK (delai IN ('moins_2_semaines', '2_4_semaines', '1_2_mois', 'plus_2_mois')),
    controle TEXT NOT NULL CHECK (controle IN ('oui', 'non')),
    satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5),
    commentaire TEXT,
    
    -- Metadonnees
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte d'unicite pour eviter les doublons
    CONSTRAINT idx_feedback_profile UNIQUE (profile_hash, simulator_type, created_at)
);

-- Index pour optimiser les requetes
CREATE INDEX IF NOT EXISTS idx_user_feedback_profile_hash ON user_feedback(profile_hash);
CREATE INDEX IF NOT EXISTS idx_user_feedback_simulator ON user_feedback(simulator_type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created ON user_feedback(created_at DESC);

-- Commentaires sur la table
COMMENT ON TABLE user_feedback IS 'Feedbacks anonymes des utilisateurs apres simulation';
COMMENT ON COLUMN user_feedback.profile_hash IS 'Hash SHA256 du profil (situation|revenus|logement|enfants)';

-- ----------------------------------------------------------------------------
-- 2. TABLE DES STATISTIQUES AGREGES (pre-calcul pour perfs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profile_stats (
    profile_hash TEXT NOT NULL,
    simulator_type TEXT NOT NULL,
    
    -- Compteurs
    total_responses INTEGER DEFAULT 0,
    approval_count INTEGER DEFAULT 0,
    refusal_count INTEGER DEFAULT 0,
    pending_count INTEGER DEFAULT 0,
    
    -- Taux calcules
    approval_rate DECIMAL(5,2) DEFAULT 0,
    avg_delay_days DECIMAL(5,1) DEFAULT 0,
    control_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Evolution
    last_7d_approval_rate DECIMAL(5,2) DEFAULT 0,
    last_30d_responses INTEGER DEFAULT 0,
    
    -- Metadonnees
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- Cle primaire composite
    PRIMARY KEY (profile_hash, simulator_type)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_profile_stats_simulator ON profile_stats(simulator_type);
CREATE INDEX IF NOT EXISTS idx_profile_stats_approval_rate ON profile_stats(approval_rate DESC);

COMMENT ON TABLE profile_stats IS 'Statistiques agregees par profil pour acces rapide';

-- ----------------------------------------------------------------------------
-- 3. FONCTION DE MISE A JOUR AUTOMATIQUE DES STATS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_total INTEGER;
    v_approvals INTEGER;
    v_refusals INTEGER;
    v_pending INTEGER;
    v_controls INTEGER;
    v_avg_delay DECIMAL(5,1);
    v_last_7d_approvals INTEGER;
    v_last_7d_total INTEGER;
BEGIN
    -- Calcul des statistiques pour ce profil
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE obtention = 'oui'),
        COUNT(*) FILTER (WHERE obtention = 'refuse'),
        COUNT(*) FILTER (WHERE obtention = 'en_cours'),
        COUNT(*) FILTER (WHERE controle = 'oui')
    INTO v_total, v_approvals, v_refusals, v_pending, v_controls
    FROM user_feedback
    WHERE profile_hash = NEW.profile_hash 
      AND simulator_type = NEW.simulator_type;
    
    -- Calcul delai moyen
    SELECT AVG(
        CASE delai
            WHEN 'moins_2_semaines' THEN 7
            WHEN '2_4_semaines' THEN 21
            WHEN '1_2_mois' THEN 45
            WHEN 'plus_2_mois' THEN 75
            ELSE 30
        END
    ) INTO v_avg_delay
    FROM user_feedback
    WHERE profile_hash = NEW.profile_hash 
      AND simulator_type = NEW.simulator_type
      AND delai IS NOT NULL;
    
    -- Stats des 7 derniers jours
    SELECT 
        COUNT(*) FILTER (WHERE obtention = 'oui'),
        COUNT(*)
    INTO v_last_7d_approvals, v_last_7d_total
    FROM user_feedback
    WHERE profile_hash = NEW.profile_hash 
      AND simulator_type = NEW.simulator_type
      AND created_at >= NOW() - INTERVAL '7 days';
    
    -- Insertion ou mise a jour
    INSERT INTO profile_stats (
        profile_hash, simulator_type,
        total_responses, approval_count, refusal_count, pending_count,
        approval_rate, avg_delay_days, control_rate,
        last_7d_approval_rate, last_30d_responses, last_updated
    ) VALUES (
        NEW.profile_hash, NEW.simulator_type,
        v_total, v_approvals, v_refusals, v_pending,
        CASE WHEN v_total > 0 THEN (v_approvals::DECIMAL / v_total) * 100 ELSE 0 END,
        COALESCE(v_avg_delay, 0),
        CASE WHEN v_total > 0 THEN (v_controls::DECIMAL / v_total) * 100 ELSE 0 END,
        CASE WHEN v_last_7d_total > 0 THEN (v_last_7d_approvals::DECIMAL / v_last_7d_total) * 100 
             WHEN v_total > 0 THEN (v_approvals::DECIMAL / v_total) * 100 ELSE 0 END,
        (SELECT COUNT(*) FROM user_feedback 
         WHERE profile_hash = NEW.profile_hash 
           AND simulator_type = NEW.simulator_type
           AND created_at >= NOW() - INTERVAL '30 days'),
        NOW()
    )
    ON CONFLICT (profile_hash, simulator_type) DO UPDATE SET
        total_responses = EXCLUDED.total_responses,
        approval_count = EXCLUDED.approval_count,
        refusal_count = EXCLUDED.refusal_count,
        pending_count = EXCLUDED.pending_count,
        approval_rate = EXCLUDED.approval_rate,
        avg_delay_days = EXCLUDED.avg_delay_days,
        control_rate = EXCLUDED.control_rate,
        last_7d_approval_rate = EXCLUDED.last_7d_approval_rate,
        last_30d_responses = EXCLUDED.last_30d_responses,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mise a jour automatique
DROP TRIGGER IF EXISTS trg_update_stats ON user_feedback;
CREATE TRIGGER trg_update_stats
    AFTER INSERT ON user_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_stats();

-- ----------------------------------------------------------------------------
-- 4. POLITIQUES RLS (ROW LEVEL SECURITY) - SECURITE
-- ----------------------------------------------------------------------------

-- Activer RLS sur toutes les tables
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_stats ENABLE ROW LEVEL SECURITY;

-- Politique: tout le monde peut lire les stats (anonyme)
CREATE POLICY "Stats visibles publiquement" ON profile_stats
    FOR SELECT USING (true);

-- Politique: tout le monde peut inserer un feedback (anonyme)
CREATE POLICY "Feedback inserable par tous" ON user_feedback
    FOR INSERT WITH CHECK (true);

-- Politique: lecture des feedbacks autorisee (pour calculs)
CREATE POLICY "Feedbacks lisibles pour stats" ON user_feedback
    FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- VERIFICATION
-- ----------------------------------------------------------------------------
SELECT 'Tables creees avec succes' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('user_feedback', 'profile_stats');
