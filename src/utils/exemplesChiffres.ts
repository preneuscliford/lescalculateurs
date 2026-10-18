/**
 * Exemples chiffrés générés depuis les moteurs de calcul.
 *
 * Dans le HTML, un montant d'exemple s'écrit :
 *   <span data-exemple="apl" data-params='{"situation":"seul","enfants":0,...}'>116</span>
 * Le contenu du <span> est recalculé par le moteur correspondant :
 *   - `npm run exemples:sync` réécrit les pages (lancé aussi au build) ;
 *   - tests/exemplesChiffres.test.ts échoue si une page n'est plus à jour.
 * Options : data-arrondi="100" (arrondi à la centaine), data-champ (valeur secondaire du moteur).
 */

import { calculerAPL, type APLInput } from "./aplCalculEngine";
import { calculerPrimeActivite, type PrimeActiviteCalculData } from "./primeActiviteCalculEngine";
import { calculerNotaire, type NotaireCalculData } from "./notaireCalculEngine";

type Calcul = (params: any, champ?: string) => number;

export const CALCULS_EXEMPLES: Record<string, Calcul> = {
  /** APL mensuelle ; champ "reste" = loyer − APL */
  apl: (p: APLInput, champ) => {
    const d = calculerAPL(p).data;
    if (!d) throw new Error(`APL non calculable : ${JSON.stringify(p)}`);
    return champ === "reste" ? d.reste_charge : d.apl_estimee;
  },
  /** Prime d'activité mensuelle */
  "prime-activite": (p: PrimeActiviteCalculData) => calculerPrimeActivite(p).montantEstime,
  /** Frais de notaire ; champ = "total" (défaut), "droitsEnregistrement", "emoluments"… */
  notaire: (p: NotaireCalculData, champ = "total") => {
    const r = calculerNotaire(p) as unknown as Record<string, number>;
    if (typeof r[champ] !== "number") throw new Error(`Champ notaire inconnu : ${champ}`);
    return r[champ];
  },
};

/** Format français : séparateur de milliers espace, pas de décimales */
export function formaterMontant(valeur: number, arrondi = 1): string {
  const v = Math.round(valeur / arrondi) * arrondi;
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const MARQUEUR =
  /(<span\b[^>]*?\bdata-exemple="([\w-]+)"[^>]*?>)([^<]*)(<\/span>)/g;

function attribut(balise: string, nom: string): string | undefined {
  const m = balise.match(new RegExp(`\\b${nom}=(?:'([^']*)'|"([^"]*)")`));
  return m ? (m[1] ?? m[2]) : undefined;
}

export interface EcartExemple {
  calcul: string;
  params: string;
  affiche: string;
  attendu: string;
}

/** Recalcule tous les marqueurs d'une page ; renvoie le HTML à jour et les écarts trouvés */
export function synchroniserExemples(html: string): { html: string; ecarts: EcartExemple[] } {
  const ecarts: EcartExemple[] = [];
  const out = html.replace(MARQUEUR, (_tout: string, ouverture: string, calcul: string, contenu: string, fermeture: string) => {
    const fn = CALCULS_EXEMPLES[calcul];
    if (!fn) throw new Error(`Calcul d'exemple inconnu : ${calcul}`);
    const brut = attribut(ouverture, "data-params");
    if (!brut) throw new Error(`data-params manquant : ${ouverture}`);
    const params = JSON.parse(brut.replace(/&quot;/g, '"'));
    const arrondi = Number(attribut(ouverture, "data-arrondi") || 1);
    const attendu = formaterMontant(fn(params, attribut(ouverture, "data-champ")), arrondi);
    if (contenu.trim() !== attendu) ecarts.push({ calcul, params: brut, affiche: contenu.trim(), attendu });
    return `${ouverture}${attendu}${fermeture}`;
  });
  return { html: out, ecarts };
}
