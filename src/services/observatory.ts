/**
 * Service d'observatoire communautaire
 * Gestion des feedbacks utilisateurs et statistiques agrégées
 * Compatible MCP Supabase
 */

import type { UserFeedback, ProfileStats, GlobalObservatoryStats } from '../types/observatory';

// Configuration Supabase (fallback si MCP non disponible)
const SUPABASE_URL = 'https://bwabwcfyyipfllvmomzx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fcagbgnkhDEi_HNDu9OYSw_JDk4ztBg';

// Détecter si MCP est disponible
declare const mcp: {
  supabase?: {
    query: (sql: string, params?: any[]) => Promise<any>;
    insert: (table: string, data: any) => Promise<any>;
    update: (table: string, data: any, where: string) => Promise<any>;
  }
};

const useMCP = typeof mcp !== 'undefined' && mcp.supabase;

// Hash simple d'un profil (pour anonymisation)
export async function generateProfileHash(profile: {
  situation: string;
  revenus: string;
  logement: string;
  enfants: number;
}): Promise<string> {
  const str = `${profile.situation}|${profile.revenus}|${profile.logement}|${profile.enfants}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

// Soumettre un feedback
export async function submitFeedback(
  feedback: Omit<UserFeedback, 'id' | 'created_at'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      ...feedback,
      created_at: new Date().toISOString(),
    };

    if (useMCP) {
      await mcp.supabase!.insert('user_feedback', payload);
    } else {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/user_feedback`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
    }

    // Mettre à jour les stats agrégées
    await updateProfileStats(feedback.profile_hash, feedback.simulator_type);

    return { success: true };
  } catch (error) {
    console.error('Erreur soumission feedback:', error);
    return { success: false, error: String(error) };
  }
}

// Récupérer les stats pour un profil
export async function getProfileStats(
  profileHash: string,
  simulatorType: string
): Promise<ProfileStats | null> {
  try {
    let data;

    if (useMCP) {
      const result = await mcp.supabase!.query(
        'SELECT * FROM profile_stats WHERE profile_hash = $1 AND simulator_type = $2',
        [profileHash, simulatorType]
      );
      data = result;
    } else {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/profile_stats?profile_hash=eq.${profileHash}&simulator_type=eq.${simulatorType}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) throw new Error('Erreur récupération stats');
      data = await response.json();
    }

    return data[0] || null;
  } catch (error) {
    console.error('Erreur récupération stats profil:', error);
    return null;
  }
}

// Calculer les stats à la volée (fallback si table stats pas à jour)
export async function calculateProfileStats(
  profileHash: string,
  simulatorType: string
): Promise<ProfileStats | null> {
  try {
    let feedbacks: UserFeedback[];

    if (useMCP) {
      feedbacks = await mcp.supabase!.query(
        'SELECT * FROM user_feedback WHERE profile_hash = $1 AND simulator_type = $2',
        [profileHash, simulatorType]
      );
    } else {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/user_feedback?profile_hash=eq.${profileHash}&simulator_type=eq.${simulatorType}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) throw new Error('Erreur calcul stats');
      feedbacks = await response.json();
    }
    
    if (feedbacks.length === 0) return null;

    // Calcul des stats
    const total = feedbacks.length;
    const approvals = feedbacks.filter(f => f.obtention === 'oui').length;
    const refusals = feedbacks.filter(f => f.obtention === 'refuse').length;
    const controls = feedbacks.filter(f => f.controle === 'oui').length;

    // Calcul délai moyen
    const delaiMap: Record<string, number> = {
      'moins_2_semaines': 7,
      '2_4_semaines': 21,
      '1_2_mois': 45,
      'plus_2_mois': 75,
    };
    
    const delais = feedbacks
      .filter(f => f.delai)
      .map(f => delaiMap[f.delai!] || 30);
    
    const avgDelay = delais.length > 0 
      ? Math.round(delais.reduce((a, b) => a + b, 0) / delais.length)
      : 0;

    // Stats des 7 derniers jours
    const last7d = feedbacks.filter(f => {
      const date = new Date(f.created_at || '');
      const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });

    return {
      profile_hash: profileHash,
      simulator_type: simulatorType,
      total_responses: total,
      approval_count: approvals,
      refusal_count: refusals,
      pending_count: feedbacks.filter(f => f.obtention === 'en_cours').length,
      approval_rate: Math.round((approvals / total) * 100),
      avg_delay_days: avgDelay,
      control_rate: Math.round((controls / total) * 100),
      last_7d_approval_rate: last7d.length > 0
        ? Math.round((last7d.filter(f => f.obtention === 'oui').length / last7d.length) * 100)
        : Math.round((approvals / total) * 100),
      last_30d_responses: feedbacks.filter(f => {
        const date = new Date(f.created_at || '');
        const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= 30;
      }).length,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Erreur calcul stats profil:', error);
    return null;
  }
}

