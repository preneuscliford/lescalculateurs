/**
 * Pages « frais de notaire » par département, générées depuis src/data/notaire-departements-pages.json,
 * et page globale « frais de notaire par département ».
 *
 * Contenu local (histoire, particularité, question propre au lieu, image libre de droits) rédigé à partir
 * des sources citées dans la liste ; tous les montants sont des marqueurs data-exemple calculés par le
 * moteur notaire au build (sync-exemples), et la FAQ JSON-LD est régénérée depuis la FAQ visible.
 */
import liste from "../../data/notaire-departements-pages.json";
import { calculerNotaire } from "../notaireCalculEngine";
import { DEPARTEMENTS } from "./definitions/logement";
import { FAQ_VIDE, PIED, SITE, echapper, entete, filAriane, tete, urlPage } from "./pagesQuestions";

export interface ImagePage {
  fichier: string;
  largeur: number;
  hauteur: number;
  alt: string;
  auteur: string;
  licence: string;
  licenceUrl: string;
  source: string;
}

export interface PageNotaire {
  code: string;
  /** Code transmis au moteur (2A pour la page Corse) */
  codeMoteur: string;
  departement: string;
  /** « dans le Morbihan », « à Paris », « en Gironde » */
  dans: string;
  ville: string;
  aVille: string;
  slug: string;
  statut: string;
  histoire: string;
  particularite: string;
  faqLocale: { q: string; a: string };
  voisins: string[];
  image: ImagePage;
  sources: { libelle: string; url: string }[];
  /** Pages remplacées, redirigées vers celle-ci */
  remplace?: string[];
}

export const PAGES_NOTAIRE = (liste.pages as PageNotaire[]).filter((p) => p.statut === "valide");
export const SLUG_PAGE_GLOBALE = "blog/frais-notaire-departements";
export const REDIRECTIONS_NOTAIRE = PAGES_NOTAIRE.flatMap((p) => (p.remplace ?? []).map((de) => ({ de, vers: p.slug })));

const PRIX = [100000, 150000, 200000, 250000, 300000, 400000, 500000];
const nomDepartement = (code: string) => DEPARTEMENTS.find((d) => d.valeur === code)?.libelle.split(" – ")[1] ?? code;
const slugDepartement = (code: string) => `blog/departements/frais-notaire-${code}`;

/** Le département a relevé ses droits de mutation : le premier achat de résidence principale y coûte moins */
export function tauxReleve(code: string): boolean {
  const ancien = calculerNotaire({ prixAchat: 200000, typeBien: "ancien", departement: code });
  const primo = calculerNotaire({ prixAchat: 200000, typeBien: "ancien", departement: code, primoAccedant: true });
  return primo.total < ancien.total;
}

type Cas = "ancien" | "neuf" | "primo";
const params = (code: string, prix: number, cas: Cas) =>
  JSON.stringify({ prixAchat: prix, typeBien: cas === "neuf" ? "neuf" : "ancien", departement: code, ...(cas === "primo" ? { primoAccedant: true } : {}) });
const frais = (code: string, prix: number, cas: Cas, champ = "total") =>
  `<span data-exemple="notaire" data-params='${params(code, prix, cas)}'${champ !== "total" ? ` data-champ="${champ}"` : ""}></span>`;
const taux = (code: string, cas: Cas = "ancien") => `<span data-exemple="notaire-taux" data-params='${params(code, 200000, cas)}'></span>`;

/** « {notaire:250000:primo} » dans un texte de la liste → montant calculé par le moteur */
function avecMontants(texte: string, code: string): string {
  return echapper(texte).replace(/\{notaire:(\d+):(ancien|neuf|primo)\}/g, (_, prix, cas) => frais(code, Number(prix), cas as Cas));
}

const euros = (n: number) => `${n.toLocaleString("fr-FR").replace(/ /g, " ")} €`;

type Lien = { href: string; libelle: string };

/** Départements voisins qui ont une page, et d'autres pages du lot pour compléter (présentées à part) */
function liensProches(p: PageNotaire, existe: (slug: string) => boolean): { voisins: Lien[]; autres: Lien[] } {
  const voisins = p.voisins.filter((c) => existe(slugDepartement(c))).map((c) => ({ href: `/pages/${slugDepartement(c)}`, libelle: `${nomDepartement(c)} (${c})` }));
  const autres = PAGES_NOTAIRE.filter((x) => x.code !== p.code && !p.voisins.includes(x.code))
    .slice(0, Math.max(2, 4 - voisins.length))
    .map((x) => ({ href: `/pages/${x.slug}`, libelle: `Frais de notaire ${x.aVille}` }));
  return { voisins, autres };
}

