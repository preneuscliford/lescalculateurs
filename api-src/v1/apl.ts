/**
 * API LesCalculateurs — POST /api/v1/apl
 * Body: { situation: "seul"|"couple"|"monoparental"|"autre", enfants, revenus_mensuels,
 *         loyer_mensuel, region: "idf"|"province"|"dom", type_logement? }
 */

import { withCors, authenticate } from "../_lib/auth";
import { withMeta } from "../_lib/meta";
import { calculerAPL } from "../../src/utils/aplCalculEngine";

export default async function handler(req: any, res: any) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  const auth = authenticate(req, res);
  if (!auth) return;

  try {
    const { situation, enfants, revenus_mensuels, loyer_mensuel, region, type_logement } =
      req.body || {};

    if (!situation || !region || revenus_mensuels === undefined || loyer_mensuel === undefined) {
      return res.status(400).json({
        error: "Champs requis : situation, region, revenus_mensuels, loyer_mensuel.",
        exemple: {
          situation: "seul",
          enfants: 0,
          revenus_mensuels: 1200,
          loyer_mensuel: 600,
          region: "province",
        },
      });
    }

    const result = calculerAPL({
      situation,
      enfants: Number(enfants) || 0,
      revenus_mensuels: Number(revenus_mensuels) || 0,
      loyer_mensuel: Number(loyer_mensuel) || 0,
      region,
      type_logement,
    });

    return res.status(200).json(withMeta("apl", result));
  } catch (err: any) {
    console.error("API /v1/apl error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
