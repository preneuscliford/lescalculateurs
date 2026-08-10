/**
 * API LesCalculateurs — GET /api/v1
 * Liste des endpoints disponibles. Ne nécessite pas de clé API (découverte publique).
 */

import { withCors } from "../_lib/auth";

const ENDPOINTS = [
  {
    path: "/api/v1/keys",
    method: "POST",
    description: "Génère une clé API gratuite, valable 3 mois (aucune clé requise pour l'appeler)",
  },
  { path: "/api/v1/rsa", method: "POST", description: "Simulation RSA" },
  { path: "/api/v1/apl", method: "POST", description: "Simulation APL (aide au logement)" },
  { path: "/api/v1/are", method: "POST", description: "Simulation ARE (allocation chômage)" },
  { path: "/api/v1/retraite", method: "POST", description: "Âge légal de départ à la retraite" },
  {
    path: "/api/v1/indemnite-licenciement",
    method: "POST",
    description: "Indemnité légale de licenciement",
  },
  { path: "/api/v1/salaire-net", method: "POST", description: "Conversion salaire brut → net" },
];

export default async function handler(req: any, res: any) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  return res.status(200).json({
    name: "API LesCalculateurs",
    version: "v1",
    documentation: "https://www.lescalculateurs.fr/pages/api",
    authentication: "En-tête X-API-Key requis sur chaque endpoint (sauf celui-ci).",
    endpoints: ENDPOINTS,
  });
}
