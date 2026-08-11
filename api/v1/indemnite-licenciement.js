// api-src/_lib/tokens.ts
import crypto from "node:crypto";
var TOKEN_PREFIX = "lc_free_";
var VALIDITY_MS = 90 * 24 * 60 * 60 * 1e3;
function getSecret() {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) {
    throw new Error("API_KEY_SECRET non configur\xE9");
  }
  return secret;
}
function sign(payload) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}
function verifyToken(key) {
  if (typeof key !== "string" || !key.startsWith(TOKEN_PREFIX)) return null;
  const rest = key.slice(TOKEN_PREFIX.length);
  const separatorIndex = rest.lastIndexOf(".");
  if (separatorIndex === -1) return null;
  const payload = rest.slice(0, separatorIndex);
  const signature = rest.slice(separatorIndex + 1);
  if (!payload || !signature) return null;
  let expectedSignature;
  try {
    expectedSignature = sign(payload);
  } catch {
    return null;
  }
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return null;
  }
  let data;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof data.exp !== "number" || Date.now() > data.exp) return null;
  return { issuedAt: data.iat, expiresAt: data.exp };
}

// api-src/_lib/auth.ts
var PLAN_LIMITS = {
  free: 100,
  starter: 5e3,
  pro: 5e4
};
var PROMO_END = /* @__PURE__ */ new Date("2026-11-10T00:00:00Z");
var PROMO_LIMIT = 2e4;
function isPromoActive() {
  return Date.now() < PROMO_END.getTime();
}
function effectiveLimit(plan) {
  if (isPromoActive()) return PROMO_LIMIT;
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}
var usage = /* @__PURE__ */ new Map();
function loadKeys() {
  try {
    return JSON.parse(process.env.API_KEYS || "[]");
  } catch {
    return [];
  }
}
function currentMonthKey() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
}
function withCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
}
function authenticate(req, res) {
  const apiKeyHeader = req.headers["x-api-key"];
  const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
  if (!apiKey) {
    res.status(401).json({
      error: "Cl\xE9 API manquante. Ajoutez l'en-t\xEAte X-API-Key.",
      docs: "https://www.lescalculateurs.fr/pages/api"
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
    res.status(401).json({ error: "Cl\xE9 API invalide, r\xE9voqu\xE9e ou expir\xE9e." });
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
      error: `Quota mensuel d\xE9pass\xE9 pour le plan ${plan} (${limit} requ\xEAtes/mois).`,
      upgrade: "https://www.lescalculateurs.fr/pages/api"
    });
    return null;
  }
  return { plan, owner };
}

// api-src/_lib/meta.ts
var CALCULATOR_META = {
  rsa: {
    version: "1.0.0",
    rulesVersion: "2026.05",
    effectiveDate: "2026-04-01",
    source: "https://solidarites.gouv.fr/revalorisation-annuelle-des-prestations-sociales-au-1er-avril-2026"
  },
  apl: {
    version: "1.0.0",
    rulesVersion: "2025.10",
    effectiveDate: "2025-10-01",
    source: "https://www.service-public.gouv.fr/particuliers/actualites/A16807"
  },
  are: {
    version: "1.0.0",
    rulesVersion: "2025.07",
    effectiveDate: "2025-07-01",
    source: "https://www.francetravail.fr/faq/candidat/mes-allocations---mes-aides/lallocation-chomage-lessentiel-a/montant-allocation-france-travai.html"
  },
  "prime-activite": {
    version: "1.0.0",
    rulesVersion: "2026.05",
    effectiveDate: "2026-04-01",
    source: "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-prime-d-activite"
  },
  asf: {
    version: "1.0.0",
    rulesVersion: "2026.05",
    effectiveDate: "2026-04-01",
    source: "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/l-allocation-de-soutien-familial-asf"
  },
  aah: {
    version: "1.0.0",
    rulesVersion: "2026.05",
    effectiveDate: "2026-04-01",
    source: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053734356"
  },
  retraite: {
    version: "1.0.0",
    rulesVersion: "reforme-2023 + suspension-LFSS-2026",
    source: "https://www.info-retraite.fr/portail-info/sites/PortailInformationnel/home/reforme-des-retraites/reforme-des-retraites---age-le-1.html"
  },
  "indemnite-licenciement": {
    version: "1.0.0",
    rulesVersion: "en vigueur (quotes-parts l\xE9gales inchang\xE9es)",
    source: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035644154"
  },
  ptz: {
    version: "1.0.0",
    rulesVersion: "2026 (inchang\xE9 vs 2025)",
    source: "https://www.service-public.gouv.fr/particuliers/vosdroits/F10871"
  },
  "impot-revenu": {
    version: "1.0.0",
    rulesVersion: "2026 (imposition des revenus 2025)",
    source: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051212954"
  },
  notaire: {
    version: "1.0.0",
    rulesVersion: "2026",
    source: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053593921"
  },
  "apl-etudiant": {
    version: "1.0.0",
    rulesVersion: "2026 (mod\xE8le simplifi\xE9)",
    source: "Bar\xE8mes CROUS/CNOUS 2026, simplifi\xE9s"
  },
  "salaire-net": {
    version: "1.0.0",
    rulesVersion: "2026 (cotisations moyennes approximatives)",
    source: "Bar\xE8mes DGFIP 2026 \u2014 approximation, hors cas particuliers"
  },
  salaire: {
    version: "1.0.0",
    rulesVersion: "estimation forfaitaire (non r\xE9glementaire)"
  },
  "reste-a-vivre": {
    version: "1.0.0",
    rulesVersion: "agr\xE9gation arithm\xE9tique (non r\xE9glementaire)"
  },
  "cout-reel-voiture": {
    version: "1.0.0",
    rulesVersion: "agr\xE9gation arithm\xE9tique (non r\xE9glementaire)"
  }
};
function withMeta(calculatorId, result) {
  const entry = CALCULATOR_META[calculatorId] || { version: "1.0.0" };
  return { ...result, meta: { calculator: calculatorId, ...entry } };
}

