/**
 * API LesCalculateurs — POST /api/v1/indemnite-licenciement
 * Body: { dateEntree: "YYYY-MM-DD", dateSortie: "YYYY-MM-DD", salaireMensuelBrutMoyen }
 */

import { withCors, authenticate } from "../_lib/auth";
import { withMeta } from "../_lib/meta";
import { calculerIndemniteLicenciement } from "../../src/utils/indemniteLicenciementCalculEngine";

export default async function handler(req: any, res: any) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  const auth = authenticate(req, res);
  if (!auth) return;

  try {
    const { dateEntree, dateSortie, salaireMensuelBrutMoyen } = req.body || {};

    if (!dateEntree || !dateSortie || salaireMensuelBrutMoyen === undefined) {
      return res.status(400).json({
        error: "Champs requis : dateEntree, dateSortie, salaireMensuelBrutMoyen.",
        exemple: {
          dateEntree: "2015-03-01",
          dateSortie: "2026-08-01",
          salaireMensuelBrutMoyen: 2600,
        },
      });
    }

    const entree = new Date(dateEntree);
    const sortie = new Date(dateSortie);
    if (Number.isNaN(entree.getTime()) || Number.isNaN(sortie.getTime())) {
      return res.status(400).json({ error: "dateEntree/dateSortie invalides, attendu YYYY-MM-DD." });
    }

    const result = calculerIndemniteLicenciement({
      dateEntree: entree,
      dateSortie: sortie,
      salaireMensuelBrutMoyen: Number(salaireMensuelBrutMoyen) || 0,
    });

    return res.status(200).json(withMeta("indemnite-licenciement", result));
  } catch (err: any) {
    console.error("API /v1/indemnite-licenciement error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
