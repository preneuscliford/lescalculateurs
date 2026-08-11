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

// src/utils/salaireNetCalculEngine.ts
var BAREMES_2026 = {
  // Tranches d'imposition 2026 (non-résident)
  tranches: [
    { limite: 11294, taux: 0 },
    { limite: 28797, taux: 0.11 },
    { limite: 82341, taux: 0.3 },
    { limite: 177106, taux: 0.41 },
    { limite: Infinity, taux: 0.45 }
  ],
  // Quotient familial (parts)
  quotientFamilial: {
    seul: 1,
    couple: 2,
    enfant: 0.5,
    troisEntantsOuPlus: 1
    // à partir du 3e enfant
  },
  // Décote 2026
  decote: {
    limite: 1686
  },
  // Abattement de base (10% du revenu imposable)
  abattementBase: 0.1
};
var COTISATIONS_2026 = {
  secu: 0.082,
  // 8.2% maladie
  retraite: 0.062,
  // 6.2% retraite complémentaire
  ch\u00F4mage: 0.0405,
  // 4.05% chômage
  versementTransport: 5e-3
  // 0.5% (variable selon région)
};
function calculateCotisations(brutSalaire) {
  const totalCotisations = COTISATIONS_2026.secu + COTISATIONS_2026.retraite + COTISATIONS_2026.ch\u00F4mage + COTISATIONS_2026.versementTransport;
  return brutSalaire * totalCotisations;
}
function calculateImportFoncier(revenusImposables, quotientFamilial) {
  if (revenusImposables <= 0) return 0;
  const quotient = revenusImposables / quotientFamilial;
  let impot = 0;
  for (const tranche of BAREMES_2026.tranches) {
    if (quotient <= tranche.limite) {
      impot += (quotient - (BAREMES_2026.tranches[BAREMES_2026.tranches.indexOf(tranche) - 1]?.limite || 0)) * tranche.taux;
      break;
    }
    const precLimite = BAREMES_2026.tranches[BAREMES_2026.tranches.indexOf(tranche) - 1]?.limite || 0;
    impot += (tranche.limite - precLimite) * tranche.taux;
  }
  impot *= quotientFamilial;
  if (impot > 0 && impot < BAREMES_2026.decote.limite) {
    impot = Math.max(0, impot - (BAREMES_2026.decote.limite - impot) * 0.25);
  }
  return Math.max(0, impot);
}
function getQuotientFamilial(enfants, mariageOrPacs) {
  let parts = mariageOrPacs ? 2 : 1;
  if (enfants > 0) {
    if (enfants <= 2) {
      parts += enfants * 0.5;
    } else {
      parts += 1 + (enfants - 2) * 0.5;
    }
  }
  return parts;
}
function calculerSalaireNet(data) {
  const brutTotal = data.salaireBrut + data.primes + data.heuresSup;
  const cotisations = calculateCotisations(brutTotal);
  const revenusImposables = brutTotal - cotisations;
  const revenusImposablesAbattement = Math.max(
    0,
    revenusImposables * (1 - BAREMES_2026.abattementBase)
  );
  const quotientFamilial = getQuotientFamilial(data.enfants, data.mariageOrPacs);
  const impotAnnuel = calculateImportFoncier(revenusImposablesAbattement * 12, quotientFamilial);
  const impotMensuel = impotAnnuel / 12;
  const prelevementSource = Math.max(0, impotMensuel);
  const avantageNetFiscal = data.ticketsResto + data.mutuelle;
  const salaireNetMensuel = brutTotal - cotisations - prelevementSource;
  const salaireNetAvecAvantages = salaireNetMensuel + avantageNetFiscal;
  const tauxEffectif = brutTotal > 0 ? (prelevementSource + cotisations) / brutTotal : 0;
  return {
    success: true,
    salaireNetMensuel: salaireNetAvecAvantages,
    salaireNetAnnuel: salaireNetAvecAvantages * 12,
    impotPasTotal: prelevementSource * 12,
    cotisationsSociales: cotisations * 12,
    salaireGrossMensuel: brutTotal,
    tauxEffectif,
    explications: `Avec un salaire brut de ${brutTotal.toFixed(2)}\u20AC et ${data.enfants} enfant(s), votre salaire net estim\xE9 est ${salaireNetAvecAvantages.toFixed(2)}\u20AC par mois.`,
    details: {
      salaireBase: data.salaireBrut,
      primes: data.primes,
      heuresSup: data.heuresSup,
      brutTotal,
      cotisationsEmploye: cotisations,
      prelevementSource,
      ticketsResto: data.ticketsResto,
      mutuelle: data.mutuelle,
      netTotal: salaireNetAvecAvantages
    }
  };
}

// api-src/v1/salaire-net.ts
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
      salaireBrut,
      statut,
      primes,
      heuresSup,
      ticketsResto,
      mutuelle,
      enfants,
      mariageOrPacs
    } = req.body || {};
    if (salaireBrut === void 0 || !statut) {
      return res.status(400).json({
        error: "Champs requis : salaireBrut, statut.",
        exemple: { salaireBrut: 2800, statut: "salarie", enfants: 0, mariageOrPacs: false }
      });
    }
    const result = calculerSalaireNet({
      salaireBrut: Number(salaireBrut) || 0,
      statut,
      primes: Number(primes) || 0,
      heuresSup: Number(heuresSup) || 0,
      ticketsResto: Number(ticketsResto) || 0,
      mutuelle: Number(mutuelle) || 0,
      enfants: Number(enfants) || 0,
      mariageOrPacs: Boolean(mariageOrPacs)
    });
    return res.status(200).json(withMeta("salaire-net", result));
  } catch (err) {
    console.error("API /v1/salaire-net error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
export {
  handler as default
};
