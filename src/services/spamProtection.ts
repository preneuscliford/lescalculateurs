/**
 * Service de protection anti-spam pour l'observatoire
 * Sans casser l'anonymat
 * 
 * Stratégies:
 * 1. Rate limiting temporel (1 soumission / 24h par profil)
 * 2. Honeypot (champ caché pour détecter bots)
 * 3. Fingerprint localStorage (empêche rechargement immédiat)
 * 4. Délai minimum de remplissage (anti-script rapide)
 */

// Clés localStorage
const LS_KEYS = {
  LAST_SUBMISSION: 'obs_last_submit_',
  FINGERPRINT: 'obs_fp_',
  FORM_START_TIME: 'obs_start_',
} as const;

// Délai minimum de remplissage (5 secondes)
const MIN_FILL_TIME_MS = 5000;

// Délai entre soumissions (24 heures)
const SUBMISSION_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/**
 * Vérifie si le profil peut soumettre (rate limiting côté client)
 */
export function canSubmit(profileHash: string): {
  allowed: boolean;
  reason?: string;
  remainingMs?: number;
} {
  const now = Date.now();
  const lastSubmissionKey = LS_KEYS.LAST_SUBMISSION + profileHash;
  const lastSubmission = localStorage.getItem(lastSubmissionKey);
  
  if (lastSubmission) {
    const lastTime = parseInt(lastSubmission, 10);
    const elapsed = now - lastTime;
    
    if (elapsed < SUBMISSION_COOLDOWN_MS) {
      const remaining = SUBMISSION_COOLDOWN_MS - elapsed;
      const hours = Math.ceil(remaining / (60 * 60 * 1000));
      
      return {
        allowed: false,
        reason: `Vous avez déjà partagé votre expérience récemment. Merci de patienter ${hours}h.`,
        remainingMs: remaining,
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Enregistre une soumission (pour rate limiting)
 */
export function recordSubmission(profileHash: string): void {
  const lastSubmissionKey = LS_KEYS.LAST_SUBMISSION + profileHash;
  localStorage.setItem(lastSubmissionKey, Date.now().toString());
}

/**
 * Génère un fingerprint unique du navigateur (anonyme)
 * Combine: user agent hash + résolution + timezone + langue
 */
export function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    screen.width + 'x' + screen.height,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency?.toString() || '',
  ];
  
  const str = components.join('|');
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir en 32bit
  }
  
  return Math.abs(hash).toString(36).substring(0, 8);
}

/**
 * Vérifie le fingerprint (anti-rechargement rapide)
 */
export function verifyFingerprint(profileHash: string): {
  valid: boolean;
  token: string;
  reason?: string;
} {
  const fpKey = LS_KEYS.FINGERPRINT + profileHash;
  const storedFp = localStorage.getItem(fpKey);
  const currentFp = generateFingerprint();
  
  // Premier remplissage: stocker le fingerprint
  if (!storedFp) {
    localStorage.setItem(fpKey, currentFp);
    return { valid: true, token: currentFp };
  }
  
  // Vérifier que c'est le même navigateur
  if (storedFp !== currentFp) {
    return {
      valid: false,
      token: currentFp,
      reason: 'Session invalide. Veuillez recharger la page.',
    };
  }
  
  return { valid: true, token: currentFp };
}

/**
 * Honeypot: vérifie si un champ caché a été rempli (bot)
 */
export function checkHoneypot(honeypotValue: string | null): {
  clean: boolean;
  reason?: string;
} {
  // Si le champ caché est rempli = bot
  if (honeypotValue && honeypotValue.trim() !== '') {
    return {
      clean: false,
      reason: 'Spam détecté.',
    };
  }
  
  return { clean: true };
}

/**
 * Démarre le chronomètre de remplissage du formulaire
 */
export function startFormTimer(profileHash: string): void {
  const timerKey = LS_KEYS.FORM_START_TIME + profileHash;
  localStorage.setItem(timerKey, Date.now().toString());
}

/**
 * Vérifie le temps de remplissage minimum (anti-script rapide)
 */
export function checkFillTime(profileHash: string): {
  valid: boolean;
  elapsedMs?: number;
  reason?: string;
} {
  const timerKey = LS_KEYS.FORM_START_TIME + profileHash;
  const startTime = localStorage.getItem(timerKey);
  
  if (!startTime) {
    return {
      valid: false,
      reason: 'Session invalide.',
    };
  }
  
  const elapsed = Date.now() - parseInt(startTime, 10);
  
  if (elapsed < MIN_FILL_TIME_MS) {
    return {
      valid: false,
      elapsedMs: elapsed,
      reason: `Veuillez prendre le temps de remplir le formulaire correctement.`,
    };
  }
  
  return { valid: true, elapsedMs: elapsed };
}

/**
 * Validation complète côté client
 */
export function validateSubmission(
  profileHash: string,
  honeypotValue: string | null
): {
  valid: boolean;
  fingerprint?: string;
  reason?: string;
} {
  // 1. Vérifier le honeypot
  const honeypotCheck = checkHoneypot(honeypotValue);
  if (!honeypotCheck.clean) {
    return { valid: false, reason: honeypotCheck.reason };
  }
  
  // 2. Vérifier le rate limiting
  const rateCheck = canSubmit(profileHash);
  if (!rateCheck.allowed) {
    return { valid: false, reason: rateCheck.reason };
  }
  
  // 3. Vérifier le fingerprint
  const fpCheck = verifyFingerprint(profileHash);
  if (!fpCheck.valid) {
    return { valid: false, reason: fpCheck.reason };
  }
  
  // 4. Vérifier le temps de remplissage
  const timeCheck = checkFillTime(profileHash);
  if (!timeCheck.valid) {
    return { valid: false, reason: timeCheck.reason };
  }
  
  return { valid: true, fingerprint: fpCheck.token };
}

/**
 * Réinitialise toutes les protections (pour debug/test)
 */
export function resetProtection(profileHash: string): void {
  Object.values(LS_KEYS).forEach(key => {
    localStorage.removeItem(key + profileHash);
  });
}

/**
 * Obtient le temps restant avant prochaine soumission
 */
export function getTimeRemaining(profileHash: string): {
  canSubmit: boolean;
  remainingMs: number;
  remainingText: string;
} {
  const lastSubmissionKey = LS_KEYS.LAST_SUBMISSION + profileHash;
  const lastSubmission = localStorage.getItem(lastSubmissionKey);
  
  if (!lastSubmission) {
    return { canSubmit: true, remainingMs: 0, remainingText: 'Maintenant' };
  }
  
  const lastTime = parseInt(lastSubmission, 10);
  const elapsed = Date.now() - lastTime;
  const remaining = Math.max(0, SUBMISSION_COOLDOWN_MS - elapsed);
  
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  
  return {
    canSubmit: remaining === 0,
    remainingMs: remaining,
    remainingText: remaining === 0 
      ? 'Maintenant' 
      : `${hours}h ${minutes}min`,
  };
}
