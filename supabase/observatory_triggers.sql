-- ============================================================================
-- TRIGGERS ET FONCTIONS - A EXECUTER DANS SQL EDITOR
-- ============================================================================
-- Copie ce script dans: https://supabase.com/dashboard/project/bwabwcfyyipfllvmomzx/sql
-- ============================================================================

-- Fonction de mise a jour automatique des stats
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

-- Supprimer trigger existant si present
DROP TRIGGER IF EXISTS trg_update_stats ON user_feedback;

-- Creer le trigger
CREATE TRIGGER trg_update_stats
    AFTER INSERT ON user_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_stats();

-- Verification
SELECT 
    'Fonction et trigger crees avec succes' as status,
    (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'trg_update_stats') as trigger_count;