// Mettre à jour les stats agrégées (appelé après chaque feedback)
async function updateProfileStats(profileHash: string, simulatorType: string): Promise<void> {
  const stats = await calculateProfileStats(profileHash, simulatorType);
  if (!stats) return;

  try {
    if (useMCP) {
      await mcp.supabase!.query(
        `INSERT INTO profile_stats (profile_hash, simulator_type, total_responses, approval_count, refusal_count, pending_count, approval_rate, avg_delay_days, control_rate, last_7d_approval_rate, last_30d_responses, last_updated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (profile_hash, simulator_type) 
         DO UPDATE SET total_responses = EXCLUDED.total_responses, approval_count = EXCLUDED.approval_count, refusal_count = EXCLUDED.refusal_count, pending_count = EXCLUDED.pending_count, approval_rate = EXCLUDED.approval_rate, avg_delay_days = EXCLUDED.avg_delay_days, control_rate = EXCLUDED.control_rate, last_7d_approval_rate = EXCLUDED.last_7d_approval_rate, last_30d_responses = EXCLUDED.last_30d_responses, last_updated = EXCLUDED.last_updated`,
        [stats.profile_hash, stats.simulator_type, stats.total_responses, stats.approval_count, stats.refusal_count, stats.pending_count, stats.approval_rate, stats.avg_delay_days, stats.control_rate, stats.last_7d_approval_rate, stats.last_30d_responses, stats.last_updated]
      );
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/profile_stats`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(stats),
      });
    }
  } catch (error) {
    console.error('Erreur mise à jour stats:', error);
  }
}

// Vérifier si l'utilisateur a déjà donné son avis pour ce profil
export async function hasUserFeedback(
  profileHash: string,
  simulatorType: string
): Promise<boolean> {
  try {
    let count;

    if (useMCP) {
      const result = await mcp.supabase!.query(
        'SELECT COUNT(*) as count FROM user_feedback WHERE profile_hash = $1 AND simulator_type = $2',
        [profileHash, simulatorType]
      );
      count = result[0]?.count || 0;
    } else {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/user_feedback?profile_hash=eq.${profileHash}&simulator_type=eq.${simulatorType}&select=id&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) return false;
      const data = await response.json();
      count = data.length;
    }

    return count > 0;
  } catch {
    return false;
  }
}

// Obtenir le nombre total de feedbacks
export async function getTotalFeedbackCount(simulatorType: string): Promise<number> {
  try {
    if (useMCP) {
      const result = await mcp.supabase!.query(
        'SELECT COUNT(*) as count FROM user_feedback WHERE simulator_type = $1',
        [simulatorType]
      );
      return result[0]?.count || 0;
    } else {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/user_feedback?simulator_type=eq.${simulatorType}&select=id`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) return 0;
      const data = await response.json();
      return data.length;
    }
  } catch {
    return 0;
  }
}

// Obtenir les stats globales
export async function getGlobalStats(simulatorType: string): Promise<{
  total_interactions: number;
  approval_rate: number;
  avg_delay: number;
  control_rate: number;
} | null> {
  try {
    let feedbacks: UserFeedback[];

    if (useMCP) {
      feedbacks = await mcp.supabase!.query(
        'SELECT obtention, delai, controle FROM user_feedback WHERE simulator_type = $1',
        [simulatorType]
      );
    } else {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/user_feedback?simulator_type=eq.${simulatorType}&select=obtention,delai,controle`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      feedbacks = await response.json();
    }

    if (feedbacks.length === 0) return null;

    const total = feedbacks.length;
    const approvals = feedbacks.filter(f => f.obtention === 'oui').length;
    const controls = feedbacks.filter(f => f.controle === 'oui').length;

    const delaiMap: Record<string, number> = {
      'moins_2_semaines': 7,
      '2_4_semaines': 21,
      '1_2_mois': 45,
      'plus_2_mois': 75,
    };

    const delais = feedbacks
      .filter(f => f.delai)
      .map(f => delaiMap[f.delai!] || 30);

    return {
      total_interactions: total,
      approval_rate: Math.round((approvals / total) * 100),
      avg_delay: delais.length > 0 
        ? Math.round(delais.reduce((a, b) => a + b, 0) / delais.length)
        : 0,
      control_rate: Math.round((controls / total) * 100),
    };
  } catch (error) {
    console.error('Erreur récupération stats globales:', error);
    return null;
  }
}
