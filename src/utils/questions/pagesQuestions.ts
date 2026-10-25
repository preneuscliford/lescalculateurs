/**
 * Pages de questions générées depuis src/data/questions-validees.json (section 9.2 et 9.3).
 *
 * Une entrée « valide » = une page indexée, ses liens vers les pages voisines et son entrée de sitemap.
 * Les montants sont écrits sous forme de marqueurs data-exemple : sync-exemples les calcule avec les
 * moteurs au build, et régénère la FAQ JSON-LD depuis la FAQ visible.
 *
 * Utilisé par scripts/generate-pages-questions.cjs (écriture des pages, du sitemap et des redirections)
 * et par le plugin de build (liens depuis le simulateur).
 */
import liste from "../../data/questions-validees.json";
import { calculerAPL } from "../aplCalculEngine";
import { baremes } from "../../data/baremes";

export const SITE = "https://www.lescalculateurs.fr";

export interface Redirection {
  de: string;
  vers: string;
}

export interface EntreeQuestion {
  id: string;
  simulateur: string;
  situation: string;
  enfants: number;
  zone: string | null;
  slug: string;
  titre: string;
  statut: string;
  pagesExistantes?: { garder?: string[]; rediriger301?: Redirection[] };
}

export interface Sommaire {
  simulateur: string;
  slug: string;
  titre: string;
  statut: string;
}

export const QUESTIONS = (liste.questions as EntreeQuestion[]).filter((q) => q.statut === "valide");
export const SOMMAIRES = (liste.sommaires as Sommaire[]).filter((s) => s.statut === "valide");
export const REDIRECTIONS: Redirection[] = QUESTIONS.flatMap((q) => q.pagesExistantes?.rediriger301 ?? []);

export const urlPage = (slug: string) => `${SITE}/pages/${slug}`;
const href = (slug: string) => `/pages/${slug}`;

