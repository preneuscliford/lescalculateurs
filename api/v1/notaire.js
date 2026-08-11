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

// src/data/baremes.json
var baremes_default = {
  notaire: {
    tranches: [
      {
        min: 0,
        max: 6500,
        taux: 0.0387
      },
      {
        min: 6500,
        max: 17e3,
        taux: 0.01596
      },
      {
        min: 17e3,
        max: 6e4,
        taux: 0.01064
      },
      {
        min: 6e4,
        max: 999999999,
        taux: 799e-5
      }
    ],
    fraisDivers: {
      hypotheque: 450,
      cadastre: 125,
      conservation: 150,
      formalites: 200
    },
    fraisDiversParDepartement: {
      "10": {
        cadastre: 116,
        conservation: 146,
        formalites: 191
      },
      "11": {
        cadastre: 117,
        conservation: 147,
        formalites: 192
      },
      "12": {
        cadastre: 117,
        conservation: 147,
        formalites: 192
      },
      "13": {
        cadastre: 130,
        conservation: 160,
        formalites: 205
      },
      "14": {
        cadastre: 120,
        conservation: 150,
        formalites: 195
      },
      "15": {
        cadastre: 116,
        conservation: 146,
        formalites: 191
      },
      "16": {
        cadastre: 119,
        conservation: 149,
        formalites: 194
      },
      "17": {
        cadastre: 121,
        conservation: 151,
        formalites: 196
      },
      "18": {
        cadastre: 118,
        conservation: 148,
        formalites: 193
      },
      "19": {
        cadastre: 117,
        conservation: 147,
        formalites: 192
      },
      "21": {
        cadastre: 121,
        conservation: 151,
        formalites: 198
      },
      "22": {
        cadastre: 120,
        conservation: 150,
        formalites: 195
      },
      "23": {
        cadastre: 116,
        conservation: 146,
        formalites: 191
      },
      "24": {
        cadastre: 123,
        conservation: 153,
        formalites: 198
      },
      "25": {
        cadastre: 120,
        conservation: 150,
        formalites: 200
      },
      "26": {
        cadastre: 120,
        conservation: 150,
        formalites: 200
      },
      "27": {
        cadastre: 120,
        conservation: 150,
        formalites: 195
      },
      "28": {
        cadastre: 119,
        conservation: 149,
        formalites: 194
      },
      "29": {
        cadastre: 121,
        conservation: 151,
        formalites: 196
      },
      "30": {
        cadastre: 119,
        conservation: 149,
        formalites: 194
      },
      "31": {
        cadastre: 125,
        conservation: 155,
        formalites: 200
      },
      "32": {
        cadastre: 118,
        conservation: 148,
        formalites: 193
      },
      "33": {
        cadastre: 127,
        conservation: 157,
        formalites: 202
      },
      "34": {
        cadastre: 122,
        conservation: 152,
        formalites: 197
      },
      "35": {
        cadastre: 121,
        conservation: 151,
        formalites: 196
      },
      "36": {
        cadastre: 117,
        conservation: 147,
        formalites: 192
      },
      "37": {
        cadastre: 119,
        conservation: 149,
        formalites: 194
      },
      "38": {
        cadastre: 124,
        conservation: 154,
        formalites: 199
      },
      "39": {
        cadastre: 118,
        conservation: 148,
        formalites: 193
      },
      "40": {
        cadastre: 121,
        conservation: 151,
        formalites: 196
      },
      "41": {
        cadastre: 118,
        conservation: 148,
        formalites: 193
      },
      "42": {
        cadastre: 123,
        conservation: 153,
        formalites: 198
      },
      "43": {
        cadastre: 116,
        conservation: 146,
        formalites: 191
      },
      "44": {
        cadastre: 123,
        conservation: 153,
        formalites: 198
      },
      "45": {
        cadastre: 118,
        conservation: 148,
        formalites: 193
      },
      "46": {
        cadastre: 117,
        conservation: 147,
        formalites: 192
      },
      "47": {
        cadastre: 122,
        conservation: 152,
        formalites: 197
      },
      "48": {
        cadastre: 117,
        conservation: 147,
        formalites: 192
      },
      "49": {
        cadastre: 120,
        conservation: 150,
        formalites: 200
      },
      "50": {
        cadastre: 119,
        conservation: 149,
        formalites: 194
      },
      "51": {
        cadastre: 116,
        conservation: 146,
        formalites: 191
      },
      "52": {
        cadastre: 116,
        conservation: 146,
        formalites: 191
      },
      "53": {
        cadastre: 120,
        conservation: 150,
        formalites: 200
      },
      "54": {
        cadastre: 118,
        conservation: 148,
        formalites: 193
      },
      "55": {
        cadastre: 117,
        conservation: 147,
        formalites: 192
      },
      "56": {
        cadastre: 121,
        conservation: 151,
        formalites: 196
      },
      "57": {
        cadastre: 118,
        conservation: 148,
        formalites: 193
      },
      "58": {
        cadastre: 120,
        conservation: 150,
        formalites: 200
      },
      "59": {
        cadastre: 120,
        conservation: 150,
        formalites: 195
      },
      "60": {
        cadastre: 119,
        conservation: 149,
        formalites: 194
      },
      "61": {
        cadastre: 119,
        conservation: 149,
        formalites: 194
      },
      "62": {
        cadastre: 118,
        conservation: 148,
        formalites: 193
      },
      "63": {
        cadastre: 117,
        conservation: 147,
        formalites: 192
      },
      "64": {
        cadastre: 123,
        conservation: 153,
        formalites: 198
      },
      "65": {
        cadastre: 120,
        conservation: 150,
        formalites: 195
      },
      "66": {
        cadastre: 121,
        conservation: 151,
        formalites: 196
      },
      "67": {
        cadastre: 120,
        conservation: 150,
        formalites: 195
      },
      "68": {
        cadastre: 120,
        conservation: 150,
        formalites: 200
      },
      "69": {
        cadastre: 128,
        conservation: 158,
        formalites: 203
      },
      "70": {
        cadastre: 117,
        conservation: 147,
        formalites: 192
      },
      "71": {
        cadastre: 120,
        conservation: 150,
        formalites: 197
      },
      "72": {
        cadastre: 120,
        conservation: 150,
        formalites: 200
      },
      "73": {
        cadastre: 124,
        conservation: 154,
        formalites: 199
      },
      "74": {
        cadastre: 125,
        conservation: 155,
        formalites: 200
      },
      "75": {
        cadastre: 150,
        conservation: 180,
        formalites: 220
      },
      "76": {
        cadastre: 122,
        conservation: 152,
        formalites: 197
      },
      "77": {
        cadastre: 125,
        conservation: 155,
        formalites: 195
      },
      "78": {
        cadastre: 135,
        conservation: 165,
        formalites: 205
      },
      "79": {
        cadastre: 120,
        conservation: 150,
        formalites: 195
      },
      "80": {
        cadastre: 118,
        conservation: 148,
        formalites: 193
      },
      "81": {
        cadastre: 118,
        conservation: 148,
        formalites: 193
      },
      "82": {
        cadastre: 118,
        conservation: 148,
        formalites: 193
      },
      "83": {
        cadastre: 126,
        conservation: 156,
        formalites: 201
      },
      "84": {
        cadastre: 120,
        conservation: 150,
        formalites: 195
      },
      "85": {
        cadastre: 120,
        conservation: 150,
        formalites: 200
      },
      "86": {
        cadastre: 119,
        conservation: 149,
        formalites: 194
      },
      "87": {
        cadastre: 117,
        conservation: 147,
        formalites: 192
      },
      "88": {
        cadastre: 120,
        conservation: 150,
        formalites: 200
      },
      "89": {
        cadastre: 120,
        conservation: 150,
        formalites: 200
      },
      "90": {
        cadastre: 120,
        conservation: 150,
        formalites: 200
      },
      "91": {
        cadastre: 130,
        conservation: 160,
        formalites: 200
      },
      "92": {
        cadastre: 145,
        conservation: 175,
        formalites: 215
      },
      "93": {
        cadastre: 140,
        conservation: 170,
        formalites: 210
      },
      "94": {
        cadastre: 140,
        conservation: 170,
        formalites: 210
      },
      "95": {
        cadastre: 130,
        conservation: 160,
        formalites: 200
      },
      "971": {
        cadastre: 160,
        conservation: 190,
        formalites: 240
      },
      "972": {
        cadastre: 160,
        conservation: 190,
        formalites: 240
      },
      "973": {
        cadastre: 160,
        conservation: 190,
        formalites: 240
      },
      "974": {
        cadastre: 160,
        conservation: 190,
        formalites: 240
      },
      "975": {
        cadastre: 160,
        conservation: 190,
        formalites: 240
      },
      "976": {
        cadastre: 160,
        conservation: 190,
        formalites: 240
      },
      "01": {
        cadastre: 120,
        conservation: 150,
        formalites: 200
      },
      "02": {
        cadastre: 118,
        conservation: 148,
        formalites: 193
      },
      "03": {
        cadastre: 117,
        conservation: 147,
        formalites: 192
      },
      "04": {
        cadastre: 123,
        conservation: 153,
        formalites: 198
      },
      "05": {
        cadastre: 122,
        conservation: 152,
        formalites: 197
      },
      "06": {
        cadastre: 135,
        conservation: 165,
        formalites: 210
      },
      "07": {
        cadastre: 120,
        conservation: 150,
        formalites: 200
      },
      "08": {
        cadastre: 116,
        conservation: 146,
        formalites: 191
      },
      "09": {
        cadastre: 116,
        conservation: 146,
        formalites: 191
      },
      "2A": {
        cadastre: 140,
        conservation: 170,
        formalites: 215
      },
      "2B": {
        cadastre: 140,
        conservation: 170,
        formalites: 215
      }
    },
    tva: 0.2,
    csi: {
      taux: 1e-3,
      minimum: 15
    },
    droitsMutation: {
      standard: 0.0632,
      neuf: 715e-5,
      reduit: 0.0509,
      departementsReduits: ["36", "976"]
    }
  },
  dmto: {
    "10": 6.32,
    "11": 6.32,
    "12": 6.32,
    "13": 6.32,
    "14": 6.32,
    "15": 6.32,
    "16": 5.8,
    "17": 6.32,
    "18": 6.32,
    "19": 6.32,
    "21": 6.32,
    "22": 6.32,
    "23": 6.32,
    "24": 6.32,
    "25": 6.32,
    "26": 5.8,
    "27": 5.8,
    "28": 6.32,
    "29": 6.32,
    "30": 6.32,
    "31": 6.32,
    "32": 6.32,
    "33": 6.32,
    "34": 6.32,
    "35": 6.32,
    "36": 5.09,
    "37": 6.32,
    "38": 6.32,
    "39": 6.32,
    "40": 6.32,
    "41": 6.32,
    "42": 6.32,
    "43": 6.32,
    "44": 6.32,
    "45": 6.32,
    "46": 6.32,
    "47": 6.32,
    "48": 5.8,
    "49": 6.32,
    "50": 6.32,
    "51": 6.32,
    "52": 6.32,
    "53": 6.32,
    "54": 6.32,
    "55": 6.32,
    "56": 6.32,
    "57": 6.32,
    "58": 6.32,
    "59": 6.32,
    "60": 5.8,
    "61": 6.32,
    "62": 6.32,
    "63": 6.32,
    "64": 6.32,
    "65": 5.8,
    "66": 6.32,
    "67": 6.32,
    "68": 6.32,
    "69": 6.32,
    "70": 6.32,
    "71": 5.8,
    "72": 6.32,
    "73": 6.32,
    "74": 6.32,
    "75": 6.32,
    "76": 6.32,
    "77": 6.32,
    "78": 6.32,
    "79": 6.32,
    "80": 6.32,
    "81": 6.32,
    "82": 6.32,
    "83": 6.32,
    "84": 6.32,
    "85": 6.32,
    "86": 6.32,
    "87": 6.32,
    "88": 6.32,
    "89": 6.32,
    "90": 6.32,
    "91": 6.32,
    "92": 6.32,
    "93": 6.32,
    "94": 6.32,
    "95": 6.32,
    "971": 5.8,
    "972": 5.8,
    "973": 6.32,
    "974": 6.32,
    "976": 5.09,
    "01": 6.32,
    "02": 6.32,
    "03": 6.32,
    "04": 6.32,
    "05": 5.8,
    "06": 5.8,
    "07": 5.8,
    "08": 6.32,
    "09": 6.32,
    "2A": 6.32,
    "2B": 6.32
  },
  indemnites_kilometriques: {
    voiture: {
      "2024": [
        {
          puissance: "3CV et moins",
          jusqu_5000: 0.502,
          de_5001_20000: 0.3,
          au_dela_20000: 0.36
        },
        {
          puissance: "4CV",
          jusqu_5000: 0.575,
          de_5001_20000: 0.323,
          au_dela_20000: 0.387
        },
        {
          puissance: "5CV",
          jusqu_5000: 0.603,
          de_5001_20000: 0.339,
          au_dela_20000: 0.407
        },
        {
          puissance: "6CV",
          jusqu_5000: 0.631,
          de_5001_20000: 0.355,
          au_dela_20000: 0.427
        },
        {
          puissance: "7CV et plus",
          jusqu_5000: 0.659,
          de_5001_20000: 0.371,
          au_dela_20000: 0.447
        }
      ],
      "2025": [
        {
          puissance: "3CV et moins",
          jusqu_5000: 0.502,
          de_5001_20000: 0.3,
          au_dela_20000: 0.36
        },
        {
          puissance: "4CV",
          jusqu_5000: 0.575,
          de_5001_20000: 0.323,
          au_dela_20000: 0.387
        },
        {
          puissance: "5CV",
          jusqu_5000: 0.603,
          de_5001_20000: 0.339,
          au_dela_20000: 0.407
        },
        {
          puissance: "6CV",
          jusqu_5000: 0.631,
          de_5001_20000: 0.355,
          au_dela_20000: 0.427
        },
        {
          puissance: "7CV et plus",
          jusqu_5000: 0.659,
          de_5001_20000: 0.371,
          au_dela_20000: 0.447
        }
      ],
      "2026": [
        {
          puissance: "3CV et moins",
          jusqu_5000: 0.502,
          de_5001_20000: 0.3,
          au_dela_20000: 0.36
        },
        {
          puissance: "4CV",
          jusqu_5000: 0.575,
          de_5001_20000: 0.323,
          au_dela_20000: 0.387
        },
        {
          puissance: "5CV",
          jusqu_5000: 0.603,
          de_5001_20000: 0.339,
          au_dela_20000: 0.407
        },
        {
          puissance: "6CV",
          jusqu_5000: 0.631,
          de_5001_20000: 0.355,
          au_dela_20000: 0.427
        },
        {
          puissance: "7CV et plus",
          jusqu_5000: 0.659,
          de_5001_20000: 0.371,
          au_dela_20000: 0.447
        }
      ]
    },
    deux_roues: {
      moins_50cc: 0.315,
      "50cc_125cc": 0.388,
      plus_125cc: 0.453
    }
  },
  jours_feries: {
    "2025": [
      {
        date: "2025-01-01",
        nom: "Jour de l'An",
        fixe: true
      },
      {
        date: "2025-05-01",
        nom: "F\xEAte du Travail",
        fixe: true
      },
      {
        date: "2025-05-08",
        nom: "F\xEAte de la Victoire",
        fixe: true
      },
      {
        date: "2025-07-14",
        nom: "F\xEAte Nationale",
        fixe: true
      },
      {
        date: "2025-08-15",
        nom: "Assomption",
        fixe: true
      },
      {
        date: "2025-11-01",
        nom: "Toussaint",
        fixe: true
      },
      {
        date: "2025-11-11",
        nom: "Armistice",
        fixe: true
      },
      {
        date: "2025-12-25",
        nom: "No\xEBl",
        fixe: true
      },
      {
        date: "2025-04-21",
        nom: "Lundi de P\xE2ques",
        fixe: false
      },
      {
        date: "2025-05-29",
        nom: "Ascension",
        fixe: false
      },
      {
        date: "2025-06-09",
        nom: "Lundi de Pentec\xF4te",
        fixe: false
      }
    ],
    "2026": [
      {
        date: "2026-01-01",
        nom: "Jour de l'An",
        fixe: true
      },
      {
        date: "2026-05-01",
        nom: "F\xEAte du Travail",
        fixe: true
      },
      {
        date: "2026-05-08",
        nom: "F\xEAte de la Victoire",
        fixe: true
      },
      {
        date: "2026-07-14",
        nom: "F\xEAte Nationale",
        fixe: true
      },
      {
        date: "2026-08-15",
        nom: "Assomption",
        fixe: true
      },
      {
        date: "2026-11-01",
        nom: "Toussaint",
        fixe: true
      },
      {
        date: "2026-11-11",
        nom: "Armistice",
        fixe: true
      },
      {
        date: "2026-12-25",
        nom: "No\xEBl",
        fixe: true
      },
      {
        date: "2026-04-06",
        nom: "Lundi de P\xE2ques",
        fixe: false
      },
      {
        date: "2026-05-14",
        nom: "Ascension",
        fixe: false
      },
      {
        date: "2026-05-25",
        nom: "Lundi de Pentec\xF4te",
        fixe: false
      }
    ]
  },
  taxe_fonciere: {
    abattements: {
      residence_principale: 0.15,
      personne_agee: {
        seuil_age: 65,
        taux: 0.1
      },
      personne_handicapee: 0.1
    },
    taux_moyens_par_region: {
      ile_de_france: 0.0135,
      provence_alpes_cote_azur: 0.0142,
      auvergne_rhone_alpes: 0.0128,
      occitanie: 0.0155,
      nouvelle_aquitaine: 0.0148,
      grand_est: 0.0132,
      hauts_de_france: 0.0145,
      normandie: 0.0138,
      centre_val_de_loire: 0.0151,
      bourgogne_franche_comte: 0.0144,
      pays_de_la_loire: 0.014,
      bretagne: 0.0147,
      corse: 0.0125
    }
  },
  duree_travail: {
    duree_legale_hebdomadaire: 35,
    duree_legale_annuelle: 1607,
    majorations_heures_sup: {
      de_36_43h: 0.25,
      au_dela_43h: 0.5
    },
    contingent_annuel_heures_sup: 220,
    repos_compensateur: {
      seuil_declenchement: 43,
      taux: 1.5
    }
  },
  impot: {
    annee: 2026,
    tranches: [
      {
        plafond: 11497,
        taux: 0
      },
      {
        plafond: 28797,
        taux: 0.11
      },
      {
        plafond: 82341,
        taux: 0.3
      },
      {
        plafond: 177106,
        taux: 0.41
      },
      {
        plafond: 999999999,
        taux: 0.45
      }
    ],
    source: "Article 197 CGI - Bar\xE8me officiel 2026",
    checked_at: "2026-02-09T22:00:00.000Z"
  },
  smic: {
    annee: 2025,
    horaire_brut: 11.88,
    mensuel_brut_35h: 1801.8,
    note: "Montants 2025 en attendant publication officielle 2026"
  },
  apl: {
    version: "2026",
    plafonds_loyer: {
      zone1: {
        seul: 610,
        couple: 670,
        couple_1_enfant: 730,
        couple_2_enfants: 790
      },
      zone2: {
        seul: 510,
        couple: 560,
        couple_1_enfant: 610,
        couple_2_enfants: 660
      },
      zone3: {
        seul: 430,
        couple: 480,
        couple_1_enfant: 530,
        couple_2_enfants: 580
      }
    },
    multiplicateurs_region: {
      idf: 1.15,
      province: 1,
      dom: 0.95
    }
  }
};

