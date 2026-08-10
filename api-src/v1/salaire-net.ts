/**
 * API LesCalculateurs — POST /api/v1/salaire-net
 * Body: { salaireBrut, statut: "salarie"|"independant"|"auto-entrepreneur", primes?,
 *         heuresSup?, ticketsResto?, mutuelle?, enfants?, mariageOrPacs? }
 */

import { withCors, authenticate } from "../_lib/auth";
import { calculerSalaireNet } from "../../src/utils/salaireNetCalculEngine";

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
      salaireBrut,
      statut,
      primes,
      heuresSup,
      ticketsResto,
      mutuelle,
      enfants,
      mariageOrPacs,
    } = req.body || {};

    if (salaireBrut === undefined || !statut) {
      return res.status(400).json({
        error: "Champs requis : salaireBrut, statut.",
        exemple: { salaireBrut: 2800, statut: "salarie", enfants: 0, mariageOrPacs: false },
      });
    }

    const result = calculerSalaireNet({
      salaireBrut: Number(salaireBrut) || 0,
      statut,
      primes: Number(primes) || 0,
      heuresSup: Number(heuresSup) || 0,
      ticketsResto: Number(ticketsResto) || 0,
      mutuelle: Number(mutuelle) || 0,
      enfants: Number(enfants) || 0,
      mariageOrPacs: Boolean(mariageOrPacs),
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("API /v1/salaire-net error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