const echapper = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? "s" : ""}`;

// ---------------------------------------------------------------------------------------------
// APL : situation d'une page
// ---------------------------------------------------------------------------------------------

const ZONES = [
  { code: "zone1", nom: "Zone 1", detail: "Paris et communes proches" },
  { code: "zone2", nom: "Zone 2", detail: "grandes agglomérations" },
  { code: "zone3", nom: "Zone 3", detail: "autres communes" },
] as const;

/** Revenus du tableau : sans revenu, paliers courants et SMIC net */
export const REVENUS_TABLEAU = [0, 1000, 1200, 1400, Math.round(baremes.smic.mensuel_net_35h_estimation), 1600, 2000];

/** Situation du moteur APL : parent isolé et couple ont le même calcul à nombre d'enfants égal */
function situationMoteur(e: EntreeQuestion): "seul" | "couple" | "monoparental" {
  if (e.enfants > 0) return "monoparental";
  return e.situation === "couple" ? "couple" : "seul";
}

/** Libellé court : « une personne seule », « un couple sans enfant », « 2 enfants » */
export function libelleSituation(e: EntreeQuestion): string {
  if (e.enfants === 0) return e.situation === "couple" ? "un couple sans enfant" : "une personne seule";
  return `un foyer avec ${pluriel(e.enfants, "enfant")} (parent isolé ou couple)`;
}

export function libelleCourt(e: EntreeQuestion): string {
  if (e.enfants === 0) return e.situation === "couple" ? "Couple sans enfant" : "Personne seule";
  return `${pluriel(e.enfants, "enfant")}`;
}

/**
 * Loyer des exemples : au-dessus du plafond de la zone (le loyer retenu est le plafond) et sous le
 * seuil de dégressivité, donc dans la plage où le loyer ne change plus l'aide. Recalculé à chaque build.
 */
function loyerExemple(e: EntreeQuestion, zone: string): number {
  const d = calculerAPL({ situation: situationMoteur(e), enfants: e.enfants, revenus_mensuels: 1000, loyer_mensuel: 100, region: zone as "zone1" }).data!;
  return Math.ceil(d.plafond_loyer / 10) * 10 + 50;
}

function paramsApl(e: EntreeQuestion, zone: string, revenus: number, loyer = loyerExemple(e, zone)) {
  return JSON.stringify({ situation: situationMoteur(e), enfants: e.enfants, revenus_mensuels: revenus, loyer_mensuel: loyer, region: zone, type_logement: "location" });
}

/** Marqueur data-exemple (contenu vide : rempli par sync-exemples au build) */
const exemple = (calcul: string, params: string, attributs = "") => `<span data-exemple="${calcul}" data-params='${params}'${attributs}></span>`;
const montant = (e: EntreeQuestion, zone: string, revenus: number) => exemple("apl", paramsApl(e, zone, revenus));
const champ = (e: EntreeQuestion, zone: string, nom: string, decimales = 0) =>
  exemple("apl", paramsApl(e, zone, 1000), ` data-champ="${nom}"${decimales ? ` data-decimales="${decimales}"` : ""}`);
const seuilRevenus = (e: EntreeQuestion, zone: string) =>
  exemple("apl-seuil-revenus", paramsApl(e, zone, 0), ` data-arrondi="10"`);

/** Pages voisines : un enfant de plus ou de moins, personne seule ou couple */
export function voisines(e: EntreeQuestion, toutes = QUESTIONS): EntreeQuestion[] {
  const memeSimulateur = toutes.filter((q) => q.simulateur === e.simulateur && q.id !== e.id);
  return memeSimulateur
    .filter((q) => Math.abs(q.enfants - e.enfants) === 1 || (q.enfants === 0 && e.enfants === 0))
    .sort((a, b) => a.enfants - b.enfants || a.situation.localeCompare(b.situation));
}

function titrePageExistante(slug: string, lireTitre: (slug: string) => string | null): string {
  return lireTitre(slug) ?? slug.split("/").pop()!.replace(/-/g, " ");
}

function filAriane(elements: { nom: string; url: string }[]): { html: string; jsonLd: string } {
  const html = `<nav aria-label="Fil d'Ariane" class="text-sm text-white/80"><ol class="flex flex-wrap gap-1">${elements
    .map((el, i) =>
      i < elements.length - 1
        ? `<li><a class="underline hover:text-white" href="${el.url.replace(SITE, "") || "/"}">${echapper(el.nom)}</a> <span aria-hidden="true">›</span></li>`
        : `<li aria-current="page">${echapper(el.nom)}</li>`,
    )
    .join("")}</ol></nav>`;
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: elements.map((el, i) => ({ "@type": "ListItem", position: i + 1, name: el.nom, item: el.url })),
  });
  return { html, jsonLd };
}

function tete(titre: string, description: string, url: string, jsonLd: string[]): string {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${echapper(titre)}</title>
    <meta name="description" content="${echapper(description)}" />
    <meta name="google-adsense-account" content="ca-pub-2209781252231399" />
    <link rel="canonical" href="${url}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${echapper(titre)}" />
    <meta property="og:description" content="${echapper(description)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />
    <link rel="shortcut icon" href="/assets/favicon.ico" />
    <link rel="stylesheet" href="/tailwind.css" />
${jsonLd.map((j) => `    ${j}`).join("\n")}
    <script defer src="/third-party-loader.js"></script>
    <script type="module" src="/main.ts"></script>
  </head>`;
}

const ENTETE = `    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-14">
          <a href="/" class="flex items-center space-x-2">
            <img src="/assets/lescalculateurs-new-logo.png" alt="LesCalculateurs" class="h-8 w-auto" />
            <span class="font-bold text-gray-900 hidden sm:block">Les Calculateurs</span>
          </a>
          <nav class="flex items-center space-x-4 text-sm">
            <a href="/pages/apl" class="text-gray-600 hover:text-blue-600">Simulateur APL</a>
            <a href="/pages/simulateurs" class="text-gray-600 hover:text-blue-600">Outils</a>
          </nav>
        </div>
      </div>
    </header>`;

