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
  { path: "/api/v1/apl-etudiant", method: "POST", description: "Simulation APL étudiant / jeune actif" },
  { path: "/api/v1/are", method: "POST", description: "Simulation ARE (allocation chômage)" },
  { path: "/api/v1/retraite", method: "POST", description: "Âge légal de départ à la retraite" },
  {
    path: "/api/v1/indemnite-licenciement",
    method: "POST",
    description: "Indemnité légale de licenciement",
  },
  { path: "/api/v1/salaire-net", method: "POST", description: "Conversion salaire brut → net détaillée" },
  { path: "/api/v1/salaire", method: "POST", description: "Conversion salaire brut → net simplifiée (cadre/non-cadre)" },
  { path: "/api/v1/notaire", method: "POST", description: "Frais de notaire (achat immobilier)" },
  { path: "/api/v1/aah", method: "POST", description: "Allocation adulte handicapé (AAH)" },
  { path: "/api/v1/asf", method: "POST", description: "Allocation de soutien familial (ASF)" },
  { path: "/api/v1/prime-activite", method: "POST", description: "Prime d'activité" },
  { path: "/api/v1/ptz", method: "POST", description: "Éligibilité au prêt à taux zéro (plafond de ressources)" },
  { path: "/api/v1/impot-revenu", method: "POST", description: "Impôt sur le revenu (barème par tranches)" },
  { path: "/api/v1/reste-a-vivre", method: "POST", description: "Reste à vivre mensuel et taux d'endettement" },
  { path: "/api/v1/cout-reel-voiture", method: "POST", description: "Coût réel mensuel d'une voiture" },
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