const listeLiens = (liens: Lien[]) =>
  liens.map((l) => `          <li><a class="text-blue-700 underline hover:text-blue-900" href="${l.href}">${echapper(l.libelle)}</a></li>`).join("\n");

export function pageNotaire(p: PageNotaire, existe: (slug: string) => boolean): string {
  const c = p.codeMoteur;
  const url = urlPage(p.slug);
  // « à Paris » : le département et la ville se confondent
  const titre = p.dans === p.aVille ? `Frais de notaire ${p.dans} en 2026` : `Frais de notaire ${p.dans} en 2026 : ${p.aVille}`;
  const ariane = filAriane([
    { nom: "Accueil", url: SITE },
    { nom: "Frais de notaire", url: urlPage("notaire") },
    { nom: "Par département", url: urlPage(SLUG_PAGE_GLOBALE) },
    { nom: p.code === "corse" ? "Corse" : `${p.departement} (${p.code})`, url },
  ]);
  const releve = tauxReleve(c);
  const description = `Frais de notaire ${p.dans} en 2026 : montants calculés pour l'ancien, le neuf${releve ? " et le premier achat" : ""}, taux des droits de mutation, et ce qui distingue ${p.ville}.`;
  const colonnes: Cas[] = releve ? ["ancien", "primo", "neuf"] : ["ancien", "neuf"];
  const nomsColonnes: Record<Cas, string> = { ancien: "Ancien", primo: "Ancien, premier achat", neuf: "Neuf" };
  const lignes = PRIX.map(
    (prix) => `<tr><th scope="row" class="border border-gray-300 px-3 py-2 text-left font-medium">${euros(prix)}</th>${colonnes
      .map((cas) => `<td class="border border-gray-300 px-3 py-2 text-right">${frais(c, prix, cas)} €</td>`)
      .join("")}</tr>`,
  ).join("\n              ");
  const detail = [
    ["Droits de mutation (impôts)", "droitsEnregistrement"],
    ["Émoluments du notaire", "emoluments"],
    ["TVA sur les émoluments et formalités", "tva"],
    ["Débours (estimation)", "debours"],
    ["Formalités (estimation)", "formalites"],
    ["Contribution de sécurité immobilière", "csi"],
  ]
    .map(([libelle, champ]) => `<tr><th scope="row" class="border border-gray-300 px-3 py-2 text-left font-medium">${libelle}</th><td class="border border-gray-300 px-3 py-2 text-right">${frais(c, 250000, "ancien", champ)} €</td></tr>`)
    .join("\n              ");

  const faq: [string, string][] = [
    [
      `Combien de frais de notaire pour un achat ancien ${p.dans} ?`,
      `Pour un logement ancien à 200 000 €, les frais de notaire sont d'environ ${frais(c, 200000, "ancien")} € ${p.dans}, et d'environ ${frais(c, 300000, "ancien")} € pour un bien à 300 000 €. La plus grande partie correspond aux droits de mutation, un impôt reversé au département et à la commune.`,
    ],
    [
      `Quel est le taux des droits de mutation ${p.dans} en 2026 ?`,
      releve
        ? `Les droits de mutation sont de ${taux(c)} du prix dans l'ancien. Pour un premier achat de résidence principale, la hausse votée en 2025 ne s'applique pas : le taux est de ${taux(c, "primo")}. Dans le neuf, il tombe à ${taux(c, "neuf")}.`
        : `Les droits de mutation sont de ${taux(c)} du prix dans l'ancien : le département n'a pas voté la hausse autorisée depuis 2025. Dans le neuf, ils tombent à ${taux(c, "neuf")}.`,
    ],
    [echapper(p.faqLocale.q), avecMontants(p.faqLocale.a, c)],
  ];

  const liens = liensProches(p, existe);
  return `${tete(titre, description, url, [`<script type="application/ld+json">${ariane.jsonLd}</script>`, FAQ_VIDE])}

  <body class="bg-gray-50">
${entete("/pages/notaire", "Simulateur frais de notaire")}

    <section class="bg-gradient-to-r from-emerald-700 to-teal-800 text-white py-10">
      <div class="max-w-4xl mx-auto px-4">
        ${ariane.html}
        <h1 class="mt-3 text-3xl sm:text-4xl font-bold">${echapper(titre)}</h1>
        <p class="mt-4 text-lg text-emerald-50">
          Pour un logement ancien à 200 000 € ${echapper(p.dans)}, les frais de notaire sont d'environ <strong>${frais(c, 200000, "ancien")} €</strong>${
            releve ? ` (<strong>${frais(c, 200000, "primo")} €</strong> pour un premier achat de résidence principale)` : ""
          }, et d'environ <strong>${frais(c, 200000, "neuf")} €</strong> dans le neuf.
        </p>
      </div>
    </section>

    <main class="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <section class="bg-white rounded-lg shadow overflow-hidden">
        <figure>
          <img src="${p.image.fichier}" width="${p.image.largeur}" height="${p.image.hauteur}" alt="${echapper(p.image.alt)}" class="w-full h-auto" fetchpriority="high" />
          <figcaption class="px-4 py-2 text-xs text-gray-600">${echapper(p.image.alt)}. Photo : ${echapper(p.image.auteur)}, <a class="underline" href="${p.image.licenceUrl || p.image.source}" rel="license noopener" target="_blank">${echapper(p.image.licence)}</a>, via <a class="underline" href="${p.image.source}" rel="noopener" target="_blank">Wikimedia Commons</a>.</figcaption>
        </figure>
        <div class="p-6 space-y-4">
          <h2 class="text-2xl font-bold text-gray-900">${echapper(p.ville)} en bref</h2>
          <p class="text-gray-700">${echapper(p.histoire)}</p>
          <h2 class="text-xl font-bold text-gray-900">Ce qui compte pour un achat ${echapper(p.dans)}</h2>
          <p class="text-gray-700">${echapper(p.particularite)}</p>
        </div>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Frais de notaire selon le prix ${echapper(p.dans)}</h2>
        <p class="text-gray-700 mb-4">Montants calculés avec le barème des émoluments et le taux des droits de mutation du département, hors prêt et hors mobilier.</p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-gray-100"><tr><th scope="col" class="border border-gray-300 px-3 py-2 text-left">Prix</th>${colonnes
              .map((cas) => `<th scope="col" class="border border-gray-300 px-3 py-2 text-right">${nomsColonnes[cas]}</th>`)
              .join("")}</tr></thead>
            <tbody>
              ${lignes}
            </tbody>
          </table>
        </div>
        <h3 class="mt-6 text-lg font-semibold text-gray-900">Détail pour un achat ancien à 250 000 €</h3>
        <div class="overflow-x-auto mt-2">
          <table class="w-full border-collapse text-sm">
            <tbody>
              ${detail}
              <tr class="bg-gray-50"><th scope="row" class="border border-gray-300 px-3 py-2 text-left font-bold">Total</th><td class="border border-gray-300 px-3 py-2 text-right font-bold">${frais(c, 250000, "ancien")} €</td></tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-gray-600">Estimation : le montant définitif figure dans le décompte du notaire. Débours et formalités : ordre de grandeur national.</p>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
        <div class="space-y-5">
${faq.map(([q, a]) => `          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1" data-faq-q="faq">${q}</h3>
            <p class="text-gray-700" data-faq-a="faq">${a}</p>
          </div>`).join("\n")}
        </div>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
${
  liens.voisins.length
    ? `        <h2 class="text-xl font-bold text-gray-900 mb-3">Frais de notaire dans les départements voisins</h2>
        <ul class="grid gap-2 sm:grid-cols-2 text-sm mb-5">
${listeLiens(liens.voisins)}
        </ul>
`
    : ""
}        <h2 class="text-xl font-bold text-gray-900 mb-3">Frais de notaire dans d'autres villes</h2>
        <ul class="grid gap-2 sm:grid-cols-2 text-sm">
${listeLiens(liens.autres)}
          <li><a class="text-blue-700 underline hover:text-blue-900" href="/pages/${SLUG_PAGE_GLOBALE}">Frais de notaire dans tous les départements</a></li>
          <li><a class="text-blue-700 underline hover:text-blue-900" href="/pages/notaire">Simulateur frais de notaire complet</a></li>
        </ul>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-3">Sources de cette page</h2>
        <ul class="list-disc pl-5 space-y-1 text-sm">
${p.sources.map((s) => `          <li><a class="text-blue-700 underline hover:text-blue-900" href="${s.url}" rel="noopener" target="_blank">${echapper(s.libelle)}</a></li>`).join("\n")}
        </ul>
      </section>
    </main>

${PIED}
  </body>
</html>
`;
}