const PIED = `    <footer class="bg-gray-800 text-white py-8 mt-12">
      <div class="max-w-4xl mx-auto px-4 text-center text-sm">
        <p class="mb-4">© 2026 Les Calculateurs — Simulateurs gratuits français</p>
        <div class="flex gap-4 text-sm flex-wrap justify-center mb-4">
          <a href="/pages/methodologie" class="text-gray-300 hover:text-white transition-colors">📘 Méthodologie</a>
          <span class="text-gray-500">|</span>
          <a href="/pages/sources" class="text-gray-300 hover:text-white transition-colors">📚 Sources</a>
        </div>
        <p class="text-gray-400">Tous les calculs sont indicatifs.</p>
      </div>
    </footer>`;

const FAQ_VIDE = `<script type="application/ld+json" data-faq="faq">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[]}</script>`;

/** Page d'une situation APL : tableau selon les revenus et la zone, plafonds, FAQ, liens */
export function pageApl(e: EntreeQuestion, lireTitre: (slug: string) => string | null = () => null, toutes = QUESTIONS): string {
  const sommaire = SOMMAIRES.find((s) => s.simulateur === e.simulateur);
  const url = urlPage(e.slug);
  const ariane = filAriane([
    { nom: "Accueil", url: SITE },
    { nom: "APL", url: urlPage("apl") },
    ...(sommaire ? [{ nom: "Toutes les situations", url: urlPage(sommaire.slug) }] : []),
    { nom: libelleCourt(e), url },
  ]);
  const qui = libelleSituation(e);
  const description = `Montant de l'APL 2026 pour ${qui} : tableau selon vos revenus en zone 1, 2 et 3, plafond de loyer et revenus au-delà desquels l'aide s'arrête. Calcul avec le barème officiel.`;
  const [z1, z2, z3] = ZONES.map((z) => z.code);

  const lignes = REVENUS_TABLEAU.map((r) => {
    // Espace insécable visible entre les milliers (l'espace fine de toLocaleString disparaît à l'écran)
    const euros = `${r.toLocaleString("fr-FR").replace(/ /g, " ")} €`;
    const libelle = r === 0 ? "Sans revenu" : r === REVENUS_TABLEAU[4] ? `${euros} (SMIC net)` : euros;
    return `<tr><th scope="row" class="border border-gray-300 px-3 py-2 text-left font-medium text-gray-900">${libelle}</th>${ZONES.map(
      (z) => `<td class="border border-gray-300 px-3 py-2 text-right text-gray-900">${montant(e, z.code, r)} €</td>`,
    ).join("")}</tr>`;
  }).join("\n              ");

  const plafonds = ZONES.map(
    (z) => `<tr><th scope="row" class="border border-gray-300 px-3 py-2 text-left font-medium text-gray-900">${z.nom}<br /><span class="text-xs font-normal text-gray-600">${z.detail}</span></th>
                <td class="border border-gray-300 px-3 py-2 text-right">${champ(e, z.code, "plafond", 2)} €</td>
                <td class="border border-gray-300 px-3 py-2 text-right">${champ(e, z.code, "degressivite")} €</td>
                <td class="border border-gray-300 px-3 py-2 text-right">${champ(e, z.code, "suppression")} €</td></tr>`,
  ).join("\n              ");

  const faq: [string, string][] = [
    [
      `Combien d'APL pour ${qui} en 2026 ?`,
      `Avec 1 000 € de revenus par mois et un loyer au moins égal au plafond, l'APL est d'environ ${montant(e, z1, 1000)} € en zone 1, ${montant(e, z2, 1000)} € en zone 2 et ${montant(e, z3, 1000)} € en zone 3. Le montant baisse quand les revenus augmentent.`,
    ],
    [
      `À partir de quels revenus ${qui} n'a plus droit à l'APL ?`,
      `Avec un loyer au moins égal au plafond, l'aide s'arrête vers ${seuilRevenus(e, z1)} € de revenus par mois en zone 1, ${seuilRevenus(e, z2)} € en zone 2 et ${seuilRevenus(e, z3)} € en zone 3. Avec un loyer plus bas, elle s'arrête plus tôt.`,
    ],
    [
      `Un loyer plus élevé donne-t-il plus d'APL ?`,
      `Non, au-delà du plafond. En zone 2, le loyer retenu est limité à ${champ(e, z2, "plafond", 2)} € : entre ce plafond et ${champ(e, z2, "degressivite")} €, l'aide ne change plus. Au-delà, elle diminue, puis elle est supprimée à partir de ${champ(e, z2, "suppression")} € de loyer.`,
    ],
  ];
  if (e.enfants > 0) {
    faq.push([
      "Un parent isolé touche-t-il plus d'APL qu'un couple ?",
      `Non, à revenus du foyer égaux. Avec ${pluriel(e.enfants, "enfant")}, le plafond de loyer et le calcul sont les mêmes pour un parent isolé et pour un couple. La différence vient des revenus : un couple déclare souvent deux salaires.`,
    ]);
  } else {
    faq.push([
      "Quelle est ma zone APL ?",
      "La zone dépend de la commune du logement : zone 1 pour Paris et les communes proches, zone 2 pour les grandes agglomérations, zone 3 pour les autres communes. Indiquez votre ville dans la barre de calcul ci-dessus : la zone est trouvée automatiquement.",
    ]);
  }

  const liensVoisins = voisines(e, toutes).map((v) => ({ href: href(v.slug), libelle: `APL : ${libelleCourt(v).toLowerCase()}` }));
  const liensExistants = (e.pagesExistantes?.garder ?? []).map((slug) => ({ href: href(slug), libelle: titrePageExistante(slug, lireTitre) }));
  const liens = [
    ...liensVoisins,
    ...(sommaire ? [{ href: href(sommaire.slug), libelle: "APL : toutes les situations" }] : []),
    ...liensExistants,
    { href: "/pages/apl-zones", libelle: "Montant de l'APL par zone" },
    { href: "/pages/apl", libelle: "Simulateur APL complet" },
  ];

  return `${tete(e.titre, description, url, [`<script type="application/ld+json">${ariane.jsonLd}</script>`, FAQ_VIDE])}

  <body class="bg-gray-50">
${ENTETE}

    <section class="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-10">
      <div class="max-w-4xl mx-auto px-4">
        ${ariane.html}
        <h1 class="mt-3 text-3xl sm:text-4xl font-bold">${echapper(e.titre)}</h1>
        <p class="mt-4 text-lg text-blue-50">
          Pour ${qui}, avec 1 000 € de revenus par mois, l'APL est d'environ <strong>${montant(e, z1, 1000)} €</strong> en zone 1,
          <strong>${montant(e, z2, 1000)} €</strong> en zone 2 et <strong>${montant(e, z3, 1000)} €</strong> en zone 3.
        </p>
      </div>
    </section>

    <main class="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Montant de l'APL selon vos revenus</h2>
        <p class="text-gray-700 mb-4">Aide mensuelle pour ${qui}, avec un loyer au moins égal au plafond de la zone. Revenus nets mensuels du foyer.</p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-gray-100"><tr><th scope="col" class="border border-gray-300 px-3 py-2 text-left">Revenus</th>${ZONES.map((z) => `<th scope="col" class="border border-gray-300 px-3 py-2 text-right">${z.nom}</th>`).join("")}</tr></thead>
            <tbody>
              ${lignes}
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-gray-600">Calcul avec le barème officiel en vigueur (formule des articles D. 823-16 et D. 823-17 du code de la construction et de l'habitation). Estimation : seule la CAF fixe le montant.</p>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Le loyer pris en compte</h2>
        <p class="text-gray-700 mb-4">La CAF retient le loyer dans la limite d'un plafond. Entre le plafond et le seuil suivant, un loyer plus élevé ne change plus l'aide ; au-delà, l'aide diminue, puis elle est supprimée.</p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-gray-100"><tr><th scope="col" class="border border-gray-300 px-3 py-2 text-left">Zone</th><th scope="col" class="border border-gray-300 px-3 py-2 text-right">Plafond de loyer</th><th scope="col" class="border border-gray-300 px-3 py-2 text-right">L'aide baisse au-delà de</th><th scope="col" class="border border-gray-300 px-3 py-2 text-right">L'aide est supprimée au-delà de</th></tr></thead>
            <tbody>
              ${plafonds}
            </tbody>
          </table>
        </div>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
        <div class="space-y-5">
${faq.map(([q, a]) => `          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1" data-faq-q="faq">${echapper(q)}</h3>
            <p class="text-gray-700" data-faq-a="faq">${a}</p>
          </div>`).join("\n")}
        </div>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-3">Autres situations</h2>
        <ul class="grid gap-2 sm:grid-cols-2 text-sm">
${liens.map((l) => `          <li><a class="text-blue-700 underline hover:text-blue-900" href="${l.href}">${echapper(l.libelle)}</a></li>`).join("\n")}
        </ul>
      </section>
    </main>

${PIED}
  </body>
</html>
`;
}

