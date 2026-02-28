/**
 * Service d'observatoire V2 - Avec protections renforcees serveur
 * Gestion du captcha et validation cote serveur
 */

import type { UserFeedback, ProfileStats } from '../types/observatory';

const SUPABASE_URL = 'https://bwabwcfyyipfllvmomzx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fcagbgnkhDEi_HNDu9OYSw_JDk4ztBg';
const VALIDATE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/validate-feedback`;

// Re-export des fonctions utiles de V1
export { generateProfileHash, getProfileStats, getGlobalStats } from './observatory';

interface ValidationResponse {
  valid: boolean;
  error?: string;
  requires_captcha?: boolean;
  suspicion_score?: number;
  code?: string;
}

/**
 * Soumettre un feedback avec protection V2
 * Gere automatiquement le captcha si necessaire
 */
export async function submitFeedbackV2(
  feedback: Omit<UserFeedback, 'id' | 'created_at'>,
  validationData: {
    fingerprint: string;
    honeypot?: string;
    form_start_time: number;
    captchaToken?: string;
  }
): Promise<{ 
  success: boolean; 
  error?: string;
  requiresCaptcha?: boolean;
}> {
  try {
    // 1. Validation via Edge Function V2
    const validateResponse = await fetch(VALIDATE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        ...feedback,
        ...validationData,
        captcha_token: validationData.captchaToken,
      }),
    });

    const validation: ValidationResponse = await validateResponse.json();

    // Captcha requis
    if (!validation.valid && validation.requires_captcha) {
      return {
        success: false,
        error: 'Verification requise pour continuer',
        requiresCaptcha: true,
      };
    }

    // Autre erreur de validation
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Validation echouee',
      };
    }

    // 2. Insertion dans la base
    const payload = {
      ...feedback,
      created_at: new Date().toISOString(),
    };

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

    return { success: true };

  } catch (error) {
    console.error('Erreur soumission feedback V2:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Charge le script reCAPTCHA v3
 * A appeler au chargement de la page si vous voulez utiliser reCAPTCHA
 */
export function loadRecaptcha(siteKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="recaptcha/api.js"]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.head.appendChild(script);
  });
}

/**
 * Execute reCAPTCHA v3 et retourne le token
 */
export async function executeRecaptcha(action: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!(window as any).grecaptcha) {
      reject(new Error('reCAPTCHA not loaded'));
      return;
    }

    (window as any).grecaptcha.ready(() => {
      (window as any).grecaptcha
        .execute('YOUR_SITE_KEY', { action })
        .then((token: string) => resolve(token))
        .catch((err: any) => reject(err));
    });
  });
}

// Declaration pour TypeScript
declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}
