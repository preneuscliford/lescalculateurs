/**
 * API LesCalculateurs — POST /api/v1/retraite
 * Body: { dateNaissance: "YYYY-MM-DD", trimestresValides?: number }
 */

import { withCors, authenticate } from "../_lib/auth";
import { withMeta } from "../_lib/meta";
import { calculerAgeLegalRetraite } from "../../src/utils/retraiteCalculEngine";

export default async function handler(req: any, res: any) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  const auth = authenticate(req, res);
  if (!auth) return;

  try {
    const { dateNaissance, trimestresValides } = req.body || {};

    if (!dateNaissance) {
      return res.status(400).json({
        error: "Champ requis : dateNaissance (format YYYY-MM-DD).",
        exemple: { dateNaissance: "1964-06-15", trimestresValides: 140 },
      });
    }

    const parsed = new Date(dateNaissance);
    if (Number.isNaN(parsed.getTime())) {
      return res.status(400).json({ error: "dateNaissance invalide, attendu YYYY-MM-DD." });
    }

    const result = calculerAgeLegalRetraite({
      dateNaissance: parsed,
      trimestresValides:
        trimestresValides === undefined || trimestresValides === null
          ? null
          : Number(trimestresValides),
    });

    return res.status(200).json(withMeta("retraite", result));
  } catch (err: any) {
    console.error("API /v1/retraite error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