/** Page globale : tous les départements, taux des droits de mutation et frais pour 200 000 € */
export function pageGlobaleNotaire(existe: (slug: string) => boolean): string {
  const url = urlPage(SLUG_PAGE_GLOBALE);
  const titre = "Frais de notaire 2026 par département : taux et montants";
  const ariane = filAriane([
    { nom: "Accueil", url: SITE },
    { nom: "Frais de notaire", url: urlPage("notaire") },
    { nom: "Par département", url },
  ]);
  const description = "Frais de notaire 2026 dans chaque département : taux des droits de mutation et montant calculé pour un achat ancien ou neuf à 200 000 €.";
  const pageDe = (code: string) => {
    const generee = PAGES_NOTAIRE.find((p) => p.codeMoteur === code || p.code === code);
    if (generee) return `/pages/${generee.slug}`;
    return existe(slugDepartement(code)) ? `/pages/${slugDepartement(code)}` : null;
  };
  const nonReleves = DEPARTEMENTS.filter((d) => !tauxReleve(d.valeur)).map((d) => d.libelle.split(" – ")[1]);
  const lignes = DEPARTEMENTS.map((d) => {
    const lien = pageDe(d.valeur);
    const nom = d.libelle.split(" – ")[1];
    return `<tr><td class="border border-gray-300 px-2 py-1.5">${d.valeur}</td><th scope="row" class="border border-gray-300 px-2 py-1.5 text-left font-medium">${
      lien ? `<a class="text-blue-700 underline hover:text-blue-900" href="${lien}">${echapper(nom)}</a>` : echapper(nom)
    }</th><td class="border border-gray-300 px-2 py-1.5 text-right">${taux(d.valeur)}</td><td class="border border-gray-300 px-2 py-1.5 text-right">${frais(d.valeur, 200000, "ancien")} €</td><td class="border border-gray-300 px-2 py-1.5 text-right">${frais(d.valeur, 200000, "neuf")} €</td></tr>`;
  }).join("\n              ");
  const faq: [string, string][] = [
    [
      "Pourquoi les frais de notaire changent-ils selon le département ?",
      "Les émoluments du notaire sont fixés par l'État et identiques partout. Ce qui change, ce sont les droits de mutation, un impôt dont le département vote le taux. Depuis avril 2025, la plupart des départements ont relevé leur part, ce qui porte le total à 6,32 % du prix dans l'ancien.",
    ],
    [
      "Quels départements n'ont pas augmenté les droits de mutation ?",
      `Dans ces départements, les droits restent sous 6,32 % dans l'ancien : ${echapper(nonReleves.join(", "))}.`,
    ],
    [
      "Quel pourcentage du prix représentent les frais de notaire ?",
      `Dans l'ancien, environ 7 à 8 % du prix : ${frais("75", 200000, "ancien")} € pour 200 000 € dans un département au taux de 6,32 %. Dans le neuf, environ 2 à 3 % : ${frais("75", 200000, "neuf")} € pour le même prix.`,
    ],
  ];
  return `${tete(titre, description, url, [`<script type="application/ld+json">${ariane.jsonLd}</script>`, FAQ_VIDE])}

  <body class="bg-gray-50">
${entete("/pages/notaire", "Simulateur frais de notaire")}

    <section class="bg-gradient-to-r from-emerald-700 to-teal-800 text-white py-10">
      <div class="max-w-4xl mx-auto px-4">
        ${ariane.html}
        <h1 class="mt-3 text-3xl sm:text-4xl font-bold">${echapper(titre)}</h1>
        <p class="mt-4 text-lg text-emerald-50">Le taux des droits de mutation et les frais de notaire pour un achat à 200 000 €, dans chacun des ${DEPARTEMENTS.length} départements, calculés avec le barème en vigueur.</p>
      </div>
    </section>

    <main class="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-3">Guides par département</h2>
        <ul class="flex flex-wrap gap-2 text-sm">
${PAGES_NOTAIRE.map((p) => `          <li><a class="inline-block rounded-full bg-emerald-50 px-3 py-1 text-emerald-800 hover:bg-emerald-100" href="/pages/${p.slug}">${echapper(p.code === "corse" ? "Corse" : `${p.ville} (${p.code})`)}</a></li>`).join("\n")}
        </ul>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Tous les départements</h2>
        <p class="text-gray-700 mb-4">Frais de notaire pour un achat à 200 000 €, hors prêt et hors mobilier.</p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-gray-100"><tr><th scope="col" class="border border-gray-300 px-2 py-2 text-left">Code</th><th scope="col" class="border border-gray-300 px-2 py-2 text-left">Département</th><th scope="col" class="border border-gray-300 px-2 py-2 text-right">Droits de mutation</th><th scope="col" class="border border-gray-300 px-2 py-2 text-right">Ancien</th><th scope="col" class="border border-gray-300 px-2 py-2 text-right">Neuf</th></tr></thead>
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
    </main>

${PIED}
  </body>
</html>
`;
}

/** Chemins (relatifs à src/pages) des pages générées, pour le sitemap */
export const SLUGS_NOTAIRE = [...PAGES_NOTAIRE.map((p) => p.slug), SLUG_PAGE_GLOBALE];
