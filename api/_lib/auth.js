/**
 * Authentification et quotas pour l'API publique LesCalculateurs.
 *
 * Deux façons d'obtenir une clé valide :
 * 1. Auto-générée sur /pages/api (POST /api/v1/keys) : un jeton signé,
 *    valable 3 mois, vérifié à la volée sans stockage (voir _lib/tokens.js).
 * 2. Émise à la main pour un client identifié et stockée dans la variable
 *    d'environnement Vercel API_KEYS, au format JSON :
 *    [{"key":"lc_live_xxx","plan":"starter","owner":"Nom du client"}, ...]
 *
 * Le comptage d'usage est fait en mémoire par instance de fonction : il
 * est remis à zéro à chaque cold start et n'est pas partagé entre
 * instances. C'est un garde-fou "best effort" suffisant pour un lancement
 * à faible volume — à remplacer par un store partagé (Redis/KV) si le
 * volume augmente.
 */

import { verifyToken } from "./tokens.js";

export const PLAN_LIMITS = {
  free: 100,
  starter: 5000,
  pro: 50000,
};

// Lancement de l'API : accès gratuit et généreux pour tout le monde le temps
// de valider l'adoption, quel que soit le plan enregistré sur la clé. Les
// plans/tarifs réels reprennent effet automatiquement après cette date.
const PROMO_END = new Date("2026-11-10T00:00:00Z");
const PROMO_LIMIT = 20000;

function isPromoActive() {
  return Date.now() < PROMO_END.getTime();
}

function effectiveLimit(plan) {
  if (isPromoActive()) return PROMO_LIMIT;
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

const usage = new Map();

function loadKeys() {
  try {
    return JSON.parse(process.env.API_KEYS || "[]");
  } catch {
    return [];
  }
}

function currentMonthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
}

export function withCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
}

/**
 * Vérifie la clé API et applique le quota mensuel du plan.
 * Envoie elle-même la réponse d'erreur (401/429) et renvoie null si le
 * traitement doit s'arrêter ; renvoie { plan, owner } si tout va bien.
 */
export function authenticate(req, res) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    res.status(401).json({
      error: "Clé API manquante. Ajoutez l'en-tête X-API-Key.",
      docs: "https://www.lescalculateurs.fr/pages/api",
    });
    return null;
  }

  const staticMatch = loadKeys().find((k) => k.key === apiKey);
  let plan = null;
  let owner = null;

  if (staticMatch) {
    plan = staticMatch.plan || "free";
    owner = staticMatch.owner || null;
  } else {
    const tokenInfo = verifyToken(apiKey);
    if (tokenInfo) {
      plan = "free";
      owner = "self-serve";
    }
  }

  if (!plan) {
    res.status(401).json({ error: "Clé API invalide, révoquée ou expirée." });
    return null;
  }

  const limit = effectiveLimit(plan);
  const usageKey = `${apiKey}:${currentMonthKey()}`;
  const entry = usage.get(usageKey) || { count: 0 };
  entry.count += 1;
  usage.set(usageKey, entry);

  res.setHeader("X-RateLimit-Limit", String(limit));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, limit - entry.count)));
  if (isPromoActive()) {
    res.setHeader("X-API-Promo", `free-until:${PROMO_END.toISOString().slice(0, 10)}`);
  }

  if (entry.count > limit) {
    res.status(429).json({
      error: `Quota mensuel dépassé pour le plan ${plan} (${limit} requêtes/mois).`,
      upgrade: "https://www.lescalculateurs.fr/pages/api",
    });
    return null;
  }

  return { plan, owner };
}
