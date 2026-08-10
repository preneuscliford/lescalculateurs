/**
 * API LesCalculateurs — POST /api/v1/rsa
 * Body: { situation: "seul"|"couple"|"monoparental", enfants, revenus, logement, activite }
 */

import { withCors, authenticate } from "../_lib/auth";
import { calculerRSA } from "../../src/utils/rsaCalculEngine";

export default async function handler(req: any, res: any) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
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
          activite: "inactif",
        },
      });
    }

    const result = calculerRSA({
      situation,
      enfants: Number(enfants) || 0,
      revenus: Number(revenus) || 0,
      logement,
      activite,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("API /v1/rsa error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
