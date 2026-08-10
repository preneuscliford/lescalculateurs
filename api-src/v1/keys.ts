/**
 * API LesCalculateurs — POST /api/v1/keys
 * Génère une clé API gratuite, valable 3 mois, sans inscription. Endpoint
 * public (aucune clé requise pour l'appeler). Limité par IP pour éviter la
 * génération en masse (garde-fou en mémoire, best-effort — voir _lib/auth.ts
 * pour le même compromis assumé côté quotas).
 */

import { withCors } from "../_lib/auth";
import { generateToken } from "../_lib/tokens";

const DAILY_LIMIT_PER_IP = 5;
const genCount = new Map<string, number>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getClientIp(req: any): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

export default async function handler(req: any, res: any) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  try {
    const usageKey = `${getClientIp(req)}:${todayKey()}`;
    const count = (genCount.get(usageKey) || 0) + 1;
    genCount.set(usageKey, count);

    if (count > DAILY_LIMIT_PER_IP) {
      return res.status(429).json({
        error: "Trop de clés générées depuis cette adresse aujourd'hui. Réessayez demain.",
      });
    }

    const token = generateToken();
    return res.status(201).json({
      key: token.key,
      issuedAt: token.issuedAt,
      expiresAt: token.expiresAt,
      note: "Conservez cette clé, elle ne sera plus affichée. Valable 3 mois, renouvelable gratuitement à tout moment sur cette page.",
    });
  } catch (err: any) {
    console.error("API /v1/keys error:", err.message);
    return res.status(500).json({ error: "Génération de clé indisponible pour le moment." });
  }
}
