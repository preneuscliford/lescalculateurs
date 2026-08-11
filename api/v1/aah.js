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

// src/utils/aahCalculEngine.ts
var AAH_PLAFOND_2026 = 1041.59;
var AAH_MONTANTS_2026 = {
  seul: 1041.59,
  // Taux plein (sans revenus) - Revalorisation +0,9% appliquée
  couple: 1041.59
  // Identique depuis déconjugalisation
};
var AAH_SEUIL_MIN_INCAPACITE = 50;
var AAH_SEUIL_MAX_REVENUS = 1500;
function calculerAAH(data) {
  if (!data.situation || !data.logement || data.tauxIncapacite < AAH_SEUIL_MIN_INCAPACITE) {
    return {
      success: false,
      montantEstime: 0,
      eligibilite: "Donn\xE9es incompl\xE8tes",
      explication: "Le taux d'incapacit\xE9 doit \xEAtre d'au minimum 50%. Veuillez remplir tous les champs.",
      details: {
        montantBase: 0,
        majorations: 0,
        revenusComptabilises: 0,
        abattement: 0,
        montantFinal: 0
      }
    };
  }
  let montantBase = 0;
  if (data.situation === "seul") {
    montantBase = AAH_MONTANTS_2026.seul;
  } else if (data.situation === "couple") {
    montantBase = AAH_MONTANTS_2026.couple;
  } else {
    montantBase = AAH_MONTANTS_2026.seul;
  }
  const majorations = 0;
  const montantBaseTotal = montantBase;
  const tauxAbattement = 0.1;
  const revenusComptabilises = Math.max(0, data.revenus * (1 - tauxAbattement));
  const abattement = data.revenus - revenusComptabilises;
  let montantFinal = montantBaseTotal - revenusComptabilises;
  if (montantFinal < 0) {
    montantFinal = 0;
  }
  montantFinal = Math.min(montantFinal, AAH_PLAFOND_2026);
  let eligibilite = "";
  let explication = "";
  if (data.tauxIncapacite < AAH_SEUIL_MIN_INCAPACITE) {
    eligibilite = "Non \xE9ligible";
    explication = "L'AAH n\xE9cessite un taux d'incapacit\xE9 d'au minimum 50% reconnu par la MDPH. Votre situation ne semble pas correspondre.";
    montantFinal = 0;
  } else if (data.revenus > AAH_SEUIL_MAX_REVENUS) {
    eligibilite = "Probablement non \xE9ligible";
    explication = "Vos revenus totaux semblent d\xE9passer les plafonds d'\xE9ligibilit\xE9 \xE0 l'AAH selon les r\xE8gles CAF.";
    montantFinal = 0;
  } else if (montantFinal <= 0) {
    eligibilite = "Non \xE9ligible";
    explication = "Vos ressources d\xE9passent le montant de base de l'AAH. Vous ne semblez pas pouvoir en b\xE9n\xE9ficier selon les informations renseign\xE9es.";
  } else if (montantFinal < 50) {
    eligibilite = "\xC9ligible (montant tr\xE8s r\xE9duit)";
    explication = `Vous pourriez percevoir environ ${montantFinal.toFixed(2)}\u20AC par mois. Ce montant est plafonn\xE9 au plafond r\xE9glementaire de l'AAH (\u2248 ${AAH_PLAFOND_2026}\u20AC). La CAF \xE9valuera votre dossier compl\xE8tement en prenant en compte votre taux d'incapacit\xE9 reconnu par la MDPH, vos ressources exactes et votre composition familiale.`;
  } else {
    eligibilite = "Probablement \xE9ligible";
    explication = `Vous pourriez percevoir environ ${montantFinal.toFixed(2)}\u20AC par mois. Ce montant est plafonn\xE9 au plafond r\xE9glementaire de l'AAH. L'estimation d\xE9pend de votre situation exacte et de la d\xE9cision finale de la CAF, qui prendra en compte votre taux d'incapacit\xE9 reconnu par la MDPH, vos ressources et votre situation familiale.`;
  }
  return {
    success: true,
    montantEstime: Math.max(0, montantFinal),
    eligibilite,
    explication,
    details: {
      montantBase,
      majorations,
      revenusComptabilises: Math.round(revenusComptabilises * 100) / 100,
      abattement: Math.round(abattement * 100) / 100,
      montantFinal: Math.max(0, Math.round(montantFinal * 100) / 100)
    }
  };
}

// api-src/v1/aah.ts
async function handler(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  const auth = authenticate(req, res);
  if (!auth) return;
  try {
    const { situation, enfants, tauxIncapacite, revenus, logement } = req.body || {};
    if (!situation || !logement || tauxIncapacite === void 0) {
      return res.status(400).json({
        error: "Champs requis : situation, logement, tauxIncapacite.",
        exemple: {
          situation: "seul",
          enfants: 0,
          tauxIncapacite: 80,
          revenus: 300,
          logement: "locataire"
        }
      });
    }
    const result = calculerAAH({
      situation,
      enfants: Number(enfants) || 0,
      tauxIncapacite: Number(tauxIncapacite) || 0,
      revenus: Number(revenus) || 0,
      logement
    });
    return res.status(200).json(withMeta("aah", result));
  } catch (err) {
    console.error("API /v1/aah error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
export {
  handler as default
};
