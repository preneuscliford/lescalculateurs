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
      departementsReduits: [
        "36"
      ]
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
    "27": 6.32,
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
    "972": 6.32,
    "973": 6.32,
    "974": 6.32,
    "976": 5.8,
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
          jusqu_5000: 0.529,
          de_5001_20000: 0.316,
          au_dela_20000: 0.37
        },
        {
          puissance: "4CV",
          jusqu_5000: 0.606,
          de_5001_20000: 0.34,
          au_dela_20000: 0.407
        },
        {
          puissance: "5CV",
          jusqu_5000: 0.636,
          de_5001_20000: 0.357,
          au_dela_20000: 0.427
        },
        {
          puissance: "6CV",
          jusqu_5000: 0.665,
          de_5001_20000: 0.374,
          au_dela_20000: 0.447
        },
        {
          puissance: "7CV et plus",
          jusqu_5000: 0.697,
          de_5001_20000: 0.394,
          au_dela_20000: 0.47
        }
      ],
      "2025": [
        {
          puissance: "3CV et moins",
          jusqu_5000: 0.529,
          de_5001_20000: 0.316,
          au_dela_20000: 0.37
        },
        {
          puissance: "4CV",
          jusqu_5000: 0.606,
          de_5001_20000: 0.34,
          au_dela_20000: 0.407
        },
        {
          puissance: "5CV",
          jusqu_5000: 0.636,
          de_5001_20000: 0.357,
          au_dela_20000: 0.427
        },
        {
          puissance: "6CV",
          jusqu_5000: 0.665,
          de_5001_20000: 0.374,
          au_dela_20000: 0.447
        },
        {
          puissance: "7CV et plus",
          jusqu_5000: 0.697,
          de_5001_20000: 0.394,
          au_dela_20000: 0.47
        }
      ],
      "2026": [
        {
          puissance: "3CV et moins",
          jusqu_5000: 0.529,
          de_5001_20000: 0.316,
          au_dela_20000: 0.37
        },
        {
          puissance: "4CV",
          jusqu_5000: 0.606,
          de_5001_20000: 0.34,
          au_dela_20000: 0.407
        },
        {
          puissance: "5CV",
          jusqu_5000: 0.636,
          de_5001_20000: 0.357,
          au_dela_20000: 0.427
        },
        {
          puissance: "6CV",
          jusqu_5000: 0.665,
          de_5001_20000: 0.374,
          au_dela_20000: 0.447
        },
        {
          puissance: "7CV et plus",
          jusqu_5000: 0.697,
          de_5001_20000: 0.394,
          au_dela_20000: 0.47
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
    ],
    "2027": [
      {
        date: "2027-01-01",
        nom: "Jour de l'An",
        fixe: true
      },
      {
        date: "2027-03-29",
        nom: "Lundi de P\xE2ques",
        fixe: false
      },
      {
        date: "2027-05-01",
        nom: "F\xEAte du Travail",
        fixe: true
      },
      {
        date: "2027-05-06",
        nom: "Ascension",
        fixe: false
      },
      {
        date: "2027-05-08",
        nom: "F\xEAte de la Victoire",
        fixe: true
      },
      {
        date: "2027-05-17",
        nom: "Lundi de Pentec\xF4te",
        fixe: false
      },
      {
        date: "2027-07-14",
        nom: "F\xEAte Nationale",
        fixe: true
      },
      {
        date: "2027-08-15",
        nom: "Assomption",
        fixe: true
      },
      {
        date: "2027-11-01",
        nom: "Toussaint",
        fixe: true
      },
      {
        date: "2027-11-11",
        nom: "Armistice",
        fixe: true
      },
      {
        date: "2027-12-25",
        nom: "No\xEBl",
        fixe: true
      }
    ]
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
        plafond: 11600,
        taux: 0
      },
      {
        plafond: 29579,
        taux: 0.11
      },
      {
        plafond: 84577,
        taux: 0.3
      },
      {
        plafond: 181917,
        taux: 0.41
      },
      {
        plafond: 999999999,
        taux: 0.45
      }
    ],
    source: "Article 197 CGI, loi n\xB02026-103 du 19/02/2026 - https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051212954",
    checked_at: "2026-08-11T00:00:00.000Z"
  },
  smic: {
    annee: 2026,
    horaire_brut: 12.31,
    mensuel_brut_35h: 1867.02,
    note: "Deuxi\xE8me revalorisation 2026 au 1er juin (+2,41%, apr\xE8s +1,18% au 1er janvier)",
    checked_at: "2026-08-11T00:00:00.000Z"
  },
  apl: {
    version: "2026.10",
    plafonds_loyer: {
      date_effet: "2026-10-01",
      source: "Arr\xEAt\xE9 du 28 septembre 2026 (JORF du 30/09/2026) - bar\xE8me CAF locataires",
      zone1: {
        seul: 336.97,
        couple: 406.4,
        une_personne_a_charge: 459.32,
        par_personne_supplementaire: 66.65
      },
      zone2: {
        seul: 293.68,
        couple: 359.47,
        une_personne_a_charge: 404.49,
        par_personne_supplementaire: 58.88
      },
      zone3: {
        seul: 275.25,
        couple: 333.67,
        une_personne_a_charge: 374.13,
        par_personne_supplementaire: 53.62
      }
    }
  }
};

