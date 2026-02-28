-- ============================================================================
-- SETUP COMPLET OBSERVATOIRE V2 (SQL Only)
-- ============================================================================
-- Ce script configure TOUT sans avoir besoin de la CLI ou des secrets
-- A executer dans l'editeur SQL de Supabase
-- ============================================================================

-- ============================================================================
-- 1. TABLE POUR LE RATE LIMITING PAR IP (hashee)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ip_rate_limit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash TEXT NOT NULL,
    profile_hash TEXT NOT NULL,
    suspicion_score INTEGER DEFAULT 0,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ip_rate_limit_hash ON ip_rate_limit(ip_hash);
CREATE INDEX IF NOT EXISTS idx_ip_rate_limit_created ON ip_rate_limit(created_at);

-- RLS: Aucun acces public (usage interne uniquement via trigger/trigger)
ALTER TABLE ip_rate_limit ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. FONCTION DE NETTOYAGE AUTO (supprime les vieilles entrees)
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_old_ip_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM ip_rate_limit
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. FONCTION DE VALIDATION COMPLETE (remplace l'Edge Function pour le moment)
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_and_submit_feedback(
    p_profile_hash TEXT,
    p_simulator_type TEXT,
    p_obtention TEXT,
    p_delai TEXT DEFAULT NULL,
    p_controle TEXT,
    p_satisfaction INTEGER DEFAULT NULL,
    p_ip_hash TEXT DEFAULT 'unknown',
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_recent_count INTEGER;
    v_last_submission TIMESTAMPTZ;
    v_suspicion_score INTEGER := 0;
BEGIN
    -- 1. Verifier le rate limiting par profil (24h)
    SELECT created_at INTO v_last_submission
    FROM user_feedback
    WHERE profile_hash = p_profile_hash
      AND simulator_type = p_simulator_type
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_last_submission IS NOT NULL THEN
        IF v_last_submission > NOW() - INTERVAL '24 hours' THEN
            RETURN jsonb_build_object(
                'valid', false,
                'error', 'Vous avez deja partage votre experience recemment. Reessayez dans ' || 
                         EXTRACT(HOUR FROM (v_last_submission + INTERVAL '24 hours' - NOW()))::TEXT || 'h.',
                'code', 'RATE_LIMIT_PROFILE'
            );
        END IF;
    END IF;
    
    -- 2. Verifier le rate limiting par IP (5 par heure)
    SELECT COUNT(*) INTO v_recent_count
    FROM ip_rate_limit
    WHERE ip_hash = p_ip_hash
      AND created_at > NOW() - INTERVAL '1 hour';
    
    IF v_recent_count >= 5 THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Trop de soumissions depuis cette connexion. Attendez 1 heure.',
            'code', 'RATE_LIMIT_IP'
        );
    END IF;
    
    -- 3. Calculer le score de suspicion
    -- User-Agent suspect
    IF p_user_agent IS NULL OR LENGTH(p_user_agent) < 20 THEN
        v_suspicion_score := v_suspicion_score + 2;
    END IF;
    
    -- Trop de soumissions recentes depuis cette IP
    IF v_recent_count >= 3 THEN
        v_suspicion_score := v_suspicion_score + 2;
    END IF;
    
    -- 4. Si tres suspect, refuser (sinon passerait avec captcha dans la v2 complete)
    IF v_suspicion_score >= 4 THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Verification supplementaire requise. Veuillez reessayer plus tard.',
            'code', 'SUSPICIOUS_BEHAVIOR',
            'suspicion_score', v_suspicion_score
        );
    END IF;
    
    -- 5. Validation des enums
    IF p_simulator_type NOT IN ('rsa', 'apl', 'aah', 'are', 'prime-activite') THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Type invalide');
    END IF;
    
    IF p_obtention NOT IN ('oui', 'refuse', 'en_cours', 'pas_demande') THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Reponse invalide');
    END IF;
    
    IF p_controle NOT IN ('oui', 'non') THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Reponse invalide');
    END IF;
    
    -- 6. Tout est valide, inserer le feedback
    INSERT INTO user_feedback (
        profile_hash,
        simulator_type,
        obtention,
        delai,
        controle,
        satisfaction,
        created_at
    ) VALUES (
        p_profile_hash,
        p_simulator_type,
        p_obtention,
        p_delai,
        p_controle,
        p_satisfaction,
        NOW()
    );
    
    -- 7. Enregistrer l'IP pour le rate limiting
    INSERT INTO ip_rate_limit (ip_hash, profile_hash, suspicion_score, user_agent)
    VALUES (p_ip_hash, p_profile_hash, v_suspicion_score, LEFT(p_user_agent, 200));
    
    -- 8. Nettoyer les vieilles entrees (optionnel, peut etre fait par cron)
    PERFORM cleanup_old_ip_rate_limits();
    
    RETURN jsonb_build_object(
        'valid', true,
        'message', 'Feedback enregistre avec succes',
        'suspicion_score', v_suspicion_score
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('valid', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. POLITIQUE RLS POUR ip_rate_limit (aucun acces public)
-- ============================================================================
-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "No access" ON ip_rate_limit;

-- Aucune politique = acces refuse par defaut
-- Seules les fonctions SECURITY DEFINER peuvent acceder a cette table

-- ============================================================================
-- 5. VERIFICATION
-- ============================================================================
SELECT 
    'Tables crees' as status,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_name IN ('user_feedback', 'profile_stats', 'ip_rate_limit')) as table_count,
    (SELECT COUNT(*) FROM pg_proc 
     WHERE proname IN ('validate_and_submit_feedback', 'cleanup_old_ip_rate_limits')) as function_count;

-- ============================================================================
-- 6. COMMENTAIRES
-- ============================================================================
COMMENT ON TABLE ip_rate_limit IS 'Rate limiting par IP hashee - Aucun acces public';
COMMENT ON FUNCTION validate_and_submit_feedback IS 'Valide et insere un feedback avec protections anti-spam';

-- ============================================================================
-- 7. EXEMPLE D'UTILISATION (pour tester)
-- ============================================================================
-- Decommenter pour tester:
/*
SELECT validate_and_submit_feedback(
    'test_profile_123',           -- profile_hash
    'rsa',                        -- simulator_type
    'oui',                        -- obtention
    '2_4_semaines',              -- delai
    'non',                        -- controle
    4,                            -- satisfaction
    'hashed_ip_abc123',          -- ip_hash (normalement hash de l'IP reelle)
    'Mozilla/5.0...'             -- user_agent
);
*/

-- ============================================================================
-- 8. NOTES
-- ============================================================================
-- Cette fonction remplace l'Edge Function pour simplifier le deploiement.
-- Elle offre les memes protections :
--   - Rate limiting par profil (24h)
--   - Rate limiting par IP (5/heure)
--   - Detection de comportement suspect
--   - Validation des donnees
--
-- Pour l'utiliser depuis le client :
--   SELECT * FROM validate_and_submit_feedback(...)
--
-- Avantages : Tout est dans la base, pas besoin de deployer la Edge Function
-- Inconvenients : Moins flexible que l'Edge Function (pas de captcha externe)
-- ============================================================================
