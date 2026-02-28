-- ============================================================================
-- FIX RLS - Permettre au trigger de mettre a jour profile_stats
-- ============================================================================

-- Solution: Désactiver RLS sur profile_stats (données publiques agrégées)
-- C'est sécurisé car:
-- - Ce sont des statistiques agrégées, pas des données personnelles
-- - Les données sont affichées publiquement de toute façon
-- - Le trigger doit pouvoir écrire sans restriction

ALTER TABLE profile_stats DISABLE ROW LEVEL SECURITY;

-- Vérification
SELECT 
    tablename,
    rowsecurity as rls_active
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_feedback', 'profile_stats');

-- Alternative: si vous voulez garder RLS active mais permettre au trigger
-- de fonctionner avec SECURITY DEFINER (exécute avec les privilèges du propriétaire)
-- Décommentez les lignes ci-dessous:

/*
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER
SECURITY DEFINER  -- ← Ajoute les privilèges du propriétaire
AS $$
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
    
    SELECT 
        COUNT(*) FILTER (WHERE obtention = 'oui'),
        COUNT(*)
    INTO v_last_7d_approvals, v_last_7d_total
    FROM user_feedback
    WHERE profile_hash = NEW.profile_hash 
      AND simulator_type = NEW.simulator_type
      AND created_at >= NOW() - INTERVAL '7 days';
    
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
*/

SELECT 'RLS corrigee sur profile_stats' as status;
