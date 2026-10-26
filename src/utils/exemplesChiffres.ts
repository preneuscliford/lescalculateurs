/**
 * Exemples chiffrés générés depuis les moteurs de calcul.
 *
 * Dans le HTML, un montant d'exemple s'écrit :
 *   <span data-exemple="apl" data-params='{"situation":"seul","enfants":0,...}'>116</span>
 * Le contenu du <span> est recalculé par le moteur correspondant :
 *   - `npm run exemples:sync` réécrit les pages (lancé aussi au build) ;
 *   - tests/exemplesChiffres.test.ts échoue si une page n'est plus à jour.
 * Options : data-arrondi="100" (arrondi à la centaine), data-decimales="2", data-champ (valeur
 * secondaire du moteur).
 *
 * FAQ : le bloc <script type="application/ld+json" data-faq="g"> est régénéré à partir de la FAQ
 * visible de la page (éléments data-faq-q="g" et data-faq-a="g", appariés dans l'ordre). Les
 * montants du JSON-LD sont donc ceux affichés, eux-mêmes calculés par les moteurs.
 */

import { calculerAPL, type APLInput } from "./aplCalculEngine";
import { calculerPrimeActivite, type PrimeActiviteCalculData } from "./primeActiviteCalculEngine";
import { calculerNotaire, type NotaireCalculData } from "./notaireCalculEngine";
import { calculerFinDroits, formaterDateLongue, type FinDroitsData } from "./finDroitsChomageCalculEngine";
import { calculerDepotGarantie, type DepotGarantieData } from "./depotGarantieCalculEngine";
import { calculerDpeLocation, type DpeLocationData } from "./dpeLocationCalculEngine";

/** Un calcul renvoie un montant (formaté à la française) ou un texte affiché tel quel (date…) */
type Calcul = (params: any, champ?: string) => number | string;

export const CALCULS_EXEMPLES: Record<string, Calcul> = {
  /** APL mensuelle ; champ "reste" = loyer − APL, "plafond" = loyer plafond retenu */
  apl: (p: APLInput, champ) => {
    const d = calculerAPL(p).data;
    if (!d) throw new Error(`APL non calculable : ${JSON.stringify(p)}`);
    if (champ === "plafond") return d.plafond_loyer;
    if (champ === "degressivite") return d.loyer_degressivite;
    if (champ === "suppression") return d.loyer_suppression;
    return champ === "reste" ? d.reste_charge : d.apl_estimee;
  },
  /** Revenus mensuels (pas de 10 €) à partir desquels l'APL n'est plus versée, pour ce foyer et ce loyer */
  "apl-seuil-revenus": (p: APLInput) => {
    for (let revenus = 0; revenus <= 20000; revenus += 10) {
      if ((calculerAPL({ ...p, revenus_mensuels: revenus }).data?.apl_estimee ?? 0) === 0) return revenus;
    }
    throw new Error(`Seuil de revenus APL introuvable : ${JSON.stringify(p)}`);
  },
  /** Prime d'activité mensuelle */
  "prime-activite": (p: PrimeActiviteCalculData) => calculerPrimeActivite(p).montantEstime,
  /** Frais de notaire ; champ = "total" (défaut), "droitsEnregistrement", "emoluments"… */
  /** Taux des droits de mutation appliqué, en texte : « 6,32 % » */
  "notaire-taux": (p: NotaireCalculData) =>
    `${(Math.round(calculerNotaire(p).tauxDroits * 100000) / 1000).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 3 })} %`,
  notaire: (p: NotaireCalculData, champ = "total") => {
    const r = calculerNotaire(p) as unknown as Record<string, number>;
    if (typeof r[champ] !== "number") throw new Error(`Champ notaire inconnu : ${champ}`);
    return r[champ];
  },
  /**
   * Fin de droits chômage ; champ = "premierJour", "dateFin", "degressiviteDate" (dates en
   * toutes lettres) ou "dureeJours", "differeSpecifique", "differeCongesPayes",
   * "allocationApres" (nombres)
   */
  "fin-droits": (p: FinDroitsData, champ = "dateFin") => {
    const r = calculerFinDroits(p);
    const valeurs: Record<string, number | string | null> = {
      premierJour: formaterDateLongue(r.premierJourIndemnise),
      dateFin: formaterDateLongue(r.dateFinDroits),
      degressiviteDate: formaterDateLongue(r.degressivite.dateDebut),
      dureeJours: r.dureeJours,
      differeSpecifique: r.differeSpecifiqueJours,
      differeCongesPayes: r.differeCongesPayesJours,
      allocationApres: r.degressivite.allocationApres,
      dateFinSansInterruption: formaterDateLongue(r.report.dateFinSansInterruption),
      repriseJoursIndemnises: r.report.repriseJoursIndemnisesParMois,
    };
    const v = valeurs[champ];
    if (v === undefined || v === null || v === "") throw new Error(`Champ fin-droits indisponible : ${champ}`);
    return v;
  },
  /** Dépôt de garantie ; champ = "dateLimite" (date), "moisDeRetard", "penalite", "total" (dépôt + pénalité) */
  "depot-garantie": (p: DepotGarantieData, champ = "penalite") => {
    const r = calculerDepotGarantie(p);
    const valeurs: Record<string, number | string | null> = {
      dateLimite: formaterDateLongue(r.dateLimite),
      moisDeRetard: r.moisDeRetard,
      penalite: r.penalite,
      penaliteParMois: r.penaliteParMois,
      total: Math.round((Number(p.depotVerse) + r.penalite) * 100) / 100,
    };
    const v = valeurs[champ];
    if (v === undefined || v === null || v === "") throw new Error(`Champ depot-garantie indisponible : ${champ}`);
    return v;
  },
  /** DPE et location ; champ = "dateInterdiction", "bailEnCoursJusquAu", "echeanceConcernee" (dates) */
  "dpe-location": (p: DpeLocationData, champ = "dateInterdiction") => {
    const r = calculerDpeLocation(p) as unknown as Record<string, string | null>;
    const v = formaterDateLongue(r[champ] ?? null);
    if (!v) throw new Error(`Champ dpe-location indisponible : ${champ}`);
    return v;
  },
};