// src/utils/notaireCalculEngine.ts
var bjson = baremes_default;
function getDmtoTaux(departement) {
  const c = String(departement);
  if (bjson.dmto && bjson.dmto[c] != null) {
    return Number(bjson.dmto[c]) / 100;
  }
  return Number(bjson.notaire?.droitsMutation?.standard || 0.0581);
}
function getDeboursFormalites(departement) {
  const c = String(departement);
  const dep = bjson.notaire?.fraisDiversParDepartement?.[c];
  if (dep) {
    return {
      debours: Number(dep.cadastre || 0) + Number(dep.conservation || 0),
      formalites: Number(dep.formalites || 0)
    };
  }
  const fd = bjson.notaire?.fraisDivers || { cadastre: 0, conservation: 0, formalites: 0 };
  return {
    debours: Number(fd.cadastre || 0) + Number(fd.conservation || 0),
    formalites: Number(fd.formalites || 0)
  };
}
function calculerNotaire(data) {
  const prixAchat = Math.max(0, data.prixAchat || 0);
  const montantMobilier = Math.max(0, data.montantMobilier || 0);
  const typeBien = data.typeBien;
  const departement = data.departement;
  const typeEmprunt = data.typeEmprunt || "sans";
  const pretsAides = Math.max(0, data.pretsAides || 0);
  const autresPrets = Math.max(0, data.autresPrets || 0);
  const remiseVar = data.remiseNotarialeVariable === true;
  const prixNetImmobilier = prixAchat - montantMobilier;
  const montantTotalPrets = pretsAides + autresPrets;
  const tranches = (bjson.notaire?.tranches || []).map((t) => ({
    min: t.min,
    max: t.max === 999999999 ? Infinity : t.max,
    taux: Number(t.taux)
  }));
  const trancheDefaut = tranches.length > 0 ? tranches : [
    { min: 0, max: 6500, taux: 0.0387 },
    { min: 6500, max: 17e3, taux: 0.01596 },
    { min: 17e3, max: 6e4, taux: 0.01064 },
    { min: 6e4, max: Infinity, taux: 799e-5 }
  ];
  let emoluments = 0;
  let emolumentsSansRemise = 0;
  let reste = prixNetImmobilier;
  for (const tranche of trancheDefaut) {
    if (reste <= 0) break;
    const montantTranche = Math.min(reste, tranche.max - tranche.min);
    emoluments += montantTranche * tranche.taux;
    emolumentsSansRemise += montantTranche * tranche.taux;
    reste -= montantTranche;
  }
  let remiseMontant = 0;
  if (remiseVar) {
    remiseMontant = emoluments * 0.1;
    emoluments = emoluments * 0.9;
  }
  const { debours, formalites } = getDeboursFormalites(departement);
  const csi = Math.max(
    prixNetImmobilier * Number(bjson.notaire?.csi?.taux || 1e-3),
    Number(bjson.notaire?.csi?.minimum || 15)
  );
  let fraisHypotheque = 0;
  if (typeEmprunt === "avec_garantie" && montantTotalPrets > 0) {
    fraisHypotheque = Math.max(375, montantTotalPrets * 0.015);
  } else if (typeEmprunt === "sans_garantie" && montantTotalPrets > 0) {
    fraisHypotheque = 150;
  }
  const fraisTerrain = typeBien === "terrain" ? 100 : 0;
  const tva = Math.round((emoluments + formalites) * 0.2 * 100) / 100;
  let tauxDroits = getDmtoTaux(departement);
  let droitsEnregistrement = Math.round(prixNetImmobilier * tauxDroits * 100) / 100;
  if (typeBien === "neuf") {
    tauxDroits = 715e-5;
    droitsEnregistrement = Math.round(prixNetImmobilier * tauxDroits * 100) / 100;
  }
  const total = Math.round(
    (emoluments + droitsEnregistrement + debours + formalites + csi + fraisHypotheque + fraisTerrain + tva) * 100
  ) / 100;
  const pourcentage = prixAchat > 0 ? Math.round(total / prixAchat * 1e4) / 100 : 0;
  return {
    success: true,
    emoluments: Math.round(emoluments * 100) / 100,
    emolumentsSansRemise: Math.round(emolumentsSansRemise * 100) / 100,
    remiseMontant: Math.round(remiseMontant * 100) / 100,
    debours: Math.round(debours * 100) / 100,
    formalites: Math.round(formalites * 100) / 100,
    csi: Math.round(csi * 100) / 100,
    fraisHypotheque: Math.round(fraisHypotheque * 100) / 100,
    fraisTerrain: Math.round(fraisTerrain * 100) / 100,
    droitsEnregistrement,
    tauxDroits,
    tva,
    total,
    pourcentage,
    prixAchat: Math.round(prixAchat * 100) / 100,
    prixNetImmobilier: Math.round(prixNetImmobilier * 100) / 100,
    montantMobilier: Math.round(montantMobilier * 100) / 100,
    montantTotalPrets: Math.round(montantTotalPrets * 100) / 100
  };
}

// api-src/v1/notaire.ts
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
      prixAchat,
      typeBien,
      departement,
      montantMobilier,
      typeEmprunt,
      pretsAides,
      autresPrets,
      remiseNotarialeVariable
    } = req.body || {};
    if (prixAchat === void 0 || !typeBien || !departement) {
      return res.status(400).json({
        error: "Champs requis : prixAchat, typeBien, departement.",
        exemple: { prixAchat: 25e4, typeBien: "ancien", departement: "75" }
      });
    }
    const result = calculerNotaire({
      prixAchat: Number(prixAchat) || 0,
      typeBien,
      departement: String(departement),
      montantMobilier: Number(montantMobilier) || 0,
      typeEmprunt,
      pretsAides: Number(pretsAides) || 0,
      autresPrets: Number(autresPrets) || 0,
      remiseNotarialeVariable: Boolean(remiseNotarialeVariable)
    });
    return res.status(200).json(withMeta("notaire", result));
  } catch (err) {
    console.error("API /v1/notaire error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
export {
  handler as default
};
