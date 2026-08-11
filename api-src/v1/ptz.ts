/**
 * API LesCalculateurs — POST /api/v1/ptz
 * Vérifie uniquement le plafond de ressources (pas le montant du prêt).
 * Body: { zone: "A"|"B1"|"B2"|"C", nombrePersonnes, revenuFiscalReference }
 */

import { withCors, authenticate } from "../_lib/auth";
import { verifierEligibilitePTZ } from "../../src/utils/ptzEligibiliteCalculEngine";

export default async function handler(req: any, res: any) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  const auth = authenticate(req, res);
  if (!auth) return;

  try {
    const { zone, nombrePersonnes, revenuFiscalReference } = req.body || {};

    if (!zone || nombrePersonnes === undefined || revenuFiscalReference === undefined) {
      return res.status(400).json({
        error: "Champs requis : zone, nombrePersonnes, revenuFiscalReference.",
        exemple: { zone: "B1", nombrePersonnes: 3, revenuFiscalReference: 45000 },
      });
    }

    const result = verifierEligibilitePTZ({
      zone,
      nombrePersonnes: Number(nombrePersonnes) || 1,
      revenuFiscalReference: Number(revenuFiscalReference) || 0,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("API /v1/ptz error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
