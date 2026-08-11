/**
 * API LesCalculateurs — POST /api/v1/prime-activite
 * Body: { situation, enfants, revenusProf, autresRevenus, logement, typeActivite }
 */

import { withCors, authenticate } from "../_lib/auth";
import { withMeta } from "../_lib/meta";
import { calculerPrimeActivite } from "../../src/utils/primeActiviteCalculEngine";

export default async function handler(req: any, res: any) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  const auth = authenticate(req, res);
  if (!auth) return;

  try {
    const { situation, enfants, revenusProf, autresRevenus, logement, typeActivite } = req.body || {};

    if (!situation || !logement || !typeActivite) {
      return res.status(400).json({
        error: "Champs requis : situation, logement, typeActivite.",
        exemple: {
          situation: "seul",
          enfants: 0,
          revenusProf: 1400,
          autresRevenus: 0,
          logement: "loue",
          typeActivite: "salarie",
        },
      });
    }

    const result = calculerPrimeActivite({
      situation,
      enfants: Number(enfants) || 0,
      revenusProf: Number(revenusProf) || 0,
      autresRevenus: Number(autresRevenus) || 0,
      logement,
      typeActivite,
    });

    return res.status(200).json(withMeta("prime-activite", result));
  } catch (err: any) {
    console.error("API /v1/prime-activite error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
