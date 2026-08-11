/**
 * API LesCalculateurs — route dynamique /api/v1/{calculator}
 *
 * Regroupe les 16 endpoints calculateurs dans une seule fonction serverless
 * Vercel (au lieu d'un fichier par endpoint) pour rester sous la limite de
 * 12 fonctions du plan Hobby. Chaque module conserve sa propre logique
 * (validation, appel au moteur de calcul, withMeta) inchangée dans
 * ./{nom}.ts ; ce fichier ne fait que dispatcher req/res vers le bon
 * handler selon le segment d'URL, via req.query.calculator (peuplé par
 * Vercel à partir du nom de fichier entre crochets).
 */

import aah from "./aah";
import apl from "./apl";
import aplEtudiant from "./apl-etudiant";
import are from "./are";
import asf from "./asf";
import coutReelVoiture from "./cout-reel-voiture";
import impotRevenu from "./impot-revenu";
import indemniteLicenciement from "./indemnite-licenciement";
import notaire from "./notaire";
import primeActivite from "./prime-activite";
import ptz from "./ptz";
import resteAVivre from "./reste-a-vivre";
import retraite from "./retraite";
import rsa from "./rsa";
import salaire from "./salaire";
import salaireNet from "./salaire-net";

const handlers: Record<string, (req: any, res: any) => Promise<any>> = {
  aah,
  apl,
  "apl-etudiant": aplEtudiant,
  are,
  asf,
  "cout-reel-voiture": coutReelVoiture,
  "impot-revenu": impotRevenu,
  "indemnite-licenciement": indemniteLicenciement,
  notaire,
  "prime-activite": primeActivite,
  ptz,
  "reste-a-vivre": resteAVivre,
  retraite,
  rsa,
  salaire,
  "salaire-net": salaireNet,
};

export default async function handler(req: any, res: any) {
  const calculator = String(req.query.calculator || "");
  const fn = handlers[calculator];

  if (!fn) {
    return res.status(404).json({
      error: `Endpoint inconnu : /api/v1/${calculator}`,
      documentation: "https://www.lescalculateurs.fr/pages/api",
    });
  }

  return fn(req, res);
}
