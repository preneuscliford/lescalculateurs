/**
 * Edge Function V2: Validation renforcee des feedbacks
 * Protection contre effacement des donnees client
 * 
 * Nouvelles protections:
 * 1. Rate limiting par IP (hashee, pas en clair)
 * 2. Detection de comportement suspect (heuristiques)
 * 3. Captcha conditionnel si suspect
 * 4. Timestamp serveur pour le delai de remplissage
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

// Configuration
const SUBMISSION_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h
const MIN_FILL_TIME_MS = 5000; // 5 secondes
const IP_RATE_LIMIT = 5; // Max 5 soumissions par IP par heure
const SUSPICIOUS_THRESHOLD = 3; // Score avant captcha

interface FeedbackRequest {
  profile_hash: string;
  simulator_type: string;
  obtention: string;
  delai?: string;
  controle: string;
  satisfaction?: number;
  fingerprint: string;
  honeypot?: string;
  form_start_time: number;
  captcha_token?: string; // reCAPTCHA v3 ou hCaptcha
}

/**
 * Hash une IP pour anonymisation
 */
async function hashIP(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + Deno.env.get('IP_SALT') || 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

/**
 * Detecte les comportements suspects
 */
function detectSuspiciousBehavior(
  req: Request,
  body: FeedbackRequest,
  recentFromIP: number
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  
  // 1. Trop de soumissions recentes depuis cette IP
  if (recentFromIP > IP_RATE_LIMIT) {
    score += 2;
    reasons.push('Trop de soumissions depuis cette IP');
  }
  
  // 2. User-Agent suspect (bot connu)
  const ua = req.headers.get('user-agent') || '';
  const botSignatures = ['bot', 'crawler', 'scraper', 'automation', 'selenium', 'puppeteer'];
  if (botSignatures.some(sig => ua.toLowerCase().includes(sig))) {
    score += 3;
    reasons.push('User-Agent suspect');
  }
  
  // 3. Pas de User-Agent
  if (!ua || ua.length < 20) {
    score += 2;
    reasons.push('User-Agent manquant ou trop court');
  }
  
  // 4. Fingerprint vide ou invalide
  if (!body.fingerprint || body.fingerprint.length < 4) {
    score += 2;
    reasons.push('Fingerprint invalide');
  }
  
  // 5. Temps de remplissage anormalement court
  const fillTime = Date.now() - body.form_start_time;
  if (fillTime < 2000) {
    score += 2;
    reasons.push('Temps de remplissage suspect');
  }
  
  // 6. Headers manquants (navigateur normal a toujours ces headers)
  const requiredHeaders = ['accept-language', 'accept'];
  for (const header of requiredHeaders) {
    if (!req.headers.get(header)) {
      score += 1;
      reasons.push(`Header ${header} manquant`);
    }
  }
  
  // 7. Pattern de soumission suspect (toujours les memes reponses)
  if (body.obtention === 'oui' && body.controle === 'non' && !body.satisfaction) {
    // Pattern tres basique, pourrait etre un bot
    score += 1;
  }
  
  return { score, reasons };
}

/**
 * Verifie un token reCAPTCHA v3
 */
async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const secret = Deno.env.get('RECAPTCHA_SECRET_KEY');
    if (!secret) {
      console.warn('RECAPTCHA_SECRET_KEY non configure');
      return true; // On laisse passer si pas configure
    }
    
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`,
    });
    
    const data = await response.json();
    
    // Score > 0.5 = humain probable
    return data.success && data.score > 0.5;
  } catch (error) {
    console.error('Erreur verification reCAPTCHA:', error);
    return false;
  }
}

serve(async (req) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Recuperer et hasher l'IP
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const ipHash = await hashIP(clientIP);

    // Parser le body
    const body: FeedbackRequest = await req.json();

    console.log('Validation feedback:', {
      profile: body.profile_hash.substring(0, 10) + '...',
      ip_hash: ipHash,
      simulator: body.simulator_type,
    });

    // ==================== VALIDATIONS ====================

    // 1. Honeypot
    if (body.honeypot && body.honeypot.trim() !== '') {
      return new Response(
        JSON.stringify({ valid: false, error: 'Spam detecte' }),
        { headers, status: 400 }
      );
    }

    // 2. Rate limiting par profil (24h)
    const { data: recentSubmissions } = await supabase
      .from('user_feedback')
      .select('created_at')
      .eq('profile_hash', body.profile_hash)
      .eq('simulator_type', body.simulator_type)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentSubmissions && recentSubmissions.length > 0) {
      const lastSubmission = new Date(recentSubmissions[0].created_at).getTime();
      const elapsed = Date.now() - lastSubmission;

      if (elapsed < SUBMISSION_COOLDOWN_MS) {
        const remaining = SUBMISSION_COOLDOWN_MS - elapsed;
        const hours = Math.ceil(remaining / (60 * 60 * 1000));

        return new Response(
          JSON.stringify({
            valid: false,
            error: `Vous avez deja partage votre experience. Reessayez dans ${hours}h.`,
            remaining_ms: remaining,
            code: 'RATE_LIMIT_PROFILE'
          }),
          { headers, status: 429 }
        );
      }
    }

    // 3. Rate limiting par IP (5/heure)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: ipSubmissions, error: ipError } = await supabase
      .from('ip_rate_limit')
      .select('*')
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo);

    if (ipError) {
      console.error('Erreur IP rate limit:', ipError);
    }

    const recentIPCount = ipSubmissions?.length || 0;

    if (recentIPCount >= IP_RATE_LIMIT) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Trop de soumissions depuis cette connexion. Attendez 1 heure.',
          code: 'RATE_LIMIT_IP'
        }),
        { headers, status: 429 }
      );
    }

    // 4. Detection de comportement suspect
    const suspicion = detectSuspiciousBehavior(req, body, recentIPCount);
    
    console.log('Score de suspicion:', suspicion.score, 'Raisons:', suspicion.reasons);

    // 5. Captcha si suspect
    if (suspicion.score >= SUSPICIOUS_THRESHOLD) {
      if (!body.captcha_token) {
        return new Response(
          JSON.stringify({
            valid: false,
            error: 'Verification requise',
            requires_captcha: true,
            suspicion_score: suspicion.score,
            code: 'CAPTCHA_REQUIRED'
          }),
          { headers, status: 403 }
        );
      }
      
      const captchaValid = await verifyRecaptcha(body.captcha_token);
      if (!captchaValid) {
        return new Response(
          JSON.stringify({
            valid: false,
            error: 'Verification invalide',
            code: 'CAPTCHA_INVALID'
          }),
          { headers, status: 403 }
        );
      }
    }

    // 6. Validation des donnees
    const validTypes = ['rsa', 'apl', 'aah', 'are', 'prime-activite'];
    if (!validTypes.includes(body.simulator_type)) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Type invalide' }),
        { headers, status: 400 }
      );
    }

    const validObtention = ['oui', 'refuse', 'en_cours', 'pas_demande'];
    if (!validObtention.includes(body.obtention)) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Reponse invalide' }),
        { headers, status: 400 }
      );
    }

    // 7. Enregistrer la soumission IP (pour rate limiting)
    await supabase.from('ip_rate_limit').insert({
      ip_hash: ipHash,
      profile_hash: body.profile_hash,
      suspicion_score: suspicion.score,
      user_agent: req.headers.get('user-agent')?.substring(0, 200),
    });

    // 8. Nettoyer les vieilles entrees IP (> 24h)
    await supabase
      .from('ip_rate_limit')
      .delete()
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Succes
    return new Response(
      JSON.stringify({
        valid: true,
        message: 'Validation reussie',
        suspicion_score: suspicion.score,
      }),
      { headers, status: 200 }
    );

  } catch (error) {
    console.error('Erreur validation:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Erreur serveur' }),
      { headers, status: 500 }
    );
  }
});
