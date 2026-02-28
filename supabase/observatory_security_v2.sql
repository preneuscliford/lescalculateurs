-- ============================================================================
-- SECURITE V2 - Protection contre effacement des donnees client
-- ============================================================================

-- 1. Table pour le rate limiting par IP (hashee)
CREATE TABLE IF NOT EXISTS ip_rate_limit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash TEXT NOT NULL,
    profile_hash TEXT NOT NULL,
    suspicion_score INTEGER DEFAULT 0,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_ip_rate_limit_hash ON ip_rate_limit(ip_hash);
CREATE INDEX IF NOT EXISTS idx_ip_rate_limit_created ON ip_rate_limit(created_at);

-- Commentaire
COMMENT ON TABLE ip_rate_limit IS 'Rate limiting par IP (hashee) - Supprimee automatiquement apres 24h';

-- 2. Politique RLS - Personne ne peut lire cette table (interne uniquement)
ALTER TABLE ip_rate_limit ENABLE ROW LEVEL SECURITY;

-- Pas de SELECT pour personne (usage interne uniquement via service_role)
-- Pas de INSERT/UPDATE/DELETE pour personne

-- 3. Fonction de nettoyage automatique (optionnel)
-- Supprime les entrees de plus de 24h toutes les heures
CREATE OR REPLACE FUNCTION cleanup_old_ip_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM ip_rate_limit
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 4. Configuration pour reCAPTCHA (stocker dans les secrets Supabase)
-- Aller dans: Project Settings > Secrets
-- Ajouter: RECAPTCHA_SECRET_KEY = votre_cle_secrete

-- 5. Variable d'environnement pour le salt IP (plus de securite)
-- Ajouter: IP_SALT = un_string_aleatoire_long

-- Verification
SELECT 
    'Table ip_rate_limit creee' as status,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_name = 'ip_rate_limit') as table_exists;
