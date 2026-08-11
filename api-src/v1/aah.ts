/**
 * API LesCalculateurs — POST /api/v1/aah
 * Body: { situation, enfants, tauxIncapacite, revenus, logement }
 */

import { withCors, authenticate } from "../_lib/auth";
import { calculerAAH } from "../../src/utils/aahCalculEngine";

export default async function handler(req: any, res: any) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  const auth = authenticate(req, res);
  if (!auth) return;

  try {
    const { situation, enfants, tauxIncapacite, revenus, logement } = req.body || {};

    if (!situation || !logement || tauxIncapacite === undefined) {
      return res.status(400).json({
        error: "Champs requis : situation, logement, tauxIncapacite.",
        exemple: {
          situation: "seul",
          enfants: 0,
          tauxIncapacite: 80,
          revenus: 300,
          logement: "locataire",
        },
      });
    }

    const result = calculerAAH({
      situation,
      enfants: Number(enfants) || 0,
      tauxIncapacite: Number(tauxIncapacite) || 0,
      revenus: Number(revenus) || 0,
      logement,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("API /v1/aah error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