// src/utils/indemniteLicenciementCalculEngine.ts
var ANCIENNETE_MINIMALE_MOIS = 8;
var SEUIL_ANNEES_TIER_SUPERIEUR = 10;
var QUOTE_PART_JUSQUA_10_ANS = 1 / 4;
var QUOTE_PART_AU_DELA_10_ANS = 1 / 3;
function moisEntreDates(dateEntree, dateSortie) {
  const anneeDiff = dateSortie.getUTCFullYear() - dateEntree.getUTCFullYear();
  const moisDiff = dateSortie.getUTCMonth() - dateEntree.getUTCMonth();
  const jourAjustement = dateSortie.getUTCDate() < dateEntree.getUTCDate() ? -1 : 0;
  return Math.max(0, anneeDiff * 12 + moisDiff + jourAjustement);
}
function calculerIndemniteLicenciement(data) {
  const { dateEntree, dateSortie, salaireMensuelBrutMoyen } = data;
  const ancienneteMois = moisEntreDates(dateEntree, dateSortie);
  const eligible = ancienneteMois >= ANCIENNETE_MINIMALE_MOIS;
  const ancienneteAnneesDecimal = ancienneteMois / 12;
  const portionJusqua10Ans = Math.min(ancienneteAnneesDecimal, SEUIL_ANNEES_TIER_SUPERIEUR);
  const portionAuDela10Ans = Math.max(0, ancienneteAnneesDecimal - SEUIL_ANNEES_TIER_SUPERIEUR);
  const salaire = Number.isFinite(salaireMensuelBrutMoyen) ? Math.max(0, salaireMensuelBrutMoyen) : 0;
  const montantJusqua10Ans = eligible ? salaire * QUOTE_PART_JUSQUA_10_ANS * portionJusqua10Ans : 0;
  const montantAuDela10Ans = eligible ? salaire * QUOTE_PART_AU_DELA_10_ANS * portionAuDela10Ans : 0;
  return {
    eligible,
    ancienneteMois,
    ancienneteAnneesDecimal,
    portionJusqua10Ans,
    portionAuDela10Ans,
    montantJusqua10Ans,
    montantAuDela10Ans,
    montantTotal: Math.round((montantJusqua10Ans + montantAuDela10Ans) * 100) / 100
  };
}

// api-src/v1/indemnite-licenciement.ts
async function handler(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  const auth = authenticate(req, res);
  if (!auth) return;
  try {
    const { dateEntree, dateSortie, salaireMensuelBrutMoyen } = req.body || {};
    if (!dateEntree || !dateSortie || salaireMensuelBrutMoyen === void 0) {
      return res.status(400).json({
        error: "Champs requis : dateEntree, dateSortie, salaireMensuelBrutMoyen.",
        exemple: {
          dateEntree: "2015-03-01",
          dateSortie: "2026-08-01",
          salaireMensuelBrutMoyen: 2600
        }
      });
    }
    const entree = new Date(dateEntree);
    const sortie = new Date(dateSortie);
    if (Number.isNaN(entree.getTime()) || Number.isNaN(sortie.getTime())) {
      return res.status(400).json({ error: "dateEntree/dateSortie invalides, attendu YYYY-MM-DD." });
    }
    const result = calculerIndemniteLicenciement({
      dateEntree: entree,
      dateSortie: sortie,
      salaireMensuelBrutMoyen: Number(salaireMensuelBrutMoyen) || 0
    });
    return res.status(200).json(withMeta("indemnite-licenciement", result));
  } catch (err) {
    console.error("API /v1/indemnite-licenciement error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
export {
  handler as default
};
