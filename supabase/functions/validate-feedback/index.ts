/**
 * Edge Function: Validation des feedbacks observatoire
 * Double sécurité côté serveur (rate limiting + validation)
 * 
 * Deploy: supabase functions deploy validate-feedback
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuration
const SUBMISSION_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h
const MIN_FILL_TIME_MS = 5000; // 5 secondes

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

    // Parser le body
    const body: FeedbackRequest = await req.json();

    // 1. Vérifier le honeypot
    if (body.honeypot && body.honeypot.trim() !== '') {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Spam détecté' 
        }),
        { headers, status: 400 }
      );
    }

    // 2. Vérifier le temps de remplissage minimum
    const fillTime = Date.now() - body.form_start_time;
    if (fillTime < MIN_FILL_TIME_MS) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Soumission trop rapide' 
        }),
        { headers, status: 429 }
      );
    }

    // 3. Rate limiting: vérifier si déjà soumis récemment
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
            error: `Vous avez déjà partagé votre expérience. Réessayez dans ${hours}h.`,
            remaining_ms: remaining,
          }),
          { headers, status: 429 }
        );
      }
    }

    // 4. Vérifier la validité des données
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
        JSON.stringify({ valid: false, error: 'Réponse invalide' }),
        { headers, status: 400 }
      );
    }

    const validControle = ['oui', 'non'];
    if (!validControle.includes(body.controle)) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Réponse invalide' }),
        { headers, status: 400 }
      );
    }

    // 5. Vérifier le fingerprint (basique)
    if (!body.fingerprint || body.fingerprint.length < 4) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Session invalide' }),
        { headers, status: 400 }
      );
    }

    // 6. Détection de patterns suspects (rate limiting par IP implicite via Supabase)
    // Optionnel: logger pour analyse
    const { count } = await supabase
      .from('user_feedback')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 60000).toISOString()); // Dernière minute

    if (count && count > 10) {
      // Plus de 10 soumissions globales dans la dernière minute = suspect
      console.warn('Rate limit global atteint:', count);
      // On continue mais on log
    }

    // Toutes les validations passent
    return new Response(
      JSON.stringify({ 
        valid: true,
        message: 'Validation réussie'
      }),
      { headers, status: 200 }
    );

  } catch (error) {
    console.error('Erreur validation:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Erreur serveur' 
      }),
      { headers, status: 500 }
    );
  }
});