/** Sommaire d'une aide : une ligne par situation, montant à 1 000 € de revenus dans chaque zone */
export function sommaireApl(s: Sommaire, toutes = QUESTIONS): string {
  const entrees = toutes.filter((q) => q.simulateur === s.simulateur).sort((a, b) => a.enfants - b.enfants || a.situation.localeCompare(b.situation));
  const url = urlPage(s.slug);
  const ariane = filAriane([
    { nom: "Accueil", url: SITE },
    { nom: "APL", url: urlPage("apl") },
    { nom: "Toutes les situations", url },
  ]);
  const description = "Montant de l'APL 2026 pour chaque situation familiale (personne seule, couple, 1 à 3 enfants) en zone 1, 2 et 3, calculé avec le barème officiel.";
  const lignes = entrees
    .map(
      (e) => `<tr><th scope="row" class="border border-gray-300 px-3 py-2 text-left font-medium"><a class="text-blue-700 underline hover:text-blue-900" href="${href(e.slug)}">${echapper(libelleCourt(e))}</a></th>${ZONES.map(
        (z) => `<td class="border border-gray-300 px-3 py-2 text-right">${montant(e, z.code, 1000)} €</td>`,
      ).join("")}</tr>`,
    )
    .join("\n              ");
  const faq: [string, string][] = [
    [
      "Quelle situation donne le plus d'APL ?",
      "À revenus égaux, l'aide augmente avec le nombre de personnes à charge : le plafond de loyer et l'abattement sur les ressources sont plus élevés. Un parent isolé et un couple avec le même nombre d'enfants ont le même calcul.",
    ],
    [
      "Pourquoi le montant change-t-il selon la zone ?",
      "La zone fixe le plafond de loyer pris en compte. Ce plafond est plus élevé en zone 1 (Paris et communes proches) qu'en zone 2 et en zone 3 : à revenus et situation égaux, l'aide y est donc plus forte.",
    ],
  ];
  return `${tete(s.titre, description, url, [`<script type="application/ld+json">${ariane.jsonLd}</script>`, FAQ_VIDE])}

  <body class="bg-gray-50">
${ENTETE}

    <section class="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-10">
      <div class="max-w-4xl mx-auto px-4">
        ${ariane.html}
        <h1 class="mt-3 text-3xl sm:text-4xl font-bold">${echapper(s.titre)}</h1>
        <p class="mt-4 text-lg text-blue-50">Le montant de l'APL dépend surtout de la composition du foyer, des revenus et de la zone du logement. Choisissez votre situation pour voir le détail selon vos revenus.</p>
      </div>
    </section>

    <main class="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">APL avec 1 000 € de revenus, selon la situation</h2>
        <p class="text-gray-700 mb-4">Aide mensuelle avec un loyer au moins égal au plafond de la zone.</p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-gray-100"><tr><th scope="col" class="border border-gray-300 px-3 py-2 text-left">Situation</th>${ZONES.map((z) => `<th scope="col" class="border border-gray-300 px-3 py-2 text-right">${z.nom}</th>`).join("")}</tr></thead>
            <tbody>
              ${lignes}
            </tbody>
          </table>
        </div>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
        <div class="space-y-5">
${faq.map(([q, a]) => `          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1" data-faq-q="faq">${echapper(q)}</h3>
            <p class="text-gray-700" data-faq-a="faq">${a}</p>
          </div>`).join("\n")}
        </div>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-3">Aller plus loin</h2>
        <ul class="grid gap-2 sm:grid-cols-2 text-sm">
          <li><a class="text-blue-700 underline hover:text-blue-900" href="/pages/apl">Simulateur APL complet</a></li>
          <li><a class="text-blue-700 underline hover:text-blue-900" href="/pages/apl-zones">Montant de l'APL par zone</a></li>
          <li><a class="text-blue-700 underline hover:text-blue-900" href="/pages/apl-etudiant">APL étudiant</a></li>
        </ul>
      </section>
    </main>

${PIED}
  </body>
</html>
`;
}

