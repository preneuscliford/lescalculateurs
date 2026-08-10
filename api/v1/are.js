/**
 * API LesCalculateurs — POST /api/v1/are
 * Body: { situation: "seul"|"couple"|"parent", ancienneteEmploi, salaireReferent,
 *         personnesCharge, agePersonne }
 */

import { withCors, authenticate } from "../_lib/auth.js";
import { calculerARE } from "../../src/utils/areCalculEngine";

export default async function handler(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  const auth = authenticate(req, res);
  if (!auth) return;

  try {
    const { situation, ancienneteEmploi, salaireReferent, personnesCharge, agePersonne } =
      req.body || {};

    if (
      !situation ||
      ancienneteEmploi === undefined ||
      salaireReferent === undefined ||
      agePersonne === undefined
    ) {
      return res.status(400).json({
        error: "Champs requis : situation, ancienneteEmploi, salaireReferent, agePersonne.",
        exemple: {
          situation: "seul",
          ancienneteEmploi: 24,
          salaireReferent: 2200,
          personnesCharge: 0,
          agePersonne: 35,
        },
      });
    }

    const result = calculerARE({
      situation,
      ancienneteEmploi: Number(ancienneteEmploi) || 0,
      salaireReferent: Number(salaireReferent) || 0,
      personnesCharge: Number(personnesCharge) || 0,
      agePersonne: Number(agePersonne) || 0,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("API /v1/are error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
