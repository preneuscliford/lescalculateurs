/**
 * Clés API auto-générées, sans base de données.
 *
 * Une clé encode simplement sa date d'expiration et une signature HMAC ;
 * elle est vérifiée à la volée à chaque requête (pas de stockage). C'est ce
 * qui permet la génération instantanée depuis le site, tout en gardant une
 * validité strictement limitée à 3 mois. Nécessite la variable
 * d'environnement Vercel API_KEY_SECRET (chaîne aléatoire longue) ; sans
 * elle, la génération/vérification échoue proprement (voir generateToken /
 * verifyToken).
 *
 * Contrepartie assumée : une clé individuelle ne peut pas être révoquée
 * isolément (il faudrait un store partagé pour ça). Acceptable pour un
 * lancement gratuit à faible enjeu ; à revoir si l'abus devient un problème.
 */

import crypto from "node:crypto";

const TOKEN_PREFIX = "lc_free_";
const VALIDITY_MS = 90 * 24 * 60 * 60 * 1000; // ~3 mois

function getSecret(): string {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) {
    throw new Error("API_KEY_SECRET non configuré");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function generateToken(): { key: string; issuedAt: string; expiresAt: string } {
  const now = Date.now();
  const payload = Buffer.from(JSON.stringify({ iat: now, exp: now + VALIDITY_MS })).toString(
    "base64url",
  );
  const signature = sign(payload);

  return {
    key: `${TOKEN_PREFIX}${payload}.${signature}`,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + VALIDITY_MS).toISOString(),
  };
}

export function verifyToken(key: string | undefined | null): { issuedAt: number; expiresAt: number } | null {
  if (typeof key !== "string" || !key.startsWith(TOKEN_PREFIX)) return null;

  const rest = key.slice(TOKEN_PREFIX.length);
  const separatorIndex = rest.lastIndexOf(".");
  if (separatorIndex === -1) return null;

  const payload = rest.slice(0, separatorIndex);
  const signature = rest.slice(separatorIndex + 1);
  if (!payload || !signature) return null;

  let expectedSignature: string;
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

  let data: { iat?: number; exp?: number };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (typeof data.exp !== "number" || Date.now() > data.exp) return null;

  return { issuedAt: data.iat as number, expiresAt: data.exp };
}
