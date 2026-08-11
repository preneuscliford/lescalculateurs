/**
 * API LesCalculateurs — POST /api/v1/impot-revenu
 * Body: { revenu, parts }
 */

import { withCors, authenticate } from "../_lib/auth";
import { withMeta } from "../_lib/meta";
import { calculerIR } from "../../src/utils/irCalculEngine";

export default async function handler(req: any, res: any) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  const auth = authenticate(req, res);
  if (!auth) return;

  try {
    const { revenu, parts } = req.body || {};

    if (revenu === undefined || parts === undefined) {
      return res.status(400).json({
        error: "Champs requis : revenu, parts.",
        exemple: { revenu: 35000, parts: 1 },
      });
    }

    const result = calculerIR({ revenu: Number(revenu) || 0, parts: Number(parts) || 1 });

    return res.status(200).json(withMeta("impot-revenu", result));
  } catch (err: any) {
    if (err.message === "Entrées invalides") {
      return res.status(400).json({ error: "revenu ou parts invalide(s)." });
    }
    console.error("API /v1/impot-revenu error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