/** Format français : séparateur de milliers espace, virgule décimale */
export function formaterMontant(valeur: number, arrondi = 1, decimales = 0): string {
  const v = decimales > 0 ? valeur : Math.round(valeur / arrondi) * arrondi;
  const [entier, dec] = v.toFixed(decimales).split(".");
  const milliers = entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return dec ? `${milliers},${dec}` : milliers;
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
    const decimales = Number(attribut(ouverture, "data-decimales") || 0);
    const valeur = fn(params, attribut(ouverture, "data-champ"));
    const attendu = typeof valeur === "string" ? valeur : formaterMontant(valeur, arrondi, decimales);
    if (contenu.trim() !== attendu) ecarts.push({ calcul, params: brut, affiche: contenu.trim(), attendu });
    return `${ouverture}${attendu}${fermeture}`;
  });
  return { html: out, ecarts };
}

// ==========================================
// FAQ JSON-LD générée depuis la FAQ visible
// ==========================================

const ENTITES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘",
  ldquo: "“", rdquo: "”", laquo: "«", raquo: "»", euro: "€", hellip: "…", ndash: "–", mdash: "—",
  eacute: "é", egrave: "è", ecirc: "ê", agrave: "à", acirc: "â", ccedil: "ç", icirc: "î",
  ocirc: "ô", ucirc: "û", ugrave: "ù", Eacute: "É", Icirc: "Î", oelig: "œ",
};

/** Texte lisible d'un fragment HTML (balises retirées, entités décodées, espaces normalisés) */
export function texteVisible(fragment: string): string {
  return fragment
    .replace(/<\/(p|li|div|h[1-6])>|<br\s*\/?>/gi, "\u0001")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_m, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n: string) => ENTITES[n] ?? m)
    .replace(/\s+/g, " ")
    // Fin de bloc (paragraphe, élément de liste) sans ponctuation : on ajoute un point
    .replace(/([^.!?:;\s\u0001])\s*\u0001(?=\s*[^\s\u0001])/g, "$1.\u0001")
    .replace(/\s*\u0001\s*/g, " ")
    .replace(/\s+([.,)])/g, "$1")
    .replace(/\(\s+/g, "(")
    .trim();
}

/** Contenu de l'élément qui s'ouvre à `debut` (gère l'imbrication des balises de même nom) */
function contenuElement(html: string, debut: number): string {
  const ouverture = html.slice(debut).match(/^<([a-z0-9]+)\b[^>]*>/i);
  if (!ouverture) throw new Error("Balise FAQ illisible");
  const tag = ouverture[1].toLowerCase();
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
  re.lastIndex = debut + ouverture[0].length;
  let profondeur = 1;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    profondeur += m[1] ? -1 : 1;
    if (profondeur === 0) return html.slice(debut + ouverture[0].length, m.index);
  }
  throw new Error(`Balise <${tag}> de FAQ non fermée`);
}

/** Questions et réponses visibles d'un groupe, appariées dans l'ordre du document */
export function faqVisible(html: string, groupe: string): { question: string; reponse: string }[] {
  const re = new RegExp(`<[a-z0-9]+\\b[^>]*\\bdata-faq-(q|a)="${groupe}"[^>]*>`, "gi");
  const items: { type: string; texte: string }[] = [];
  for (let m = re.exec(html); m; m = re.exec(html)) {
    items.push({ type: m[1], texte: texteVisible(contenuElement(html, m.index)) });
  }
  const paires: { question: string; reponse: string }[] = [];
  for (let i = 0; i < items.length; i += 2) {
    if (items[i].type !== "q" || items[i + 1]?.type !== "a") {
      throw new Error(`FAQ "${groupe}" : chaque data-faq-q doit être suivi de son data-faq-a`);
    }
    paires.push({ question: items[i].texte, reponse: items[i + 1].texte });
  }
  return paires;
}

const BLOC_FAQ = /(<script\b[^>]*\bdata-faq="([\w-]+)"[^>]*>)([\s\S]*?)(<\/script>)/g;

/** Régénère les blocs FAQ JSON-LD marqués data-faq ; renvoie le HTML et les groupes modifiés */
export function synchroniserFaqJsonLd(html: string): { html: string; ecarts: string[] } {
  const ecarts: string[] = [];
  const out = html.replace(BLOC_FAQ, (tout: string, ouverture: string, groupe: string, contenu: string, fermeture: string) => {
    const paires = faqVisible(html, groupe);
    if (paires.length === 0) throw new Error(`FAQ "${groupe}" : aucune question visible`);
    const avant = html.slice(0, html.indexOf(tout));
    const indent = (avant.match(/[ \t]*$/) || [""])[0];
    const json = JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: paires.map((p) => ({
          "@type": "Question",
          name: p.question,
          acceptedAnswer: { "@type": "Answer", text: p.reponse },
        })),
      },
      null,
      2,
    ).replace(/<\//g, "<\\/");
    const attendu = "\n" + json.split("\n").map((l) => indent + "  " + l).join("\n") + "\n" + indent;
    if (contenu.replace(/\r\n/g, "\n") !== attendu) ecarts.push(groupe);
    return `${ouverture}${attendu}${fermeture}`;
  });
  return { html: out, ecarts };
}