// src/data/social-baremes.ts
var baremesData = baremes_default;
var socialBaremes = {
  rsa: {
    version: "2026.05",
    dateEffet: "2026-04-01",
    sourceUrl: "https://solidarites.gouv.fr/revalorisation-annuelle-des-prestations-sociales-au-1er-avril-2026",
    sourceUrls: [
      "https://www.service-public.gouv.fr/particuliers/vosdroits/N19775",
      "https://www.caf.fr/allocataires/caf-des-bouches-du-rhone/offre-de-service/vie-professionnelle/le-revenu-de-solidarite-active-rsa"
    ],
    note: "Montants 2026 derives de la revalorisation officielle de 0,8 % appliquee au bareme RSA du 1er avril 2025.",
    montantForfaitaireBase: 651.69,
    coefficientsFoyer: {
      seulSansEnfant: 1,
      coupleOuSeulAvec1Enfant: 1.5,
      coupleAvec1OuSeulAvec2Enfants: 1.8,
      coupleAvec2Enfants: 2.1,
      personneSupplementaire: 0.4
    },
    // Montants officiels au 1er avril 2026 (service-public.gouv.fr F19778)
    forfaitLogement: {
      unePersonne: 78.2,
      deuxPersonnes: 156.41,
      troisPersonnesOuPlus: 193.55
    },
    // Depuis le 1er janvier 2016, le complement de revenus d'activite (ancien
    // "RSA activite", 62 %) est remplace par la prime d'activite : les revenus
    // d'activite sont retenus en totalite dans les ressources du RSA (DREES,
    // fiche "La prime d'activite").
    revenusActivitePrisEnCompte: 1,
    // Le RSA n'est pas verse si le montant du est inferieur a 6 EUR (CAF, via MoneyVox 2026)
    montantMinimumVerse: 6
  },
  primeActivite: {
    version: "2026.05",
    dateEffet: "2026-04-01",
    sourceUrl: "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-prime-d-activite",
    sourceUrls: [
      "https://www.caf.fr/allocataires/actualites/actualites-nationales/la-prime-d-activite-augmente-en-2026",
      "https://www.service-public.gouv.fr/particuliers/vosdroits/F2882"
    ],
    montantForfaitaire: {
      nonMajoree: {
        unePersonne: 638.28,
        coupleOuIsole1Enfant: 957.42,
        couple1EnfantOuIsole2Enfants: 1148.9,
        couple2Enfants: 1340.38,
        isole3Enfants: 1404.21,
        couple3Enfants: 1595.69,
        personneSupplementaire: 255.32
      },
      majoree: {
        grossesse: 819.63,
        isole1Enfant: 1092.84,
        isole2Enfants: 1366.05,
        isole3Enfants: 1639.26,
        isole4Enfants: 1912.47,
        personneSupplementaire: 271.04
      }
    },
    forfaitLogement: {
      unePersonne: 76.59,
      deuxPersonnes: 153.19,
      troisPersonnesOuPlus: 189.57
    },
    // Bonification individuelle, calculée pour chaque membre du foyer qui travaille
    // (service-public.gouv.fr F2882, vérifié le 1er juin 2026)
    bonification: {
      montantMaximum: 240.63,
      seuilDebut: 726.29,
      seuilMaximum: 1698.78
    },
    // 59,85 % depuis le 1er avril 2025 (61 % auparavant) - DREES, Minima
    // sociaux et prestations sociales, edition 2025, fiche 30.
    revenusProfessionnelsPrisEnCompte: 0.5985,
    montantMinimumVerse: 15
  },
  // Allocations familiales au 1er avril 2026 (montants nets de CRDS, taux plein) et
  // plafonds 2026 sur les revenus 2024 (service-public.gouv.fr F13213). Comptées
  // dans les ressources de la prime d'activité (F39753, vérifié le 1er juillet 2026).
  allocationsFamiliales: {
    version: "2026.04",
    dateEffet: "2026-04-01",
    sourceUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F13213",
    tauxPlein: { deuxEnfants: 152.25, troisEnfants: 347.32, parEnfantSupplementaire: 195.07 },
    moitie: { deuxEnfants: 76.13, troisEnfants: 173.67, parEnfantSupplementaire: 97.53 },
    quart: { deuxEnfants: 38.07, troisEnfants: 86.83, parEnfantSupplementaire: 48.77 },
    majorationAge: { tauxPlein: 76.13, moitie: 38.07, quart: 19.03 },
    plafondsRessources: { tranche1DeuxEnfants: 79980, tranche2DeuxEnfants: 106604, parEnfantSupplementaire: 6664 }
  },
  asf: {
    version: "2026.05",
    dateEffet: "2026-04-01",
    sourceUrl: "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/l-allocation-de-soutien-familial-asf",
    sourceUrls: [
      "https://www.service-public.gouv.fr/particuliers/vosdroits/F33647",
      "https://pension-alimentaire.caf.fr/web/guest/l-allocation-de-soutien-familial-asf"
    ],
    sansConditionRessources: true,
    montantParEnfant: 200.78,
    montantParEnfantPriveDeuxParents: 267.63
  },
  are: {
    // Pas de revalorisation au 1er juillet 2026 (CA Unedic du 30/06/2026) :
    // les montants du 1er juillet 2025 restent en vigueur.
    version: "2026.07",
    dateEffet: "2025-07-01",
    sourceUrl: "https://www.francetravail.fr/faq/candidat/mes-allocations---mes-aides/lallocation-chomage-lessentiel-a/montant-allocation-france-travai.html",
    sourceUrls: [
      "https://www.service-public.gouv.fr/particuliers/vosdroits/F38881",
      "https://www.service-public.gouv.fr/particuliers/actualites/A15787"
    ],
    reglesEligibilite: {
      dureeAffiliationMois: 6,
      fenetreReferenceMoins55AnsMois: 24,
      fenetreReference55AnsEtPlusMois: 36
    },
    calculJournalier: {
      tauxOption1: 0.404,
      partFixe: 13.18,
      tauxOption2: 0.57,
      minimumJournalier: 32.13,
      plafondPourcentageSjr: 0.75,
      coefficientMensuel: 30.42
    },
    dureeMaximaleJours: {
      moinsDe55Ans: 548,
      de55a56Ans: 685,
      aPartirDe57Ans: 822
    },
    // Rupture conventionnelle : durees reduites pour les contrats rompus a
    // compter du 1er septembre 2026 (loi n° 2026-470 du 11 juin 2026) :
    // 15 mois avant 55 ans, 20,5 mois a partir de 55 ans.
    ruptureConventionnelle: {
      dateEffet: "2026-09-01",
      sourceUrl: "https://normandie.dreets.gouv.fr/Rupture-conventionnelle-et-chomage-ce-qui-change-au-1er-septembre-2026-%F0%9F%93%84",
      dureeMaximaleJours: {
        moinsDe55Ans: 456,
        de55a56Ans: 624,
        aPartirDe57Ans: 624
      }
    },
    // Durée d'indemnisation (Unédic, fiche « Durée d'indemnisation » mise à jour le 05/10/2026,
    // et « Paramètres utiles » avril 2026) : jours calendaires depuis le 1er jour du 1er contrat
    // de la période de référence jusqu'à la fin du contrat, jours non travaillés retenus dans la
    // limite de 70 % des jours travaillés, × 0,75 pour les fins de contrat depuis le 01/02/2023
    // (sauf résidents d'outre-mer), sans descendre sous 182 jours.
    dureeIndemnisation: {
      sourceUrl: "https://www.unedic.org/la-reglementation/fiches-thematiques/duree-dindemnisation",
      coefficient: 0.75,
      dateEffetCoefficient: "2023-02-01",
      dureeMinimaleJours: 182,
      ratioJoursNonTravaillesMax: 0.7
    },
    // Délai d'attente et différés (Unédic, fiches « Différé d'indemnisation spécifique » et
    // « Allocation d'aide au retour à l'emploi », mises à jour le 05/10/2026) :
    // délai d'attente de 7 jours (une fois par période de 12 mois) ; différé congés payés =
    // indemnités compensatrices de congés payés ÷ SJR, 30 jours au plus ; différé spécifique =
    // indemnités supra-légales ÷ 111,8 (valeur 2026), 150 jours au plus, 75 jours en cas de
    // licenciement économique. Le délai d'attente court après les différés, au plus tôt à la date
    // d'inscription à France Travail.
    delais: {
      sourceUrl: "https://www.unedic.org/la-reglementation/fiches-thematiques/differe-dindemnisation-specifique-en-cas-dindemnites-supra-legales",
      delaiAttenteJours: 7,
      differeCongesPayesMaxJours: 30,
      differeSpecifique: {
        diviseur: 111.8,
        annee: 2026,
        maxJours: 150,
        maxJoursLicenciementEconomique: 75
      }
    },
    // Inscription dans les 12 mois suivant la fin du contrat, sous peine de perdre ses droits
    // (France Travail, « Dans quel délai faut-il s'inscrire… », délai de forclusion)
    forclusion: {
      sourceUrl: "https://www.francetravail.fr/candidat/mes-droits-aux-aides-et-allocati/allocations-et-aides--les-repons/allocations--attention-aux-idees/quel-est-le-delai-faut-il-sinscr.html",
      mois: 12
    },
    // Dégressivité (Unédic, fiche ARE du 05/10/2026 et « Paramètres utiles » avril 2026) :
    // pour les moins de 55 ans à la fin du contrat (57 ans si la fin de contrat ou la procédure
    // de licenciement est antérieure au 01/04/2025), allocation journalière supérieure à 92,57 €
    // réduite de 30 % à partir du 7e mois d'indemnisation, sans descendre sous 92,57 €.
    degressivite: {
      sourceUrl: "https://www.unedic.org/la-reglementation/fiches-thematiques/allocation-d-aide-au-retour-a-l-emploi-are",
      coefficientReduction: 0.3,
      seuilAllocationJournaliere: 92.57,
      plancherAllocationJournaliere: 92.57,
      moisDebut: 7,
      ageExemption: 55,
      ageExemptionAvantReforme: 57,
      dateReformeAge: "2025-04-01"
    },
    // Report de la fin des droits (Unédic, pages lues le 25/10/2026) :
    // - arrêt maladie : le versement de l'ARE cesse et « la période où vous ne percevez pas votre
    //   allocation chômage est reportée et vient prolonger votre période d'indemnisation » ;
    // - reprise d'emploi (fiche « Cumul allocation-salaire » du 05/10/2026) : jours indemnisés
    //   dans le mois = [ARE du mois − 70 % du salaire brut] ÷ allocation journalière, arrondi à
    //   l'entier le plus proche ; allocation + salaire limités à SJR × 30,42 ; les jours non
    //   consommés prolongent les droits ;
    // - formation inscrite au contrat d'engagement ou financée par le CPF : suspend le décompte
    //   de la dégressivité (fiche ARE).
    report: {
      sourceUrlArretMaladie: "https://www.unedic.org/l-assurance-chomage-et-vous/demandeur-d-emploi-ou-salarie/mes-droits-en-fonction-de-mon-parcours/je-suis-en-arret-maladie-que-deviennent-mes-allocations-chomage",
      sourceUrlCumul: "https://www.unedic.org/la-reglementation/fiches-thematiques/cumul-allocation-salaire",
      partSalaireDeduite: 0.7,
      coefficientPlafondCumul: 30.42,
      // Mois de 30 jours pour l'estimation (la règle utilise le nombre de jours du mois concerné)
      joursParMois: 30
    }
  },
  apl: {
    version: "2026.10",
    dateEffet: "2026-10-01",
    sourceUrl: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054913928",
    sourceUrls: [
      "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-aides-au-logement",
      "https://www.service-public.gouv.fr/particuliers/vosdroits/F12006"
    ],
    plafondsLoyer: baremesData.apl.plafonds_loyer,
    // Formule officielle du secteur locatif (articles D. 823-16 et D. 823-17 du CCH),
    // paramètres de l'arrêté du 27 septembre 2019 en vigueur au 1er octobre 2026
    // (version consolidée Légifrance relue le 15/10/2026).
    formule: {
      // Art. 9 : forfait charges ; art. 16 : colocation
      forfaitCharges: { base: 61.29, parPersonneACharge: 13.9 },
      forfaitChargesColocation: { seul: 30.64, couple: 61.29, parPersonneACharge: 13.9 },
      coefficientPlafondColocation: 0.75,
      // Art. 10 : dégressivité puis suppression au-delà de ces multiples du plafond de loyer
      coefficientsDegressivite: {
        zone1: { degressivite: 3.4, suppression: 4 },
        zone2: { degressivite: 2.5, suppression: 3.1 },
        zone3: { degressivite: 2.5, suppression: 3.1 }
      },
      // Art. 11 : minoration forfaitaire ; art. 12 : seuil de versement (avant CRDS)
      minorationForfaitaire: 5,
      seuilVersement: { apl: 0, allocationLogement: 10 },
      // Art. 13 : participation minimale P0 = max(8,5 % de (L + C) ; 40,01 €)
      participationMinimale: { taux: 0.085, forfait: 40.01 },
      // Art. 14 : TF selon le nombre de personnes à charge (0 = isolé / couple)
      tauxFamille: {
        isole: 0.0283,
        couple: 0.0315,
        parPersonnesACharge: [0.027, 0.0238, 0.0201, 0.0185, 0.0179, 0.0173],
        majorationParPersonneSupplementaire: -6e-4
      },
      // Art. 14 : TL par tranches du rapport RL = L / LR
      tauxLoyer: { seuils: [0.45, 0.75], taux: [45e-4, 68e-4] },
      loyerReference: { isole: 293.68, couple: 359.47, unePersonneACharge: 404.49, parPersonneSupplementaire: 58.88 },
      // Art. 15 : forfait R0 (annuel)
      r0: {
        isole: 5235,
        couple: 7501,
        parPersonnesACharge: [8947, 9148, 9498, 9851, 10202, 10554],
        parPersonneSupplementaire: 346
      },
      // Ressources : revenus nets catégoriels (abattement 10 % pour frais professionnels),
      // arrondis à la centaine d'euros supérieure
      abattementFraisProfessionnels: 0.1,
      tauxCrds: 5e-3,
      // Art. 46 : outre-mer (Guadeloupe, Guyane, Martinique, La Réunion, Mayotte…)
      outreMer: {
        r0UnePersonneACharge: 8656,
        forfaitCharges: { base: 41.15, parPersonneACharge: 10.59 },
        tauxFamille: {
          isole: 0.0281,
          couple: 0.0299,
          parPersonnesACharge: [0.0238, 0.0217, 0.0194, 0.018, 0.0169, 0.0162, 0.0167],
          majorationParPersonneSupplementaire: -6e-4
        }
      }
    }
  }
};

