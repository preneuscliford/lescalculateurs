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
function generateToken() {
  const now = Date.now();
  const payload = Buffer.from(JSON.stringify({ iat: now, exp: now + VALIDITY_MS })).toString(
    "base64url"
  );
  const signature = sign(payload);
  return {
    key: `${TOKEN_PREFIX}${payload}.${signature}`,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + VALIDITY_MS).toISOString()
  };
}

// api-src/_lib/auth.ts
function withCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
}

// api-src/v1/keys.ts
var DAILY_LIMIT_PER_IP = 5;
var genCount = /* @__PURE__ */ new Map();
function todayKey() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}
async function handler(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9thode non autoris\xE9e. Utilisez POST." });
  }
  try {
    const usageKey = `${getClientIp(req)}:${todayKey()}`;
    const count = (genCount.get(usageKey) || 0) + 1;
    genCount.set(usageKey, count);
    if (count > DAILY_LIMIT_PER_IP) {
      return res.status(429).json({
        error: "Trop de cl\xE9s g\xE9n\xE9r\xE9es depuis cette adresse aujourd'hui. R\xE9essayez demain."
      });
    }
    const token = generateToken();
    return res.status(201).json({
      key: token.key,
      issuedAt: token.issuedAt,
      expiresAt: token.expiresAt,
      note: "Conservez cette cl\xE9, elle ne sera plus affich\xE9e. Valable 3 mois, renouvelable gratuitement \xE0 tout moment sur cette page."
    });
  } catch (err) {
    console.error("API /v1/keys error:", err.message);
    return res.status(500).json({ error: "G\xE9n\xE9ration de cl\xE9 indisponible pour le moment." });
  }
}
export {
  handler as default
};