/** Bloc de liens vers les pages de situations, injecté sur le simulateur (plugin de build) */
export function blocLiensSituations(simulateur: string): string {
  const entrees = QUESTIONS.filter((q) => q.simulateur === simulateur).sort((a, b) => a.enfants - b.enfants || a.situation.localeCompare(b.situation));
  const sommaire = SOMMAIRES.find((s) => s.simulateur === simulateur);
  if (!entrees.length) return "";
  return `<section class="mb-8" aria-labelledby="lc-situations-titre" data-lc-situations><div class="max-w-4xl mx-auto rounded-lg border border-blue-100 bg-white p-5"><h2 id="lc-situations-titre" class="text-lg font-bold text-gray-900 mb-3">Montant selon votre situation</h2><ul class="flex flex-wrap gap-2 text-sm">${entrees
    .map((e) => `<li><a class="inline-block rounded-full bg-blue-50 px-3 py-1 text-blue-800 hover:bg-blue-100" href="${href(e.slug)}">${echapper(libelleCourt(e))}</a></li>`)
    .join("")}${sommaire ? `<li><a class="inline-block rounded-full px-3 py-1 font-semibold text-blue-700 underline" href="${href(sommaire.slug)}">Toutes les situations</a></li>` : ""}</ul></div></section>`;
}