// api-src/_lib/meta.ts
var CALCULATOR_META = {
  rsa: {
    version: "1.0.0",
    rulesVersion: "2026.05",
    effectiveDate: "2026-04-01",
    source: "https://solidarites.gouv.fr/revalorisation-annuelle-des-prestations-sociales-au-1er-avril-2026"
  },
  // Version des règles lue dans le barème (source unique) ; 2.0.0 = formule officielle
  apl: {
    version: "2.0.0",
    rulesVersion: socialBaremes.apl.version,
    effectiveDate: socialBaremes.apl.dateEffet,
    source: socialBaremes.apl.sourceUrl
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
    rulesVersion: "2026 (non-cadre, tranche 1, r\xE9gime g\xE9n\xE9ral)",
    source: "https://www.legisocial.fr/reperes-sociaux/cotisations-agirc-arrco-2026.html"
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

// src/utils/aplCalculEngine.ts
var aplBaremes = socialBaremes.apl;
var F = aplBaremes.formule;
var PLAFONDS_LOYER_ZONE = {
  zone1: aplBaremes.plafondsLoyer.zone1,
  zone2: aplBaremes.plafondsLoyer.zone2,
  zone3: aplBaremes.plafondsLoyer.zone3,
  idf: aplBaremes.plafondsLoyer.zone1,
  province: aplBaremes.plafondsLoyer.zone2,
  dom: aplBaremes.plafondsLoyer.zone2
};
var DEGRESSIVITE_ZONE = {
  zone1: F.coefficientsDegressivite.zone1,
  zone2: F.coefficientsDegressivite.zone2,
  zone3: F.coefficientsDegressivite.zone3,
  idf: F.coefficientsDegressivite.zone1,
  province: F.coefficientsDegressivite.zone2,
  dom: F.coefficientsDegressivite.zone2
};
var arrondi = (v, dec = 2) => Math.round(v * 10 ** dec) / 10 ** dec;
var estCouple = (situation) => situation === "couple";
function getPlafondLoyer(region, situation, enfants, colocation) {
  const p = PLAFONDS_LOYER_ZONE[region] || PLAFONDS_LOYER_ZONE.province;
  const plafond = enfants <= 0 ? estCouple(situation) ? p.couple : p.seul : p.une_personne_a_charge + (enfants - 1) * p.par_personne_supplementaire;
  return arrondi(colocation ? plafond * F.coefficientPlafondColocation : plafond);
}
function getForfaitCharges(region, situation, enfants, colocation) {
  if (region === "dom") return arrondi(F.outreMer.forfaitCharges.base + enfants * F.outreMer.forfaitCharges.parPersonneACharge);
  if (colocation) {
    const base = estCouple(situation) || enfants > 0 ? F.forfaitChargesColocation.couple : F.forfaitChargesColocation.seul;
    return arrondi(base + enfants * F.forfaitChargesColocation.parPersonneACharge);
  }
  return arrondi(F.forfaitCharges.base + enfants * F.forfaitCharges.parPersonneACharge);
}
function getTauxFamille(region, situation, enfants) {
  const t = region === "dom" ? F.outreMer.tauxFamille : F.tauxFamille;
  if (enfants <= 0) return estCouple(situation) ? t.couple : t.isole;
  const table = t.parPersonnesACharge;
  if (enfants <= table.length) return table[enfants - 1];
  return table[table.length - 1] + (enfants - table.length) * t.majorationParPersonneSupplementaire;
}
function getTauxLoyer(loyerRetenu, situation, enfants) {
  const LR = F.loyerReference;
  const ref = enfants <= 0 ? estCouple(situation) ? LR.couple : LR.isole : LR.unePersonneACharge + (enfants - 1) * LR.parPersonneSupplementaire;
  const RL = arrondi(loyerRetenu / ref * 100, 2) / 100;
  const [s1, s2] = F.tauxLoyer.seuils;
  const [t2, t3] = F.tauxLoyer.taux;
  const TL = RL < s1 ? 0 : RL <= s2 ? t2 * (RL - s1) : t2 * (s2 - s1) + t3 * (RL - s2);
  return arrondi(TL * 100, 3) / 100;
}
function getR0(region, situation, enfants) {
  const r = F.r0;
  if (enfants <= 0) return estCouple(situation) ? r.couple : r.isole;
  if (enfants === 1 && region === "dom") return F.outreMer.r0UnePersonneACharge;
  if (enfants <= r.parPersonnesACharge.length) return r.parPersonnesACharge[enfants - 1];
  return r.parPersonnesACharge[r.parPersonnesACharge.length - 1] + (enfants - r.parPersonnesACharge.length) * r.parPersonneSupplementaire;
}
function getRessourcesAnnuelles(revenusMensuels) {
  const annuel = arrondi(revenusMensuels * 12 * (1 - F.abattementFraisProfessionnels));
  return Math.ceil(annuel / 100) * 100;
}
function calculerAPL(input) {
  try {
    const validation = validerEntrees(input);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const { situation, revenus_mensuels, loyer_mensuel, region } = input;
    const typeLogement = input.type_logement || "location";
    const revenus = Number(revenus_mensuels);
    const loyer = Number(loyer_mensuel);
    const nb_enfants = Math.max(0, Math.floor(Number(input.enfants) || 0));
    const colocation = typeLogement === "colocation";
    const plafond_loyer = getPlafondLoyer(region, situation, nb_enfants, colocation);
    const loyer_pris_compte = Math.min(loyer, plafond_loyer);
    const forfait_charges = getForfaitCharges(region, situation, nb_enfants, colocation);
    const participation_minimale = Math.max(
      F.participationMinimale.taux * (loyer_pris_compte + forfait_charges),
      F.participationMinimale.forfait
    );
    const taux_participation = getTauxFamille(region, situation, nb_enfants) + getTauxLoyer(loyer_pris_compte, situation, nb_enfants);
    const ressources_annuelles = Math.max(getRessourcesAnnuelles(revenus), Number(input.ressources_annuelles_minimum) || 0);
    const abattement_r0 = getR0(region, situation, nb_enfants);
    const participation = participation_minimale + taux_participation * Math.max(0, ressources_annuelles - abattement_r0);
    const apl_brute = Math.max(0, loyer_pris_compte + forfait_charges - participation);
    const coefs = DEGRESSIVITE_ZONE[region] || DEGRESSIVITE_ZONE.province;
    const loyerDegressivite = arrondi(plafond_loyer * coefs.degressivite);
    const loyerSuppression = arrondi(plafond_loyer * coefs.suppression);
    const coefficient_degressivite = loyer <= loyerDegressivite ? 1 : loyer > loyerSuppression ? 0 : 1 - (loyer - loyerDegressivite) / (loyerSuppression - loyerDegressivite);
    let montant = Math.max(0, arrondi(apl_brute * coefficient_degressivite) - F.minorationForfaitaire);
    const seuil = typeLogement === "hlm" ? F.seuilVersement.apl : F.seuilVersement.allocationLogement;
    let raison_zero;
    if (typeLogement === "accession") {
      montant = 0;
      raison_zero = "Depuis le 1er janvier 2018, aucune nouvelle aide au logement n'est ouverte pour l'accession \xE0 la propri\xE9t\xE9.";
    } else if (apl_brute <= 0) {
      raison_zero = "Avec ces revenus, votre participation personnelle d\xE9passe le loyer retenu et les charges : l'aide est nulle selon le bar\xE8me officiel.";
    } else if (coefficient_degressivite === 0) {
      raison_zero = "Le loyer d\xE9passe le seuil au-del\xE0 duquel l'aide est supprim\xE9e pour votre zone.";
    } else if (montant < seuil) {
      montant = 0;
      raison_zero = `Le montant calcul\xE9 est inf\xE9rieur au seuil de versement (${seuil} \u20AC) : l'aide n'est pas vers\xE9e.`;
    }
    const apl_estimee = Math.floor(montant * (1 - F.tauxCrds));
    return {
      success: true,
      data: {
        apl_estimee,
        apl_brute: Math.floor(apl_brute),
        loyer_mensuel: loyer,
        loyer_pris_compte,
        forfait_charges,
        participation: Math.round(participation),
        participation_minimale: arrondi(participation_minimale),
        taux_participation,
        ressources_annuelles,
        abattement_r0,
        coefficient_degressivite: arrondi(coefficient_degressivite, 4),
        reste_charge: Math.max(0, loyer - apl_estimee),
        situation,
        enfants: nb_enfants,
        revenus_mensuels: revenus,
        zone: region,
        plafond_loyer,
        raison_zero: apl_estimee === 0 ? raison_zero : void 0
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de calcul"
    };
  }
}
function validerEntrees(input) {
  const { situation, enfants, revenus_mensuels, loyer_mensuel, region } = input;
  if (!situation) {
    return {
      valid: false,
      error: "Veuillez s\xE9lectionner votre situation familiale"
    };
  }
  if (revenus_mensuels === null || revenus_mensuels === void 0) {
    return { valid: false, error: "Veuillez indiquer vos revenus mensuels" };
  }
  if (loyer_mensuel === null || loyer_mensuel === void 0) {
    return { valid: false, error: "Veuillez indiquer votre loyer mensuel" };
  }
  if (enfants === null || enfants === void 0) {
    return { valid: false, error: "Veuillez indiquer le nombre d'enfants" };
  }
  if (!region) {
    return { valid: false, error: "Veuillez s\xE9lectionner votre r\xE9gion" };
  }
  const revenus = Number(revenus_mensuels);
  const loyer = Number(loyer_mensuel);
  if (isNaN(revenus) || revenus < 0) {
    return { valid: false, error: "Revenus invalides" };
  }
  if (isNaN(loyer) || loyer < 0) {
    return { valid: false, error: "Loyer invalide" };
  }
  return { valid: true };
}

// api-src/v1/apl.ts
async function handler2(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  const auth = authenticate(req, res);
  if (!auth) return;
  try {
    const { situation, enfants, revenus_mensuels, loyer_mensuel, region, type_logement } = req.body || {};
    if (!situation || !region || revenus_mensuels === void 0 || loyer_mensuel === void 0) {
      return res.status(400).json({
        error: "Champs requis : situation, region, revenus_mensuels, loyer_mensuel.",
        exemple: {
          situation: "seul",
          enfants: 0,
          revenus_mensuels: 1200,
          loyer_mensuel: 600,
          region: "province"
        }
      });
    }
    const result = calculerAPL({
      situation,
      enfants: Number(enfants) || 0,
      revenus_mensuels: Number(revenus_mensuels) || 0,
      loyer_mensuel: Number(loyer_mensuel) || 0,
      region,
      type_logement
    });
    return res.status(200).json(withMeta("apl", result));
  } catch (err) {
    console.error("API /v1/apl error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

// src/utils/aplEtudiantCalculEngine.ts
var FORFAIT_RESSOURCES_ETUDIANT = {
  classique: { boursier: 6900, nonBoursier: 8600 },
  foyer: { boursier: 5400, nonBoursier: 6600 }
};
var ZONE_MOTEUR = { "1": "zone1", "2": "zone2", "3": "zone3" };
var SITUATION_MOTEUR = {
  seul: "seul",
  couple: "couple",
  parent: "monoparental"
};
var round2 = (v) => Math.round(v * 100) / 100;
function calculerAPLEtudiant(data) {
  const boursier = data.boursier === true;
  const logement = data.logement === "foyer" ? "foyer" : "classique";
  const zone = data.zone ?? "2";
  const forfaitAnnuel = boursier ? FORFAIT_RESSOURCES_ETUDIANT[logement].boursier : FORFAIT_RESSOURCES_ETUDIANT[logement].nonBoursier;
  const forfaitMensuel = round2(forfaitAnnuel / 12);
  const detailsVides = {
    ressourcesMaxi: forfaitMensuel,
    ressourcesRetenues: 0,
    loyerRetenu: 0,
    plafondLoyer: 0,
    pourcentageLoyer: 0
  };
  if (data.horsUE === true && !boursier && (data.exception ?? "aucune") === "aucune") {
    return {
      eligible: false,
      montantEstime: 0,
      explication: "Depuis le 1er juillet 2026, un \xE9tudiant de nationalit\xE9 extra-europ\xE9enne doit \xEAtre boursier sur crit\xE8res sociaux pour toucher l'APL, sauf s'il exerce une activit\xE9 professionnelle, est apprenti ou en contrat de professionnalisation, r\xE9fugi\xE9 ou apatride, ou conjoint d'un b\xE9n\xE9ficiaire.",
      details: detailsVides
    };
  }
  const revenus = Math.max(0, Number(data.revenus) || 0);
  const result = calculerAPL({
    situation: SITUATION_MOTEUR[data.situation] ?? "seul",
    enfants: Math.max(0, Math.floor(Number(data.personnesCharge) || 0)),
    revenus_mensuels: revenus,
    loyer_mensuel: Math.max(0, Number(data.chargesLocatives) || 0),
    region: ZONE_MOTEUR[zone],
    ressources_annuelles_minimum: forfaitAnnuel
  });
  if (!result.success || !result.data) {
    return {
      eligible: false,
      montantEstime: 0,
      explication: result.error || "Donn\xE9es incompl\xE8tes.",
      details: detailsVides
    };
  }
  const montantEstime = result.data.apl_estimee;
  const loyer = Math.max(0, Number(data.chargesLocatives) || 0);
  const details = {
    ressourcesMaxi: forfaitMensuel,
    ressourcesRetenues: round2(result.data.ressources_annuelles / 12),
    loyerRetenu: result.data.loyer_pris_compte,
    plafondLoyer: result.data.plafond_loyer,
    pourcentageLoyer: loyer > 0 ? round2(montantEstime / loyer) : 0
  };
  const baseRessources = revenus < forfaitMensuel ? `la CAF retient au minimum ${forfaitAnnuel.toLocaleString("fr-FR")} \u20AC de ressources par an pour un \xE9tudiant ${boursier ? "boursier" : "non boursier"} (${forfaitMensuel.toLocaleString("fr-FR")} \u20AC par mois)` : `vos ressources de ${round2(revenus).toLocaleString("fr-FR")} \u20AC par mois sont retenues`;
  if (montantEstime <= 0) {
    return {
      eligible: false,
      montantEstime: 0,
      explication: `Avec ces informations, l'APL estim\xE9e est nulle : ${baseRessources}, et votre loyer est retenu dans la limite de ${details.plafondLoyer.toLocaleString("fr-FR")} \u20AC en zone ${zone}.`,
      details
    };
  }
  return {
    eligible: true,
    montantEstime,
    explication: `Estimation : environ ${montantEstime.toLocaleString("fr-FR")} \u20AC par mois. Votre loyer est retenu dans la limite de ${details.plafondLoyer.toLocaleString("fr-FR")} \u20AC (zone ${zone}, bar\xE8me au 1er octobre 2026) et ${baseRessources}. Estimation indicative : la CAF calcule le montant d\xE9finitif.`,
    details
  };
}

// api-src/v1/apl-etudiant.ts
async function handler3(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  const auth = authenticate(req, res);
  if (!auth) return;
  try {
    const {
      situation,
      age,
      revenus,
      chargesLocatives,
      personnesCharge,
      zone,
      logement,
      boursier,
      horsUE,
      exception
    } = req.body || {};
    if (!situation || revenus === void 0 || chargesLocatives === void 0) {
      return res.status(400).json({
        error: "Champs requis : situation, revenus, chargesLocatives.",
        exemple: {
          situation: "seul",
          revenus: 400,
          chargesLocatives: 450,
          personnesCharge: 0,
          zone: "2",
          logement: "classique",
          boursier: false,
          horsUE: false,
          exception: "aucune"
        }
      });
    }
    const result = calculerAPLEtudiant({
      situation,
      age: Number(age) || void 0,
      revenus: Number(revenus) || 0,
      chargesLocatives: Number(chargesLocatives) || 0,
      personnesCharge: Number(personnesCharge) || 0,
      zone: ["1", "2", "3"].includes(String(zone)) ? String(zone) : "2",
      logement: logement === "foyer" ? "foyer" : "classique",
      boursier: boursier === true || boursier === "true",
      horsUE: horsUE === true || horsUE === "true",
      exception: ["activite", "apprenti", "refugie", "conjoint"].includes(exception) ? exception : "aucune"
    });
    return res.status(200).json(withMeta("apl-etudiant", result));
  } catch (err) {
    console.error("API /v1/apl-etudiant error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

// src/utils/areCalculEngine.ts
var areBaremes = socialBaremes.are;
function getReferenceWindow(agePersonne) {
  return agePersonne >= 55 ? areBaremes.reglesEligibilite.fenetreReference55AnsEtPlusMois : areBaremes.reglesEligibilite.fenetreReferenceMoins55AnsMois;
}
function isRuptureConventionnelleReduite(data) {
  if (!data.ruptureConventionnelle) return false;
  const dateEffet = /* @__PURE__ */ new Date(`${areBaremes.ruptureConventionnelle.dateEffet}T00:00:00Z`);
  return !data.dateFinContrat || data.dateFinContrat >= dateEffet;
}
function getDurationCapDays(data) {
  const durees = isRuptureConventionnelleReduite(data) ? areBaremes.ruptureConventionnelle.dureeMaximaleJours : areBaremes.dureeMaximaleJours;
  if (data.agePersonne >= 57) return durees.aPartirDe57Ans;
  if (data.agePersonne >= 55) return durees.de55a56Ans;
  return durees.moinsDe55Ans;
}
function calculerDureeIndemnisation(data) {
  const D = areBaremes.dureeIndemnisation;
  const calendaires = Math.max(0, Math.floor(data.joursCalendaires || 0));
  const nonTravailles = Math.min(calendaires, Math.max(0, Math.floor(data.joursNonTravailles || 0)));
  const travailles = calendaires - nonTravailles;
  const maxNonTravailles = Math.floor(Math.round(travailles * D.ratioJoursNonTravaillesMax * 1e3) / 1e3);
  const joursAvantCoefficient = travailles + Math.min(nonTravailles, maxNonTravailles);
  const coefficientApplique = !data.dateFinContrat || data.dateFinContrat >= /* @__PURE__ */ new Date(`${D.dateEffetCoefficient}T00:00:00Z`);
  const apresCoefficient = coefficientApplique ? Math.round(joursAvantCoefficient * D.coefficient) : joursAvantCoefficient;
  const plafondJours = getDurationCapDays(data);
  const plancherApplique = apresCoefficient < D.dureeMinimaleJours;
  const plafondApplique = apresCoefficient > plafondJours;
  const jours = Math.min(plafondJours, Math.max(D.dureeMinimaleJours, apresCoefficient));
  return { jours, joursAvantCoefficient, coefficientApplique, plancherApplique, plafondJours, plafondApplique };
}
function calculerAllocationJournaliere(salaireMensuelBrut) {
  const salaireMensuel = Math.max(0, salaireMensuelBrut || 0);
  const sjr = salaireMensuel * 12 / 365;
  const C = areBaremes.calculJournalier;
  const formule = Math.max(sjr * C.tauxOption1 + C.partFixe, sjr * C.tauxOption2);
  const allocationJournaliere = Math.min(Math.max(formule, C.minimumJournalier), sjr * C.plafondPourcentageSjr);
  return { sjr, allocationJournaliere };
}
function calculerARE(data) {
  const minAnciennete = areBaremes.reglesEligibilite.dureeAffiliationMois;
  const referenceWindow = getReferenceWindow(data.agePersonne);
  if (data.ancienneteEmploi < minAnciennete) {
    return {
      eligible: false,
      montantEstime: 0,
      durationMax: 0,
      explication: `Pour ouvrir des droits a l'ARE, il faut avoir travaille au moins ${minAnciennete} mois sur les ${referenceWindow} derniers mois.`,
      details: {
        tauxRemplacement: 0,
        montantMinimum: 0,
        montantMaximum: 0
      }
    };
  }
  const { sjr, allocationJournaliere } = calculerAllocationJournaliere(data.salaireReferent);
  const montantMensuelBrut = Math.round(allocationJournaliere * areBaremes.calculJournalier.coefficientMensuel * 100) / 100;
  const moisRetenus = Math.min(Math.max(0, data.ancienneteEmploi), referenceWindow);
  const duree = calculerDureeIndemnisation({
    joursCalendaires: Math.round(moisRetenus * 30.42),
    agePersonne: data.agePersonne,
    ruptureConventionnelle: data.ruptureConventionnelle,
    dateFinContrat: data.dateFinContrat
  });
  const durationMax = Math.max(1, Math.round(duree.jours / 30.42 * 2) / 2);
  return {
    eligible: true,
    montantEstime: montantMensuelBrut,
    durationMax,
    explication: `Cette estimation applique la formule officielle France Travail sur votre salaire journalier de reference, avec une duree maximale d'environ ${durationMax} mois selon votre anciennete et votre age.`,
    details: {
      tauxRemplacement: Math.round(allocationJournaliere / Math.max(sjr, 1) * 1e4) / 1e4,
      montantMinimum: Math.round(
        areBaremes.calculJournalier.minimumJournalier * areBaremes.calculJournalier.coefficientMensuel
      ),
      montantMaximum: Math.round(
        sjr * areBaremes.calculJournalier.plafondPourcentageSjr * areBaremes.calculJournalier.coefficientMensuel
      )
    }
  };
}

// api-src/v1/are.ts
async function handler4(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  const auth = authenticate(req, res);
  if (!auth) return;
  try {
    const { situation, ancienneteEmploi, salaireReferent, personnesCharge, agePersonne } = req.body || {};
    if (!situation || ancienneteEmploi === void 0 || salaireReferent === void 0 || agePersonne === void 0) {
      return res.status(400).json({
        error: "Champs requis : situation, ancienneteEmploi, salaireReferent, agePersonne.",
        exemple: {
          situation: "seul",
          ancienneteEmploi: 24,
          salaireReferent: 2200,
          personnesCharge: 0,
          agePersonne: 35
        }
      });
    }
    const result = calculerARE({
      situation,
      ancienneteEmploi: Number(ancienneteEmploi) || 0,
      salaireReferent: Number(salaireReferent) || 0,
      personnesCharge: Number(personnesCharge) || 0,
      agePersonne: Number(agePersonne) || 0
    });
    return res.status(200).json(withMeta("are", result));
  } catch (err) {
    console.error("API /v1/are error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

// src/utils/asfCalculEngine.ts
var asfBaremes = socialBaremes.asf;
function calculerASF(data) {
  const { situation, nombreEnfants, enfantACharge } = data;
  if (!enfantACharge || nombreEnfants <= 0) {
    return {
      eligible: false,
      montantEstime: 0,
      explication: "L'ASF s'adresse aux foyers qui ont au moins un enfant a charge de moins de 21 ans.",
      details: {
        montantParEnfant: 0,
        ressourcesMaxi: 0,
        nombreEnfantsEligibles: 0
      }
    };
  }
  const nombreEnfantsEligibles = Math.max(0, Math.floor(nombreEnfants));
  const montantParEnfant = situation === "depourvu" ? asfBaremes.montantParEnfantPriveDeuxParents : asfBaremes.montantParEnfant;
  const montantEstime = Math.round(montantParEnfant * nombreEnfantsEligibles * 100) / 100;
  const explicationBase = situation === "depourvu" ? "Vous relevez du cas d'un enfant prive du soutien de ses deux parents." : "L'ASF est versee sans condition de ressources quand les conditions familiales sont remplies.";
  return {
    eligible: true,
    montantEstime,
    explication: `${explicationBase} Le montant indicatif est d'environ ${montantEstime.toFixed(2)} EUR par mois pour ${nombreEnfantsEligibles} enfant(s). La CAF confirmera le droit exact selon votre dossier.`,
    details: {
      montantParEnfant,
      ressourcesMaxi: 0,
      nombreEnfantsEligibles
    }
  };
}

// api-src/v1/asf.ts
async function handler5(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  const auth = authenticate(req, res);
  if (!auth) return;
  try {
    const { situation, nombreEnfants, revenus, enfantACharge } = req.body || {};
    if (!situation || nombreEnfants === void 0) {
      return res.status(400).json({
        error: "Champs requis : situation, nombreEnfants.",
        exemple: { situation: "parentisole", nombreEnfants: 2, revenus: 1200, enfantACharge: true }
      });
    }
    const result = calculerASF({
      situation,
      nombreEnfants: Number(nombreEnfants) || 0,
      revenus: Number(revenus) || 0,
      enfantACharge: Boolean(enfantACharge)
    });
    return res.status(200).json(withMeta("asf", result));
  } catch (err) {
    console.error("API /v1/asf error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
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
async function handler6(req, res) {
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

// src/utils/irCalculEngine.ts
var baremeIR2026 = [
  { plafond: 11600, taux: 0 },
  // 0%
  { plafond: 29579, taux: 0.11 },
  // 11%
  { plafond: 84577, taux: 0.3 },
  // 30%
  { plafond: 181917, taux: 0.41 },
  // 41%
  { plafond: Number.POSITIVE_INFINITY, taux: 0.45 }
  // 45%
];
var PARAMETRES_IR_2026 = {
  plafondDemiPart: 1807,
  /** Parent isolé : plafond pour la part entière attribuée au premier enfant à charge */
  plafondParentIsolePremierEnfant: 4262,
  decote: {
    seul: { forfait: 897, seuil: 1982 },
    couple: { forfait: 1483, seuil: 3277 },
    taux: 0.4525
  },
  seuilRecouvrement: 61
};
function impotBareme(revenu, parts, bareme) {
  const qf = revenu / parts;
  let impotsParPart = 0;
  let prev = 0;
  for (const tranche of bareme) {
    const base = Math.max(0, Math.min(qf, tranche.plafond) - prev);
    impotsParPart += base * tranche.taux;
    prev = tranche.plafond;
    if (qf <= tranche.plafond) break;
  }
  return impotsParPart * parts;
}
function calculerIR(input, bareme = baremeIR2026) {
  const revenu = Number(input.revenu);
  const parts = Number(input.parts);
  if (!isFinite(revenu) || revenu < 0 || !isFinite(parts) || parts <= 0) {
    throw new Error("Entr\xE9es invalides");
  }
  const qf = revenu / parts;
  const P = PARAMETRES_IR_2026;
  const couple = input.couple ?? parts >= 2;
  const partsBase = couple ? 2 : 1;
  const irSansPlafonnement = impotBareme(revenu, parts, bareme);
  const demiPartsSupp = Math.max(0, (parts - partsBase) * 2);
  const irBase = impotBareme(revenu, Math.min(parts, partsBase), bareme);
  const avantageMax = !couple && input.parentIsole === true && demiPartsSupp >= 2 ? P.plafondParentIsolePremierEnfant + (demiPartsSupp - 2) * P.plafondDemiPart : demiPartsSupp * P.plafondDemiPart;
  const irBrut = Math.max(irSansPlafonnement, irBase - avantageMax);
  const plafonnementQF = irBrut - irSansPlafonnement;
  const d = couple ? P.decote.couple : P.decote.seul;
  const decote = irBrut > 0 && irBrut < d.seuil ? Math.min(irBrut, Math.max(0, d.forfait - P.decote.taux * irBrut)) : 0;
  const apresDecote = Math.round(irBrut - decote);
  const impotNet = apresDecote < P.seuilRecouvrement ? 0 : apresDecote;
  const tauxMoyen = revenu > 0 ? impotNet / revenu : 0;
  const mensualiteMoyenne = impotNet / 12;
  const tauxMarginal = bareme.find((b) => qf <= b.plafond)?.taux ?? bareme[bareme.length - 1]?.taux ?? 0;
  return {
    revenu,
    parts,
    qf,
    irBrut,
    irSansPlafonnement,
    plafonnementQF,
    decote,
    impotNet,
    tauxMoyen,
    tauxMarginal,
    mensualiteMoyenne
  };
}

// api-src/v1/impot-revenu.ts
async function handler7(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  const auth = authenticate(req, res);
  if (!auth) return;
  try {
    const { revenu, parts } = req.body || {};
    if (revenu === void 0 || parts === void 0) {
      return res.status(400).json({
        error: "Champs requis : revenu, parts.",
        exemple: { revenu: 35e3, parts: 1 }
      });
    }
    const result = calculerIR({ revenu: Number(revenu) || 0, parts: Number(parts) || 1 });
    return res.status(200).json(withMeta("impot-revenu", result));
  } catch (err) {
    if (err.message === "Entr\xE9es invalides") {
      return res.status(400).json({ error: "revenu ou parts invalide(s)." });
    }
    console.error("API /v1/impot-revenu error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
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
async function handler8(req, res) {
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

// src/utils/notaireCalculEngine.ts
var bjson = baremes_default;
var PRIMO_ACCEDANT_TAUX_MAX = 0.058;
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
var REMISE_SEUIL = 1e5;
var REMISE_TAUX_MAX = 0.2;
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
    for (const tranche of trancheDefaut) {
      const bas = Math.max(tranche.min, REMISE_SEUIL);
      const haut = Math.min(tranche.max, prixNetImmobilier);
      if (haut > bas) remiseMontant += (haut - bas) * tranche.taux * REMISE_TAUX_MAX;
    }
    emoluments -= remiseMontant;
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
  if (data.primoAccedant === true && typeBien !== "neuf" && tauxDroits > PRIMO_ACCEDANT_TAUX_MAX) {
    tauxDroits = PRIMO_ACCEDANT_TAUX_MAX;
  }
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
async function handler9(req, res) {
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
      remiseNotarialeVariable,
      primoAccedant
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
      remiseNotarialeVariable: Boolean(remiseNotarialeVariable),
      primoAccedant: primoAccedant === true || primoAccedant === "true"
    });
    return res.status(200).json(withMeta("notaire", result));
  } catch (err) {
    console.error("API /v1/notaire error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

// src/utils/primeActiviteCalculEngine.ts
var primeBaremes = socialBaremes.primeActivite;
function getPrimeForfait(situation, enfants, majorationIsolement) {
  const nbEnfants = Math.max(0, Math.floor(enfants || 0));
  if (situation === "monoparental" && majorationIsolement) {
    if (nbEnfants <= 0) return primeBaremes.montantForfaitaire.nonMajoree.unePersonne;
    if (nbEnfants === 1) return primeBaremes.montantForfaitaire.majoree.isole1Enfant;
    if (nbEnfants === 2) return primeBaremes.montantForfaitaire.majoree.isole2Enfants;
    if (nbEnfants === 3) return primeBaremes.montantForfaitaire.majoree.isole3Enfants;
    return primeBaremes.montantForfaitaire.majoree.isole4Enfants + (nbEnfants - 4) * primeBaremes.montantForfaitaire.majoree.personneSupplementaire;
  }
  if (situation === "couple") {
    if (nbEnfants <= 0) return primeBaremes.montantForfaitaire.nonMajoree.coupleOuIsole1Enfant;
    if (nbEnfants === 1)
      return primeBaremes.montantForfaitaire.nonMajoree.couple1EnfantOuIsole2Enfants;
    if (nbEnfants === 2) return primeBaremes.montantForfaitaire.nonMajoree.couple2Enfants;
    if (nbEnfants === 3) return primeBaremes.montantForfaitaire.nonMajoree.couple3Enfants;
    return primeBaremes.montantForfaitaire.nonMajoree.couple3Enfants + (nbEnfants - 3) * primeBaremes.montantForfaitaire.nonMajoree.personneSupplementaire;
  }
  if (nbEnfants <= 0) return primeBaremes.montantForfaitaire.nonMajoree.unePersonne;
  if (nbEnfants === 1) return primeBaremes.montantForfaitaire.nonMajoree.coupleOuIsole1Enfant;
  if (nbEnfants === 2)
    return primeBaremes.montantForfaitaire.nonMajoree.couple1EnfantOuIsole2Enfants;
  if (nbEnfants === 3) return primeBaremes.montantForfaitaire.nonMajoree.isole3Enfants;
  return primeBaremes.montantForfaitaire.nonMajoree.isole3Enfants + (nbEnfants - 3) * primeBaremes.montantForfaitaire.nonMajoree.personneSupplementaire;
}
function getHousingForfait(logement, situation, enfants) {
  if (logement === "loue") return 0;
  const foyerSize = (situation === "couple" ? 2 : 1) + Math.max(0, Math.floor(enfants || 0));
  if (foyerSize <= 1) return primeBaremes.forfaitLogement.unePersonne;
  if (foyerSize === 2) return primeBaremes.forfaitLogement.deuxPersonnes;
  return primeBaremes.forfaitLogement.troisPersonnesOuPlus;
}
function getAllocationsFamiliales(enfants) {
  const n = Math.max(0, Math.floor(enfants || 0));
  const af = socialBaremes.allocationsFamiliales.tauxPlein;
  if (n < 2) return 0;
  if (n === 2) return af.deuxEnfants;
  return Math.round((af.troisEnfants + (n - 3) * af.parEnfantSupplementaire) * 100) / 100;
}
function getBonification(revenusProf) {
  const revenus = Math.max(0, revenusProf || 0);
  const { seuilDebut, seuilMaximum, montantMaximum } = primeBaremes.bonification;
  if (revenus < seuilDebut) return 0;
  if (revenus >= seuilMaximum) return montantMaximum;
  const ratio = (revenus - seuilDebut) / (seuilMaximum - seuilDebut);
  return Math.round(montantMaximum * ratio * 100) / 100;
}
function calculerPrimeActivite(data) {
  if (!data.situation || !data.logement || !data.typeActivite) {
    return {
      success: false,
      montantEstime: 0,
      eligibilite: "Donnees incompletes",
      explication: "Veuillez remplir tous les champs obligatoires.",
      details: {
        montantBase: 0,
        bonification: 0,
        majorations: 0,
        forfaitLogement: 0,
        allocationsFamiliales: 0,
        revenusProfsComptabilises: 0,
        autresRevenusComptabilises: 0,
        totalRevenusComptabilises: 0,
        montantFinal: 0
      }
    };
  }
  if ((data.revenusProf || 0) + (data.situation === "couple" ? data.revenusProfConjoint || 0 : 0) <= 0) {
    return {
      success: true,
      montantEstime: 0,
      eligibilite: "Non eligible",
      explication: "La Prime d'activite concerne les personnes qui exercent une activite professionnelle et declarent un revenu d'activite.",
      details: {
        montantBase: 0,
        bonification: 0,
        majorations: 0,
        forfaitLogement: 0,
        allocationsFamiliales: 0,
        revenusProfsComptabilises: 0,
        autresRevenusComptabilises: Math.round(data.autresRevenus * 100) / 100,
        totalRevenusComptabilises: Math.round(data.autresRevenus * 100) / 100,
        montantFinal: 0
      }
    };
  }
  const montantBase = getPrimeForfait(
    data.situation,
    data.enfants,
    data.majorationIsolement === true
  );
  const revenusDemandeur = Math.max(0, data.revenusProf || 0);
  const revenusConjoint = data.situation === "couple" ? Math.max(0, data.revenusProfConjoint || 0) : 0;
  const revenusProfFoyer = revenusDemandeur + revenusConjoint;
  const bonification = Math.round((getBonification(revenusDemandeur) + getBonification(revenusConjoint)) * 100) / 100;
  const forfaitLogement = getHousingForfait(data.logement, data.situation, data.enfants);
  const allocationsFamiliales = data.inclureAllocationsFamiliales === false ? 0 : getAllocationsFamiliales(data.enfants);
  const revenusProfsComptabilises = revenusProfFoyer * primeBaremes.revenusProfessionnelsPrisEnCompte;
  const autresRevenusComptabilises = Math.max(0, data.autresRevenus || 0);
  const totalRevenusComptabilises = revenusProfFoyer + autresRevenusComptabilises + allocationsFamiliales + forfaitLogement;
  const ressourcesRetenues = Math.max(montantBase, totalRevenusComptabilises);
  let montantFinal = montantBase + bonification + revenusProfsComptabilises - ressourcesRetenues;
  montantFinal = Math.max(0, Math.round(montantFinal * 100) / 100);
  let eligibilite = "Probablement eligible";
  let explication = "Cette estimation repose sur le forfait foyer 2026, la bonification individuelle et les revenus declares. La CAF confirmera le montant final a partir de votre declaration trimestrielle.";
  if (montantFinal === 0) {
    eligibilite = "Non eligible";
    explication = "Avec les revenus renseignes, le droit estime a la Prime d'activite est nul ou trop faible. Le resultat peut evoluer en cas de changement de revenus, de foyer ou de logement.";
  } else if (montantFinal < primeBaremes.montantMinimumVerse) {
    eligibilite = "Montant trop faible pour versement";
    explication = `Le droit theorique existe, mais la Prime d'activite n'est versee qu'a partir de ${primeBaremes.montantMinimumVerse} EUR par mois.`;
    montantFinal = 0;
  }
  return {
    success: true,
    montantEstime: montantFinal,
    eligibilite,
    explication,
    details: {
      montantBase: Math.round(montantBase * 100) / 100,
      bonification,
      majorations: Math.max(
        0,
        Math.round((montantBase - primeBaremes.montantForfaitaire.nonMajoree.unePersonne) * 100) / 100
      ),
      forfaitLogement: Math.round(forfaitLogement * 100) / 100,
      allocationsFamiliales,
      revenusProfsComptabilises: Math.round(revenusProfsComptabilises * 100) / 100,
      autresRevenusComptabilises: Math.round(autresRevenusComptabilises * 100) / 100,
      totalRevenusComptabilises: Math.round(totalRevenusComptabilises * 100) / 100,
      montantFinal
    }
  };
}

// api-src/v1/prime-activite.ts
async function handler10(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  const auth = authenticate(req, res);
  if (!auth) return;
  try {
    const {
      situation,
      enfants,
      revenusProf,
      revenusProfConjoint,
      autresRevenus,
      logement,
      typeActivite,
      majorationIsolement,
      inclureAllocationsFamiliales
    } = req.body || {};
    if (!situation || !logement || !typeActivite) {
      return res.status(400).json({
        error: "Champs requis : situation, logement, typeActivite.",
        exemple: {
          situation: "seul",
          enfants: 0,
          revenusProf: 1400,
          autresRevenus: 0,
          logement: "loue",
          typeActivite: "salarie"
        }
      });
    }
    const result = calculerPrimeActivite({
      situation,
      enfants: Number(enfants) || 0,
      revenusProf: Number(revenusProf) || 0,
      revenusProfConjoint: Number(revenusProfConjoint) || 0,
      autresRevenus: Number(autresRevenus) || 0,
      logement,
      typeActivite,
      majorationIsolement: majorationIsolement === true || majorationIsolement === "true",
      inclureAllocationsFamiliales: !(inclureAllocationsFamiliales === false || inclureAllocationsFamiliales === "false")
    });
    return res.status(200).json(withMeta("prime-activite", result));
  } catch (err) {
    console.error("API /v1/prime-activite error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

// src/utils/ptzEligibiliteCalculEngine.ts
var PLAFONDS_RESSOURCES = {
  // index 0 = 1 personne, ..., index 6 = 7 personnes, index 7 = 8 personnes et plus
  A: [49e3, 73500, 88200, 102900, 117600, 132300, 147e3, 161700],
  B1: [34500, 51750, 62100, 72450, 82800, 93150, 103500, 113850],
  B2: [31500, 47250, 56700, 66150, 75600, 85050, 94500, 103950],
  C: [28500, 42750, 51300, 59850, 68400, 76950, 85500, 94050]
};
function verifierEligibilitePTZ(data) {
  const { zone, nombrePersonnes, revenuFiscalReference } = data;
  const index = Math.min(Math.max(1, Math.round(nombrePersonnes)), 8) - 1;
  const plafondApplicable = PLAFONDS_RESSOURCES[zone][index];
  const rfr = Number.isFinite(revenuFiscalReference) ? Math.max(0, revenuFiscalReference) : 0;
  return {
    eligible: rfr <= plafondApplicable,
    plafondApplicable,
    ecart: Math.round((plafondApplicable - rfr) * 100) / 100
  };
}

// api-src/v1/ptz.ts
async function handler11(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  const auth = authenticate(req, res);
  if (!auth) return;
  try {
    const { zone, nombrePersonnes, revenuFiscalReference } = req.body || {};
    if (!zone || nombrePersonnes === void 0 || revenuFiscalReference === void 0) {
      return res.status(400).json({
        error: "Champs requis : zone, nombrePersonnes, revenuFiscalReference.",
        exemple: { zone: "B1", nombrePersonnes: 3, revenuFiscalReference: 45e3 }
      });
    }
    const result = verifierEligibilitePTZ({
      zone,
      nombrePersonnes: Number(nombrePersonnes) || 1,
      revenuFiscalReference: Number(revenuFiscalReference) || 0
    });
    return res.status(200).json(withMeta("ptz", result));
  } catch (err) {
    console.error("API /v1/ptz error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

// src/utils/resteAVivreCalculEngine.ts
function calculerResteAVivre(data) {
  const revenus = data.salaireNetMensuel + data.autresRevenus + data.primActivite + data.rsa + data.apl + data.aah + data.autresAides;
  const chargesLogement = data.loyer + data.assuranceLogement + data.electricite + data.eau + data.internet + data.telephone;
  const chargesTransport = data.transportRoutier + data.transportPublic;
  const chargesSante = data.assuranceSante;
  const chargesAlimentaires = data.alimentation + data.hygiene;
  const chargesAffaires = data.vetements + data.gardienEnfants;
  const chargesDiverses = data.loisirs + data.autres;
  const chargesTotal = chargesLogement + chargesTransport + chargesSante + chargesAlimentaires + chargesAffaires + chargesDiverses;
  const resteAVivre = revenus - chargesTotal;
  const resteParPersonne = resteAVivre / Math.max(1, data.nbPersonnes);
  const tauxEndettement = revenus > 0 ? chargesTotal / revenus * 100 : 0;
  let niveauRisque;
  if (tauxEndettement < 40) {
    niveauRisque = "faible";
  } else if (tauxEndettement < 60) {
    niveauRisque = "mod\xE9r\xE9";
  } else if (tauxEndettement < 85) {
    niveauRisque = "\xE9lev\xE9";
  } else {
    niveauRisque = "critique";
  }
  const riskEmoji = {
    faible: "\u2705",
    mod\u00E9r\u00E9: "\u26A0\uFE0F",
    \u00E9lev\u00E9: "\u26A0\uFE0F\u26A0\uFE0F",
    critique: "\u{1F534}"
  };
  return {
    success: true,
    resteAVivre,
    toutcharges: chargesTotal,
    revenus,
    tauxEndettement: Math.round(tauxEndettement * 100) / 100,
    niveauRisque,
    explications: `${riskEmoji[niveauRisque]} Avec des revenus de ${revenus.toFixed(2)}\u20AC et des charges de ${chargesTotal.toFixed(2)}\u20AC, il vous reste environ ${resteAVivre.toFixed(2)}\u20AC par mois pour vivre.`,
    details: {
      revenusTotal: revenus,
      chargesLogementi: chargesLogement,
      chargesTransport,
      chargesSante,
      chargesAlimentaires,
      chargesAffaires,
      chargesDiverses,
      chargesTotal,
      resteDisponible: resteAVivre,
      resteParPersonne
    }
  };
}

// api-src/v1/reste-a-vivre.ts
var NUMERIC_FIELDS = [
  "salaireNetMensuel",
  "autresRevenus",
  "primActivite",
  "rsa",
  "apl",
  "aah",
  "autresAides",
  "loyer",
  "assuranceLogement",
  "electricite",
  "eau",
  "internet",
  "telephone",
  "transportRoutier",
  "transportPublic",
  "assuranceSante",
  "gardienEnfants",
  "alimentation",
  "hygiene",
  "vetements",
  "loisirs",
  "autres",
  "nbPersonnes",
  "nbEnfants"
];
async function handler12(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  const auth = authenticate(req, res);
  if (!auth) return;
  try {
    const body = req.body || {};
    if (body.salaireNetMensuel === void 0 || body.loyer === void 0) {
      return res.status(400).json({
        error: "Champs requis au minimum : salaireNetMensuel, loyer (tous les autres sont optionnels, d\xE9faut 0).",
        exemple: {
          salaireNetMensuel: 2e3,
          autresRevenus: 0,
          primActivite: 0,
          rsa: 0,
          apl: 0,
          aah: 0,
          autresAides: 0,
          loyer: 700,
          assuranceLogement: 15,
          electricite: 60,
          eau: 20,
          internet: 30,
          telephone: 20,
          transportRoutier: 150,
          transportPublic: 0,
          assuranceSante: 40,
          gardienEnfants: 0,
          alimentation: 300,
          hygiene: 30,
          vetements: 50,
          loisirs: 80,
          autres: 0,
          nbPersonnes: 1,
          nbEnfants: 0
        }
      });
    }
    const data = {};
    for (const field of NUMERIC_FIELDS) {
      data[field] = Number(body[field]) || 0;
    }
    if (!data.nbPersonnes) data.nbPersonnes = 1;
    const result = calculerResteAVivre(data);
    return res.status(200).json(withMeta("reste-a-vivre", result));
  } catch (err) {
    console.error("API /v1/reste-a-vivre error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
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
async function handler13(req, res) {
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

// src/utils/rsaCalculEngine.ts
var rsaBaremes = socialBaremes.rsa;
function getBaseCoefficient(situation, enfants) {
  const nbEnfants = Math.max(0, Math.floor(enfants || 0));
  if (situation === "couple") {
    if (nbEnfants <= 0) return rsaBaremes.coefficientsFoyer.coupleOuSeulAvec1Enfant;
    if (nbEnfants === 1) return rsaBaremes.coefficientsFoyer.coupleAvec1OuSeulAvec2Enfants;
    return rsaBaremes.coefficientsFoyer.coupleAvec2Enfants + (nbEnfants - 2) * rsaBaremes.coefficientsFoyer.personneSupplementaire;
  }
  if (nbEnfants <= 0) return rsaBaremes.coefficientsFoyer.seulSansEnfant;
  if (nbEnfants === 1) return rsaBaremes.coefficientsFoyer.coupleOuSeulAvec1Enfant;
  return rsaBaremes.coefficientsFoyer.coupleAvec1OuSeulAvec2Enfants + (nbEnfants - 2) * rsaBaremes.coefficientsFoyer.personneSupplementaire;
}
function getForfaitLogement(logement, situation, enfants) {
  if (logement === "loue" || logement === "sans-abri") return 0;
  const foyerSize = (situation === "couple" ? 2 : 1) + Math.max(0, Math.floor(enfants || 0));
  if (foyerSize <= 1) return rsaBaremes.forfaitLogement.unePersonne;
  if (foyerSize === 2) return rsaBaremes.forfaitLogement.deuxPersonnes;
  return rsaBaremes.forfaitLogement.troisPersonnesOuPlus;
}
function calculerRSA(data) {
  if (!data.situation || !data.logement || !data.activite) {
    return {
      success: false,
      montantEstime: 0,
      eligibilite: "Donnees incompletes",
      explication: "Veuillez remplir tous les champs obligatoires.",
      details: {
        montantBase: 0,
        majorations: 0,
        revenusPris: 0,
        abattement: 0,
        forfaitLogement: 0,
        montantFinal: 0
      }
    };
  }
  const coefficient = getBaseCoefficient(data.situation, data.enfants);
  const montantBase = Math.round(rsaBaremes.montantForfaitaireBase * coefficient * 100) / 100;
  const forfaitLogement = getForfaitLogement(data.logement, data.situation, data.enfants);
  const revenusPris = data.activite === "actif" ? Math.round((data.revenus || 0) * rsaBaremes.revenusActivitePrisEnCompte * 100) / 100 : Math.max(0, Math.round((data.revenus || 0) * 100) / 100);
  const abattement = Math.max(0, Math.round(((data.revenus || 0) - revenusPris) * 100) / 100);
  let montantFinal = montantBase - revenusPris - forfaitLogement;
  montantFinal = Math.max(0, Math.round(montantFinal * 100) / 100);
  const sousSeuilVersement = montantFinal > 0 && montantFinal < rsaBaremes.montantMinimumVerse;
  if (sousSeuilVersement) montantFinal = 0;
  let eligibilite = "Probablement eligible";
  let explication = "Cette estimation utilise le bareme RSA en vigueur, vos ressources mensuelles et, si besoin, le forfait logement applique par la CAF.";
  if (sousSeuilVersement) {
    eligibilite = "Montant trop faible";
    explication = `Le RSA calcule est inferieur a ${rsaBaremes.montantMinimumVerse} EUR par mois : la CAF ne le verse pas.`;
  } else if (montantFinal === 0) {
    eligibilite = "Non eligible";
    explication = "Avec les ressources et le logement renseignes, le RSA estime est nul. Le resultat peut changer si vos revenus baissent, si votre foyer evolue ou si votre situation de logement change.";
  } else if (data.situation === "monoparental" && data.enfants > 0) {
    explication += " Si vous relevez de la majoration parent isole, la CAF peut retenir un montant plus favorable que cette estimation de base.";
  }
  return {
    success: true,
    montantEstime: montantFinal,
    eligibilite,
    explication,
    details: {
      montantBase,
      majorations: Math.round((montantBase - rsaBaremes.montantForfaitaireBase) * 100) / 100,
      revenusPris,
      abattement,
      forfaitLogement: Math.round(forfaitLogement * 100) / 100,
      montantFinal
    }
  };
}

// api-src/v1/rsa.ts
async function handler14(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  const auth = authenticate(req, res);
  if (!auth) return;
  try {
    const { situation, enfants, revenus, logement, activite } = req.body || {};
    if (!situation || !logement || !activite) {
      return res.status(400).json({
        error: "Champs requis : situation, logement, activite.",
        exemple: {
          situation: "seul",
          enfants: 0,
          revenus: 300,
          logement: "loue",
          activite: "inactif"
        }
      });
    }
    const result = calculerRSA({
      situation,
      enfants: Number(enfants) || 0,
      revenus: Number(revenus) || 0,
      logement,
      activite
    });
    return res.status(200).json(withMeta("rsa", result));
  } catch (err) {
    console.error("API /v1/rsa error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

// src/utils/salaireCalculEngine.ts
var TAUX_SALARIAL = { non_cadre: 0.2084, cadre: 0.2101 };
function calculerSalaire(input) {
  const brut = Number(input.brutMensuel);
  const statut = input.statut;
  const tauxPAS = Number(input.tauxPAS ?? 0) || 0;
  if (!isFinite(brut) || brut <= 0) throw new Error("Brut invalide");
  if (statut !== "cadre" && statut !== "non_cadre") throw new Error("Statut invalide");
  if (!isFinite(tauxPAS) || tauxPAS < 0 || tauxPAS > 100) throw new Error("Taux PAS invalide");
  const tauxSalarial = TAUX_SALARIAL[statut];
  const netAvantImpot = brut * (1 - tauxSalarial);
  const pasMensuel = netAvantImpot * (tauxPAS / 100);
  const netApresImpot = netAvantImpot - pasMensuel;
  return {
    brut,
    statut,
    tauxSalarial,
    netAvantImpot,
    pasMensuel,
    netApresImpot,
    brutAnnuel: brut * 12,
    netAvantImpotAnnuel: netAvantImpot * 12,
    pasAnnuel: pasMensuel * 12,
    netApresImpotAnnuel: netApresImpot * 12,
    tauxPAS
  };
}

// api-src/v1/salaire.ts
async function handler15(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  const auth = authenticate(req, res);
  if (!auth) return;
  try {
    const { brutMensuel, statut, tauxPAS } = req.body || {};
    if (brutMensuel === void 0 || !statut) {
      return res.status(400).json({
        error: "Champs requis : brutMensuel, statut.",
        exemple: { brutMensuel: 3e3, statut: "cadre", tauxPAS: 8 }
      });
    }
    const result = calculerSalaire({
      brutMensuel: Number(brutMensuel) || 0,
      statut,
      tauxPAS: Number(tauxPAS) || 0
    });
    return res.status(200).json(withMeta("salaire", result));
  } catch (err) {
    if (err.message === "Brut invalide" || err.message === "Statut invalide" || err.message === "Taux PAS invalide") {
      return res.status(400).json({ error: err.message });
    }
    console.error("API /v1/salaire error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

// src/utils/salaireNetCalculEngine.ts
var BAREMES_2026 = {
  // Tranches d'imposition 2026 (revenus 2025) - Article 197 du CGI, loi
  // n°2026-103 du 19/02/2026, identiques à src/utils/irCalculEngine.ts.
  // Verifie sur Legifrance (LEGIARTI000051212954) le 11/08/2026.
  tranches: [
    { limite: 11600, taux: 0 },
    { limite: 29579, taux: 0.11 },
    { limite: 84577, taux: 0.3 },
    { limite: 181917, taux: 0.41 },
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
  // Décote 2026 (revenus 2025) : forfait - 45,25 % de l'impôt brut,
  // applicable si l'impôt brut est inférieur à 1 982 € (seul) / 3 277 € (couple)
  decote: {
    forfaitSeul: 897,
    forfaitCouple: 1483,
    taux: 0.4525
  },
  // Abattement de base (10% du revenu imposable)
  abattementBase: 0.1
};
var COTISATIONS_2026 = {
  retraiteBase: 0.073,
  // Assurance vieillesse plafonnée (6,90%) + déplafonnée (0,40%)
  retraiteComplementaire: 0.0401,
  // Agirc-Arrco T1 (3,15%) + CEG T1 (0,86%)
  // CSG/CRDS : assises sur 98,25% du brut (abattement forfaitaire de 1,75%
  // pour frais professionnels, dans la limite de 4 PASS)
  assietteCsgCrds: 0.9825,
  csgDeductible: 0.068,
  // déductible du revenu imposable
  csgNonDeductible: 0.024,
  // non déductible
  crds: 5e-3
  // non déductible
};
function calculateCotisations(brutSalaire) {
  const assiette = brutSalaire * COTISATIONS_2026.assietteCsgCrds;
  const retraite = brutSalaire * (COTISATIONS_2026.retraiteBase + COTISATIONS_2026.retraiteComplementaire);
  const csgDeductible = assiette * COTISATIONS_2026.csgDeductible;
  const csgNonDeductibleEtCrds = assiette * (COTISATIONS_2026.csgNonDeductible + COTISATIONS_2026.crds);
  return {
    totalNetPay: retraite + csgDeductible + csgNonDeductibleEtCrds,
    deductibleImpot: retraite + csgDeductible
  };
}
function calculateImportFoncier(revenusImposables, quotientFamilial, imposeEnCouple = false) {
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
  const { forfaitSeul, forfaitCouple, taux } = BAREMES_2026.decote;
  const forfaitDecote = imposeEnCouple ? forfaitCouple : forfaitSeul;
  const decote = forfaitDecote - impot * taux;
  if (impot > 0 && decote > 0) {
    impot = Math.max(0, impot - decote);
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
  const revenusImposables = brutTotal - cotisations.deductibleImpot;
  const revenusImposablesAbattement = Math.max(
    0,
    revenusImposables * (1 - BAREMES_2026.abattementBase)
  );
  const quotientFamilial = getQuotientFamilial(data.enfants, data.mariageOrPacs);
  const impotAnnuel = calculateImportFoncier(
    revenusImposablesAbattement * 12,
    quotientFamilial,
    data.mariageOrPacs
  );
  const impotMensuel = impotAnnuel / 12;
  const prelevementSource = Math.max(0, impotMensuel);
  const avantageNetFiscal = data.ticketsResto + data.mutuelle;
  const salaireNetMensuel = brutTotal - cotisations.totalNetPay - prelevementSource;
  const salaireNetAvecAvantages = salaireNetMensuel + avantageNetFiscal;
  const tauxEffectif = brutTotal > 0 ? (prelevementSource + cotisations.totalNetPay) / brutTotal : 0;
  return {
    success: true,
    salaireNetMensuel: salaireNetAvecAvantages,
    salaireNetAnnuel: salaireNetAvecAvantages * 12,
    impotPasTotal: prelevementSource * 12,
    cotisationsSociales: cotisations.totalNetPay * 12,
    salaireGrossMensuel: brutTotal,
    tauxEffectif,
    explications: `Avec un salaire brut de ${brutTotal.toFixed(2)}\u20AC et ${data.enfants} enfant(s), votre salaire net estim\xE9 est ${salaireNetAvecAvantages.toFixed(2)}\u20AC par mois.`,
    details: {
      salaireBase: data.salaireBrut,
      primes: data.primes,
      heuresSup: data.heuresSup,
      brutTotal,
      cotisationsEmploye: cotisations.totalNetPay,
      prelevementSource,
      ticketsResto: data.ticketsResto,
      mutuelle: data.mutuelle,
      netTotal: salaireNetAvecAvantages
    }
  };
}

// api-src/v1/salaire-net.ts
async function handler16(req, res) {
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

// api-src/v1/[calculator].ts
var handlers = {
  aah: handler,
  apl: handler2,
  "apl-etudiant": handler3,
  are: handler4,
  asf: handler5,
  "cout-reel-voiture": handler6,
  "impot-revenu": handler7,
  "indemnite-licenciement": handler8,
  notaire: handler9,
  "prime-activite": handler10,
  ptz: handler11,
  "reste-a-vivre": handler12,
  retraite: handler13,
  rsa: handler14,
  salaire: handler15,
  "salaire-net": handler16
};
async function handler17(req, res) {
  const calculator = String(req.query.calculator || "");
  const fn = handlers[calculator];
  if (!fn) {
    return res.status(404).json({
      error: `Endpoint inconnu : /api/v1/${calculator}`,
      documentation: "https://www.lescalculateurs.fr/pages/api"
    });
  }
  return fn(req, res);
}
export {
  handler17 as default
};
