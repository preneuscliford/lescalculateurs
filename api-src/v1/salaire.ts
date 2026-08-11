/**
 * API LesCalculateurs — POST /api/v1/salaire
 * Conversion brut -> net simplifiée (taux forfaitaire cadre/non-cadre).
 * Pour une conversion détaillée (primes, heures sup, tickets restaurant,
 * mutuelle...), voir POST /api/v1/salaire-net.
 * Body: { brutMensuel, statut: "cadre"|"non_cadre", tauxPAS? }
 */

import { withCors, authenticate } from "../_lib/auth";
import { withMeta } from "../_lib/meta";
import { calculerSalaire } from "../../src/utils/salaireCalculEngine";

export default async function handler(req: any, res: any) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  const auth = authenticate(req, res);
  if (!auth) return;

  try {
    const { brutMensuel, statut, tauxPAS } = req.body || {};

    if (brutMensuel === undefined || !statut) {
      return res.status(400).json({
        error: "Champs requis : brutMensuel, statut.",
        exemple: { brutMensuel: 3000, statut: "cadre", tauxPAS: 8 },
      });
    }

    const result = calculerSalaire({
      brutMensuel: Number(brutMensuel) || 0,
      statut,
      tauxPAS: Number(tauxPAS) || 0,
    });

    return res.status(200).json(withMeta("salaire", result));
  } catch (err: any) {
    if (err.message === "Brut invalide" || err.message === "Statut invalide" || err.message === "Taux PAS invalide") {
      return res.status(400).json({ error: err.message });
    }
    console.error("API /v1/salaire error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
