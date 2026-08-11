/**
 * API LesCalculateurs — POST /api/v1/apl-etudiant
 * Body: { situation: "seul"|"couple"|"parent", age, revenus, chargesLocatives, personnesCharge }
 */

import { withCors, authenticate } from "../_lib/auth";
import { withMeta } from "../_lib/meta";
import { calculerAPLEtudiant } from "../../src/utils/aplEtudiantCalculEngine";

export default async function handler(req: any, res: any) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  const auth = authenticate(req, res);
  if (!auth) return;

  try {
    const { situation, age, revenus, chargesLocatives, personnesCharge } = req.body || {};

    if (!situation || age === undefined || revenus === undefined || chargesLocatives === undefined) {
      return res.status(400).json({
        error: "Champs requis : situation, age, revenus, chargesLocatives.",
        exemple: { situation: "seul", age: 21, revenus: 400, chargesLocatives: 450, personnesCharge: 0 },
      });
    }

    const result = calculerAPLEtudiant({
      situation,
      age: Number(age) || 0,
      revenus: Number(revenus) || 0,
      chargesLocatives: Number(chargesLocatives) || 0,
      personnesCharge: Number(personnesCharge) || 0,
    });

    return res.status(200).json(withMeta("apl-etudiant", result));
  } catch (err: any) {
    console.error("API /v1/apl-etudiant error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
