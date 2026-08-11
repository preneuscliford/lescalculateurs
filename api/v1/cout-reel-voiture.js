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
    effectiveDate: "2026-05-01",
    source: "https://solidarites.gouv.fr/revalorisation-annuelle-des-prestations-sociales-au-1er-avril-2026"
  },
  apl: {
    version: "1.0.0",
    rulesVersion: "2025.10",
    effectiveDate: "2025-10-01",
    source: "https://www.service-public.fr/particuliers/actualites/A16807"
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
    effectiveDate: "2026-05-01",
    source: "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-prime-d-activite"
  },
  asf: {
    version: "1.0.0",
    rulesVersion: "2026.05",
    effectiveDate: "2026-05-01",
    source: "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/l-allocation-de-soutien-familial-asf"
  },
  aah: {
    version: "1.0.0",
    rulesVersion: "2026.05",
    effectiveDate: "2026-05-01",
    source: "D\xE9cret du 29 mars 2025 (revalorisation AAH +0,9%, applicable au 1er mai 2026)"
  },
  retraite: {
    version: "1.0.0",
    rulesVersion: "reforme-2023 + suspension-LFSS-2026",
    source: "https://www.info-retraite.fr"
  },
  "indemnite-licenciement": {
    version: "1.0.0",
    rulesVersion: "en vigueur (quotes-parts l\xE9gales inchang\xE9es)",
    source: "Code du travail, article L1234-9"
  },
  ptz: {
    version: "1.0.0",
    rulesVersion: "2026 (inchang\xE9 vs 2025)",
    source: "Bar\xE8me PTZ 2026 \u2014 service-public.fr (F19941)"
  },
  "impot-revenu": {
    version: "1.0.0",
    rulesVersion: "2026 (imposition des revenus 2025)",
    source: "Article 197 du CGI \u2014 service-public.fr"
  },
  notaire: {
    version: "1.0.0",
    rulesVersion: "2026",
    source: "Bar\xE8mes notari\xE9s 2026 \u2014 Conseil sup\xE9rieur du notariat"
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

// src/utils/coutReelVoitureCalculEngine.ts
function calculerCoutReelVoiture(data) {
  const consommationAnnuelle = data.kilometrageAnnuel / 100 * data.consommation;
  const coutCarburantAnnuel = consommationAnnuelle * data.prixCarburant;
  const coutCarburantMensuel = coutCarburantAnnuel / 12;
  const assuranceMensuel = data.assuranceAnnuelle / 12;
  const carteGriseMensuel = data.carteGriseAnnuelle / 12;
  const revisionMensuel = data.revisionAnnuelle / 12;
  const parkingMensuel = data.parking;
  const othersMensuel = (data.peagesAnnuels + data.contraventions) / 12;
  const entretienMensuel = carteGriseMensuel + revisionMensuel;
  const totalSansCredit = coutCarburantMensuel + assuranceMensuel + entretienMensuel + parkingMensuel + othersMensuel;
  const coutMensuelTotal = totalSansCredit + data.creditMensuel;
  const coutAnnuelTotal = coutMensuelTotal * 12;
  const coutParKm = data.kilometrageAnnuel > 0 ? coutAnnuelTotal / data.kilometrageAnnuel : 0;
  return {
    success: true,
    coutMensuelTotal,
    coutAnnuelTotal,
    coutParKm,
    details: {
      carburantMensuel: coutCarburantMensuel,
      carburantAnnuel: coutCarburantAnnuel,
      assuranceMensuel,
      entretienMensuel,
      parkingMensuel,
      othersMensuel,
      creditMensuel: data.creditMensuel,
      totalMensuel: coutMensuelTotal
    },
    explications: `Avec une voiture consommant ${data.consommation}${data.carburant === "electrique" ? " kWh/100km" : " L/100km"} et ${data.kilometrageAnnuel} km par an, le co\xFBt r\xE9el estim\xE9 est ${coutMensuelTotal.toFixed(2)}\u20AC par mois.`
  };
}

// api-src/v1/cout-reel-voiture.ts
async function handler(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  const auth = authenticate(req, res);
  if (!auth) return;
  try {
    const {
      carburant,
      kilometrageAnnuel,
      consommation,
      prixCarburant,
      assuranceAnnuelle,
      carteGriseAnnuelle,
      revisionAnnuelle,
      parking,
      peagesAnnuels,
      contraventions,
      creditMensuel
    } = req.body || {};
    if (!carburant || kilometrageAnnuel === void 0 || consommation === void 0 || prixCarburant === void 0) {
      return res.status(400).json({
        error: "Champs requis : carburant, kilometrageAnnuel, consommation, prixCarburant.",
        exemple: {
          carburant: "essence",
          kilometrageAnnuel: 12e3,
          consommation: 6.5,
          prixCarburant: 1.85,
          assuranceAnnuelle: 600,
          carteGriseAnnuelle: 0,
          revisionAnnuelle: 250,
          parking: 0,
          peagesAnnuels: 0,
          contraventions: 0,
          creditMensuel: 0
        }
      });
    }
    const result = calculerCoutReelVoiture({
      carburant,
      kilometrageAnnuel: Number(kilometrageAnnuel) || 0,
      consommation: Number(consommation) || 0,
      prixCarburant: Number(prixCarburant) || 0,
      assuranceAnnuelle: Number(assuranceAnnuelle) || 0,
      carteGriseAnnuelle: Number(carteGriseAnnuelle) || 0,
      revisionAnnuelle: Number(revisionAnnuelle) || 0,
      parking: Number(parking) || 0,
      peagesAnnuels: Number(peagesAnnuels) || 0,
      contraventions: Number(contraventions) || 0,
      creditMensuel: Number(creditMensuel) || 0
    });
    return res.status(200).json(withMeta("cout-reel-voiture", result));
  } catch (err) {
    console.error("API /v1/cout-reel-voiture error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
export {
  handler as default
};
