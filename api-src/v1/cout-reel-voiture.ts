/**
 * API LesCalculateurs — POST /api/v1/cout-reel-voiture
 * Body: { carburant: "essence"|"diesel"|"hybride"|"electrique", kilometrageAnnuel,
 *         consommation, prixCarburant, assuranceAnnuelle, carteGriseAnnuelle,
 *         revisionAnnuelle, parking, peagesAnnuels, contraventions, creditMensuel }
 */

import { withCors, authenticate } from "../_lib/auth";
import { calculerCoutReelVoiture } from "../../src/utils/coutReelVoitureCalculEngine";

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
      carburant,
      kilometrageAnnuel,
      consommation,
      prixCarburant,
      assuranceAnnuelle,
      carteGriseAnnuelle,
      revisionAnnuelle,
      parking,
      peagesAnnuels,
      contraventions,
      creditMensuel,
    } = req.body || {};

    if (!carburant || kilometrageAnnuel === undefined || consommation === undefined || prixCarburant === undefined) {
      return res.status(400).json({
        error: "Champs requis : carburant, kilometrageAnnuel, consommation, prixCarburant.",
        exemple: {
          carburant: "essence",
          kilometrageAnnuel: 12000,
          consommation: 6.5,
          prixCarburant: 1.85,
          assuranceAnnuelle: 600,
          carteGriseAnnuelle: 0,
          revisionAnnuelle: 250,
          parking: 0,
          peagesAnnuels: 0,
          contraventions: 0,
          creditMensuel: 0,
        },
      });
    }

    const result = calculerCoutReelVoiture({
      carburant,
      kilometrageAnnuel: Number(kilometrageAnnuel) || 0,
      consommation: Number(consommation) || 0,
      prixCarburant: Number(prixCarburant) || 0,
      assuranceAnnuelle: Number(assuranceAnnuelle) || 0,
      carteGriseAnnuelle: Number(carteGriseAnnuelle) || 0,
      revisionAnnuelle: Number(revisionAnnuelle) || 0,
      parking: Number(parking) || 0,
      peagesAnnuels: Number(peagesAnnuels) || 0,
      contraventions: Number(contraventions) || 0,
      creditMensuel: Number(creditMensuel) || 0,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("API /v1/cout-reel-voiture error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