// ---------------------------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------------------------

/**
 * Met à jour le sitemap : une entrée (sans barre oblique finale, comme la canonique) par page générée,
 * suppression des pages redirigées et de toute URL /r/. Les autres entrées sont conservées.
 */
export function majSitemap(xml: string, lastmod: string, pages = [...QUESTIONS.map((q) => q.slug), ...SOMMAIRES.map((s) => s.slug)], redirigees = REDIRECTIONS.map((r) => r.de)): string {
  const nl = xml.includes("\r\n") ? "\r\n" : "\n";
  const loc = (b: string) => /<loc>([^<]*)<\/loc>/.exec(b)?.[1] ?? "";
  const voulues = new Set(pages.map(urlPage));
  const aRetirer = new Set(redirigees.map(urlPage));
  const presentes = new Set<string>();
  // Retire, avec leur ligne, les pages redirigées, les URL /r/ et l'ancienne forme « …/ » des pages générées
  let out = xml.replace(/[ \t]*<url>[\s\S]*?<\/url>[ \t]*\r?\n?/g, (bloc) => {
    const l = loc(bloc);
    const sansBarre = l.replace(/\/$/, "");
    if (aRetirer.has(sansBarre) || l.startsWith(`${SITE}/r/`)) return "";
    if (voulues.has(sansBarre) && l !== sansBarre) return "";
    if (voulues.has(l)) presentes.add(l);
    return bloc;
  });
  const ajouts = pages
    .map(urlPage)
    .filter((u) => !presentes.has(u))
    .map((u) => `  <url>${nl}    <loc>${u}</loc>${nl}    <lastmod>${lastmod}</lastmod>${nl}    <changefreq>monthly</changefreq>${nl}    <priority>0.6</priority>${nl}  </url>${nl}`)
    .join("");
  out = out.replace(/<\/urlset>/, `${ajouts}</urlset>`);
  return out;
}

/** Redirections Vercel des pages remplacées (avec et sans barre oblique finale) */
export function redirectionsVercel(redirections = REDIRECTIONS): { source: string; destination: string; permanent: true }[] {
  return redirections.flatMap((r) => [
    { source: `/pages/${r.de}`, destination: `/pages/${r.vers}`, permanent: true as const },
    { source: `/pages/${r.de}/`, destination: `/pages/${r.vers}`, permanent: true as const },
  ]);
}
