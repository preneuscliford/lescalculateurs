/**
 * API LesCalculateurs — POST /api/v1/asf
 * Body: { situation: "parentisole"|"orphelin"|"depourvu", nombreEnfants, revenus, enfantACharge }
 */

import { withCors, authenticate } from "../_lib/auth";
import { withMeta } from "../_lib/meta";
import { calculerASF } from "../../src/utils/asfCalculEngine";

export default async function handler(req: any, res: any) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  const auth = authenticate(req, res);
  if (!auth) return;

  try {
    const { situation, nombreEnfants, revenus, enfantACharge } = req.body || {};

    if (!situation || nombreEnfants === undefined) {
      return res.status(400).json({
        error: "Champs requis : situation, nombreEnfants.",
        exemple: { situation: "parentisole", nombreEnfants: 2, revenus: 1200, enfantACharge: true },
      });
    }

    const result = calculerASF({
      situation,
      nombreEnfants: Number(nombreEnfants) || 0,
      revenus: Number(revenus) || 0,
      enfantACharge: Boolean(enfantACharge),
    });

    return res.status(200).json(withMeta("asf", result));
  } catch (err: any) {
    console.error("API /v1/asf error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
