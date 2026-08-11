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

// src/utils/retraiteCalculEngine.ts
var AGE_LEGAL_BAREME = [
  { from: { year: 1900, month: 1 }, to: { year: 1957, month: 12 }, ageLegalYears: 62, ageLegalMonths: 0, trimestresRequis: 166 },
  { from: { year: 1958, month: 1 }, to: { year: 1960, month: 12 }, ageLegalYears: 62, ageLegalMonths: 0, trimestresRequis: 167 },
  { from: { year: 1961, month: 1 }, to: { year: 1961, month: 8 }, ageLegalYears: 62, ageLegalMonths: 0, trimestresRequis: 168 },
  { from: { year: 1961, month: 9 }, to: { year: 1961, month: 12 }, ageLegalYears: 62, ageLegalMonths: 3, trimestresRequis: 169 },
  { from: { year: 1962, month: 1 }, to: { year: 1962, month: 12 }, ageLegalYears: 62, ageLegalMonths: 6, trimestresRequis: 169 },
  { from: { year: 1963, month: 1 }, to: { year: 1963, month: 12 }, ageLegalYears: 62, ageLegalMonths: 9, trimestresRequis: 170 },
  // Générations 1964 à 1968 (Q1 1965 inclus) : calendrier suspendu par la LFSS 2026
  // (recul de 3 mois de l'âge légal, trimestres requis réduits), effet au 1er septembre 2026.
  { from: { year: 1964, month: 1 }, to: { year: 1964, month: 12 }, ageLegalYears: 62, ageLegalMonths: 9, trimestresRequis: 170 },
  { from: { year: 1965, month: 1 }, to: { year: 1965, month: 3 }, ageLegalYears: 62, ageLegalMonths: 9, trimestresRequis: 170 },
  { from: { year: 1965, month: 4 }, to: { year: 1965, month: 12 }, ageLegalYears: 63, ageLegalMonths: 0, trimestresRequis: 171 },
  { from: { year: 1966, month: 1 }, to: { year: 1966, month: 12 }, ageLegalYears: 63, ageLegalMonths: 3, trimestresRequis: 172 },
  { from: { year: 1967, month: 1 }, to: { year: 1967, month: 12 }, ageLegalYears: 63, ageLegalMonths: 6, trimestresRequis: 172 },
  { from: { year: 1968, month: 1 }, to: { year: 1968, month: 12 }, ageLegalYears: 63, ageLegalMonths: 9, trimestresRequis: 172 },
  { from: { year: 1969, month: 1 }, to: null, ageLegalYears: 64, ageLegalMonths: 0, trimestresRequis: 172 }
];
var AGE_TAUX_PLEIN_AUTOMATIQUE = 67;
function compareYearMonth(a, b) {
  if (a.year !== b.year) return a.year - b.year;
  return a.month - b.month;
}
function findBracket(year, month) {
  const target = { year, month };
  const match = AGE_LEGAL_BAREME.find(
    (bracket) => compareYearMonth(target, bracket.from) >= 0 && (bracket.to === null || compareYearMonth(target, bracket.to) <= 0)
  );
  return match ?? AGE_LEGAL_BAREME[AGE_LEGAL_BAREME.length - 1];
}
function addYearsMonths(date, years, months) {
  const result = new Date(date.getTime());
  result.setUTCFullYear(result.getUTCFullYear() + years);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}
function baremeLabel(year, month) {
  if (year < 1961 || year === 1961 && month < 9) return "avant-reforme-2010-2014";
  if (year >= 1964 && (year < 1965 || year === 1965 && month <= 3)) {
    return "reforme-2023-suspension-2026";
  }
  return "reforme-2023-complete";
}
function calculerAgeLegalRetraite(data) {
  const { dateNaissance, trimestresValides } = data;
  const year = dateNaissance.getUTCFullYear();
  const month = dateNaissance.getUTCMonth() + 1;
  const bracket = findBracket(year, month);
  const dateAgeLegal = addYearsMonths(dateNaissance, bracket.ageLegalYears, bracket.ageLegalMonths);
  const dateTauxPleinAutomatique = addYearsMonths(dateNaissance, AGE_TAUX_PLEIN_AUTOMATIQUE, 0);
  const trimestresManquants = typeof trimestresValides === "number" && Number.isFinite(trimestresValides) ? Math.max(0, bracket.trimestresRequis - trimestresValides) : null;
  return {
    ageLegalYears: bracket.ageLegalYears,
    ageLegalMonths: bracket.ageLegalMonths,
    trimestresRequis: bracket.trimestresRequis,
    dateAgeLegal,
    dateTauxPleinAutomatique,
    trimestresValides: typeof trimestresValides === "number" ? trimestresValides : null,
    trimestresManquants,
    bareme: baremeLabel(year, month)
  };
}

// api-src/v1/retraite.ts
async function handler(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  const auth = authenticate(req, res);
  if (!auth) return;
  try {
    const { dateNaissance, trimestresValides } = req.body || {};
    if (!dateNaissance) {
      return res.status(400).json({
        error: "Champ requis : dateNaissance (format YYYY-MM-DD).",
        exemple: { dateNaissance: "1964-06-15", trimestresValides: 140 }
      });
    }
    const parsed = new Date(dateNaissance);
    if (Number.isNaN(parsed.getTime())) {
      return res.status(400).json({ error: "dateNaissance invalide, attendu YYYY-MM-DD." });
    }
    const result = calculerAgeLegalRetraite({
      dateNaissance: parsed,
      trimestresValides: trimestresValides === void 0 || trimestresValides === null ? null : Number(trimestresValides)
    });
    return res.status(200).json(withMeta("retraite", result));
  } catch (err) {
    console.error("API /v1/retraite error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
export {
  handler as default
};
