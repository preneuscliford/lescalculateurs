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
  { path: "/api/v1/are", method: "POST", description: "Simulation ARE (allocation ch\xF4mage)" },
  { path: "/api/v1/retraite", method: "POST", description: "\xC2ge l\xE9gal de d\xE9part \xE0 la retraite" },
  {
    path: "/api/v1/indemnite-licenciement",
    method: "POST",
    description: "Indemnit\xE9 l\xE9gale de licenciement"
  },
  { path: "/api/v1/salaire-net", method: "POST", description: "Conversion salaire brut \u2192 net" }
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
