/**
 * API LesCalculateurs — POST /api/v1/reste-a-vivre
 * Body: voir exemple ci-dessous (tous les champs sont des montants mensuels
 * en euros, 0 si non applicable).
 */

import { withCors, authenticate } from "../_lib/auth";
import { withMeta } from "../_lib/meta";
import { calculerResteAVivre } from "../../src/utils/resteAVivreCalculEngine";

const NUMERIC_FIELDS = [
  "salaireNetMensuel",
  "autresRevenus",
  "primActivite",
  "rsa",
  "apl",
  "aah",
  "autresAides",
  "loyer",
  "assuranceLogement",
  "electricite",
  "eau",
  "internet",
  "telephone",
  "transportRoutier",
  "transportPublic",
  "assuranceSante",
  "gardienEnfants",
  "alimentation",
  "hygiene",
  "vetements",
  "loisirs",
  "autres",
  "nbPersonnes",
  "nbEnfants",
] as const;

export default async function handler(req: any, res: any) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  const auth = authenticate(req, res);
  if (!auth) return;

  try {
    const body = req.body || {};

    if (body.salaireNetMensuel === undefined || body.loyer === undefined) {
      return res.status(400).json({
        error: "Champs requis au minimum : salaireNetMensuel, loyer (tous les autres sont optionnels, défaut 0).",
        exemple: {
          salaireNetMensuel: 2000,
          autresRevenus: 0,
          primActivite: 0,
          rsa: 0,
          apl: 0,
          aah: 0,
          autresAides: 0,
          loyer: 700,
          assuranceLogement: 15,
          electricite: 60,
          eau: 20,
          internet: 30,
          telephone: 20,
          transportRoutier: 150,
          transportPublic: 0,
          assuranceSante: 40,
          gardienEnfants: 0,
          alimentation: 300,
          hygiene: 30,
          vetements: 50,
          loisirs: 80,
          autres: 0,
          nbPersonnes: 1,
          nbEnfants: 0,
        },
      });
    }

    const data: Record<string, number> = {};
    for (const field of NUMERIC_FIELDS) {
      data[field] = Number(body[field]) || 0;
    }
    if (!data.nbPersonnes) data.nbPersonnes = 1;

    const result = calculerResteAVivre(data as any);

    return res.status(200).json(withMeta("reste-a-vivre", result));
  } catch (err: any) {
    console.error("API /v1/reste-a-vivre error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
