/**
 * API LesCalculateurs — POST /api/v1/apl-etudiant
 * Body: { situation: "seul"|"couple"|"parent", revenus, chargesLocatives, personnesCharge?,
 *         zone?: "1"|"2"|"3", logement?: "classique"|"foyer", boursier?, horsUE?,
 *         exception?: "aucune"|"activite"|"apprenti"|"refugie"|"conjoint" }
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
    const {
      situation,
      age,
      revenus,
      chargesLocatives,
      personnesCharge,
      zone,
      logement,
      boursier,
      horsUE,
      exception,
    } = req.body || {};

    if (!situation || revenus === undefined || chargesLocatives === undefined) {
      return res.status(400).json({
        error: "Champs requis : situation, revenus, chargesLocatives.",
        exemple: {
          situation: "seul",
          revenus: 400,
          chargesLocatives: 450,
          personnesCharge: 0,
          zone: "2",
          logement: "classique",
          boursier: false,
          horsUE: false,
          exception: "aucune",
        },
      });
    }

    const result = calculerAPLEtudiant({
      situation,
      age: Number(age) || undefined,
      revenus: Number(revenus) || 0,
      chargesLocatives: Number(chargesLocatives) || 0,
      personnesCharge: Number(personnesCharge) || 0,
      zone: ["1", "2", "3"].includes(String(zone)) ? (String(zone) as "1" | "2" | "3") : "2",
      logement: logement === "foyer" ? "foyer" : "classique",
      boursier: boursier === true || boursier === "true",
      horsUE: horsUE === true || horsUE === "true",
      exception: ["activite", "apprenti", "refugie", "conjoint"].includes(exception) ? exception : "aucune",
    });

    return res.status(200).json(withMeta("apl-etudiant", result));
  } catch (err: any) {
    console.error("API /v1/apl-etudiant error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
