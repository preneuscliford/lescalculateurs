// api-src/_lib/tokens.ts
var VALIDITY_MS = 90 * 24 * 60 * 60 * 1e3;

// api-src/_lib/auth.ts
function withCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
}

// api-src/v1/index.ts
var ENDPOINTS = [
  {
    path: "/api/v1/keys",
    method: "POST",
    description: "G\xE9n\xE8re une cl\xE9 API gratuite, valable 3 mois (aucune cl\xE9 requise pour l'appeler)"
  },
  { path: "/api/v1/rsa", method: "POST", description: "Simulation RSA" },
  { path: "/api/v1/apl", method: "POST", description: "Simulation APL (aide au logement)" },
  { path: "/api/v1/apl-etudiant", method: "POST", description: "Simulation APL \xE9tudiant / jeune actif" },
  { path: "/api/v1/are", method: "POST", description: "Simulation ARE (allocation ch\xF4mage)" },
  { path: "/api/v1/retraite", method: "POST", description: "\xC2ge l\xE9gal de d\xE9part \xE0 la retraite" },
  {
    path: "/api/v1/indemnite-licenciement",
    method: "POST",
    description: "Indemnit\xE9 l\xE9gale de licenciement"
  },
  { path: "/api/v1/salaire-net", method: "POST", description: "Conversion salaire brut \u2192 net d\xE9taill\xE9e" },
  { path: "/api/v1/salaire", method: "POST", description: "Conversion salaire brut \u2192 net simplifi\xE9e (cadre/non-cadre)" },
  { path: "/api/v1/notaire", method: "POST", description: "Frais de notaire (achat immobilier)" },
  { path: "/api/v1/aah", method: "POST", description: "Allocation adulte handicap\xE9 (AAH)" },
  { path: "/api/v1/asf", method: "POST", description: "Allocation de soutien familial (ASF)" },
  { path: "/api/v1/prime-activite", method: "POST", description: "Prime d'activit\xE9" },
  { path: "/api/v1/ptz", method: "POST", description: "\xC9ligibilit\xE9 au pr\xEAt \xE0 taux z\xE9ro (plafond de ressources)" },
  { path: "/api/v1/impot-revenu", method: "POST", description: "Imp\xF4t sur le revenu (bar\xE8me par tranches)" },
  { path: "/api/v1/reste-a-vivre", method: "POST", description: "Reste \xE0 vivre mensuel et taux d'endettement" },
  { path: "/api/v1/cout-reel-voiture", method: "POST", description: "Co\xFBt r\xE9el mensuel d'une voiture" }
];
async function handler(req, res) {
  withCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  return res.status(200).json({
    name: "API LesCalculateurs",
    version: "v1",
    documentation: "https://www.lescalculateurs.fr/pages/api",
    authentication: "En-t\xEAte X-API-Key requis sur chaque endpoint (sauf celui-ci).",
    endpoints: ENDPOINTS
  });
}
export {
  handler as default
};
