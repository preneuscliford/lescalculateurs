/**
 * API LesCalculateurs — POST /api/v1/notaire
 * Body: { prixAchat, typeBien: "ancien"|"neuf"|"terrain", departement,
 *         montantMobilier?, typeEmprunt?, pretsAides?, autresPrets?,
 *         remiseNotarialeVariable?, primoAccedant? }
 */

import { withCors, authenticate } from "../_lib/auth";
import { withMeta } from "../_lib/meta";
import { calculerNotaire } from "../../src/utils/notaireCalculEngine";

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
      prixAchat,
      typeBien,
      departement,
      montantMobilier,
      typeEmprunt,
      pretsAides,
      autresPrets,
      remiseNotarialeVariable,
      primoAccedant,
    } = req.body || {};

    if (prixAchat === undefined || !typeBien || !departement) {
      return res.status(400).json({
        error: "Champs requis : prixAchat, typeBien, departement.",
        exemple: { prixAchat: 250000, typeBien: "ancien", departement: "75" },
      });
    }

    const result = calculerNotaire({
      prixAchat: Number(prixAchat) || 0,
      typeBien,
      departement: String(departement),
      montantMobilier: Number(montantMobilier) || 0,
      typeEmprunt,
      pretsAides: Number(pretsAides) || 0,
      autresPrets: Number(autresPrets) || 0,
      remiseNotarialeVariable: Boolean(remiseNotarialeVariable),
      primoAccedant: primoAccedant === true || primoAccedant === "true",
    });

    return res.status(200).json(withMeta("notaire", result));
  } catch (err: any) {
    console.error("API /v1/notaire error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
