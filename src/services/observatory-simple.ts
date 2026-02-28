/**
 * Service d'observatoire SIMPLIFIE
 * Utilise la fonction SQL directement (pas besoin d'Edge Function)
 * Toutes les protections sont cote serveur
 */

import type { UserFeedback, ProfileStats } from '../types/observatory';

const SUPABASE_URL = 'https://bwabwcfyyipfllvmomzx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fcagbgnkhDEi_HNDu9OYSw_JDk4ztBg';

// Re-export des fonctions de base
export { generateProfileHash } from './observatory';
export {
  validateSubmission,
  recordSubmission,
  canSubmit,
  getTimeRemaining,
  resetProtection,
  startFormTimer,
  checkHoneypot,
  generateFingerprint,
} from './spamProtection';

/**
 * Soumettre un feedback via la fonction SQL securisee
 * Les protections (rate limiting, validation) sont gerees par la base
 */
export async function submitFeedbackSafe(
  feedback: Omit<UserFeedback, 'id' | 'created_at'>,
  validationData: {
    fingerprint: string;
    honeypot?: string;
    form_start_time: number;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Validation cote client d'abord
    if (validationData.honeypot && validationData.honeypot.trim() !== '') {
      return { success: false, error: 'Spam detecte' };
    }

    const fillTime = Date.now() - validationData.form_start_time;
    if (fillTime < 5000) {
      return { success: false, error: 'Soumission trop rapide' };
    }

    // 2. Generer un hash d'IP simple (pour le rate limiting)
    // Note: Ce n'est pas l'IP reelle, mais un identifiant de session
    const ipHash = await generateSimpleIPHash(validationData.fingerprint);

    // 3. Appeler la fonction SQL directement
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_feedback_safe`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_profile_hash: feedback.profile_hash,
        p_simulator_type: feedback.simulator_type,
        p_obtention: feedback.obtention,
        p_delai: feedback.delai || null,
        p_controle: feedback.controle,
        p_satisfaction: feedback.satisfaction || null,
        p_ip_hash: ipHash,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur SQL:', errorText);
      return { success: false, error: 'Erreur serveur' };
    }

    const result = await response.json();

    if (!result.valid) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur soumission:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Genere un hash simple pour l'IP/session
 * Combine le fingerprint avec un salt temporel
 */
async function generateSimpleIPHash(fingerprint: string): Promise<string> {
  const data = fingerprint + new Date().toISOString().split('T')[0]; // Change chaque jour
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  
  // Utiliser une somme simple si crypto.subtle pas disponible
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  }
  
  // Fallback simple
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).substring(0, 16);
}

// Fonctions de stats (re-exportees)
export async function getProfileStats(
  profileHash: string,
  simulatorType: string
): Promise<ProfileStats | null> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/profile_stats?profile_hash=eq.${profileHash}&simulator_type=eq.${simulatorType}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
}

export async function getTotalFeedbackCount(simulatorType: string): Promise<number> {
  try {
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
  } catch {
    return 0;
  }
}
