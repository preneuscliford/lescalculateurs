/**
 * Pages « combien touche une mère célibataire avec N enfants », générées depuis
 * src/data/aides-foyer-pages.json par scripts/generate-pages-questions.cjs.
 *
 * Tous les montants sont des marqueurs data-exemple « aides-foyer » (moteur
 * src/utils/aidesFoyerCalculEngine.ts), recalculés à chaque build ; la meta description, où un
 * <span> n'a pas sa place, est calculée ici avec le même moteur.
 */
import liste from "../../data/aides-foyer-pages.json";
import { calculerAidesFoyer, type AidesFoyerData, type AidesFoyerResult } from "../aidesFoyerCalculEngine";
import { calculerAPL } from "../aplCalculEngine";
import { baremes } from "../../data/baremes";
import { socialBaremes } from "../../data/social-baremes";
import { FAQ_VIDE, PIED, SITE, echapper, entete, filAriane, tete, urlPage } from "./pagesQuestions";

export interface PageAidesFoyer {
  id: string;
  situation: "parent-isole";
  enfants: number;
  slug: string;
  titre: string;
  statut: string;
}

export const PAGES_AIDES_FOYER = (liste.pages as PageAidesFoyer[]).filter((p) => p.statut === "valide");
export const SOMMAIRE_AIDES_FOYER = liste.sommaire;
/** Date de la dernière modification du contenu (lastmod du sitemap) */
export const MISE_A_JOUR_AIDES_FOYER: string = liste.miseAJour;
export const SLUGS_AIDES_FOYER = [...PAGES_AIDES_FOYER.map((p) => p.slug), ...(SOMMAIRE_AIDES_FOYER.statut === "valide" ? [SOMMAIRE_AIDES_FOYER.slug] : [])];

const ZONE = "zone2" as const;
const SMIC = Math.round(baremes.smic.mensuel_net_35h_estimation);
/** Salaires du tableau : sans emploi, temps partiel, 1 000 €, SMIC net, 2 000 € */
export const SALAIRES = [0, 700, 1000, SMIC, 2000];

const href = (slug: string) => `/pages/${slug}`;
const euros = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/ /g, " ")} €`;
const salaireTexte = (s: number) => (s === 0 ? "Sans emploi" : s === SMIC ? `${euros(s)} (SMIC net)` : euros(s));
const enfantsTexte = (n: number) => `${n} enfant${n > 1 ? "s" : ""}`;

/** Loyer des exemples : au-dessus du plafond APL de la zone 2 (le loyer retenu est le plafond) */
export function loyerExemple(enfants: number): number {
  const d = calculerAPL({ situation: "monoparental", enfants, revenus_mensuels: 1000, loyer_mensuel: 100, region: ZONE }).data!;
  return Math.ceil(d.plafond_loyer / 10) * 10 + 50;
}

function donnees(p: PageAidesFoyer, salaire: number, majorationIsolement = false): AidesFoyerData {
  return { situation: p.situation, enfants: p.enfants, salaire, zone: ZONE, loyer: loyerExemple(p.enfants), ...(majorationIsolement ? { majorationIsolement } : {}) };
}

/** Marqueur data-exemple, rempli par sync-exemples au build */
function montant(p: PageAidesFoyer, salaire: number, champ: keyof AidesFoyerResult, majorationIsolement = false): string {
  return `<span data-exemple="aides-foyer" data-params='${JSON.stringify(donnees(p, salaire, majorationIsolement))}' data-champ="${champ}"></span>`;
}
const calcul = (p: PageAidesFoyer, salaire: number, majorationIsolement = false) => calculerAidesFoyer(donnees(p, salaire, majorationIsolement));

const TD = "border border-gray-300 px-3 py-2 text-right text-gray-900 whitespace-nowrap";
const TH = "border border-gray-300 px-3 py-2";

export function pageAidesFoyer(p: PageAidesFoyer, toutes = PAGES_AIDES_FOYER): string {
  const url = urlPage(p.slug);
  const sommaire = SOMMAIRE_AIDES_FOYER;
  const ariane = filAriane([
    { nom: "Accueil", url: SITE },
    { nom: "Mère célibataire : les aides", url: urlPage(sommaire.slug) },
    { nom: enfantsTexte(p.enfants), url },
  ]);
  const n = enfantsTexte(p.enfants);
  const zero = calcul(p, 0);
  const smic = calcul(p, SMIC);
  const description = `Mère ou père célibataire avec ${n} en 2026 : ${euros(zero.aides)} d'aides par mois sans emploi, ${euros(smic.total)} au total au SMIC (RSA, prime d'activité, APL, ASF${p.enfants >= 2 ? ", allocations familiales" : ""}). Tableau selon votre salaire.`;

  const colonnes: [keyof AidesFoyerResult, string][] = [
    ["rsa", "RSA"],
    ["prime", "Prime d'activité"],
    ["apl", "APL"],
    ["asf", "ASF"],
    ...(p.enfants >= 2 ? ([["allocationsFamiliales", "Allocations familiales"]] as [keyof AidesFoyerResult, string][]) : []),
    ["aides", "Total des aides"],
    ["total", "Revenu total"],
  ];
  const lignes = SALAIRES.map(
    (s) =>
      `<tr><th scope="row" class="${TH} text-left font-medium text-gray-900 whitespace-nowrap">${salaireTexte(s)}</th>${colonnes
        .map(([c]) => `<td class="${TD}${c === "aides" || c === "total" ? " font-semibold" : ""}">${montant(p, s, c)} €</td>`)
        .join("")}</tr>`,
  ).join("\n              ");

  const lignesMajorees = [0, SMIC]
    .map(
      (s) =>
        `<tr><th scope="row" class="${TH} text-left font-medium text-gray-900">${salaireTexte(s)}</th><td class="${TD}">${montant(p, s, "aides")} €</td><td class="${TD} font-semibold">${montant(p, s, "aides", true)} €</td></tr>`,
    )
    .join("\n              ");

  const loyer = loyerExemple(p.enfants);
  const faq: [string, string][] = [
    [
      `Combien touche une mère célibataire avec ${n} sans emploi ?`,
      `Sans revenu, elle touche environ ${montant(p, 0, "aides")} € d'aides par mois : ${montant(p, 0, "rsa")} € de RSA, ${montant(p, 0, "apl")} € d'APL et ${montant(p, 0, "asf")} € d'ASF${p.enfants >= 2 ? `, plus ${montant(p, 0, "allocationsFamiliales")} € d'allocations familiales` : ""}. Calcul pour un loyer de ${euros(loyer)} en zone 2, sans pension alimentaire.`,
    ],
    [
      `Et au SMIC ?`,
      `Avec ${euros(SMIC)} de salaire net, le RSA s'arrête mais la prime d'activité prend le relais : ${montant(p, SMIC, "prime")} € de prime, ${montant(p, SMIC, "apl")} € d'APL et ${montant(p, SMIC, "asf")} € d'ASF${p.enfants >= 2 ? `, plus ${montant(p, SMIC, "allocationsFamiliales")} € d'allocations familiales` : ""}, soit un revenu total d'environ ${montant(p, SMIC, "total")} € par mois.`,
    ],
    [
      "L'ASF est-elle déduite du RSA ?",
      `En partie seulement. L'ASF est versée en entier (${euros(socialBaremes.asf.montantParEnfant)} par enfant quand l'autre parent ne verse pas de pension), mais seule une part de ${euros(socialBaremes.asf.partRessourcesRsaPrime * socialBaremes.bmaf.montant)} par enfant est comptée dans les ressources du RSA et de la prime d'activité.`,
    ],
    [
      "Qu'est-ce que la majoration pour isolement ?",
      `Pendant 12 mois après la séparation (dans les 18 mois qui suivent), ou jusqu'aux 3 ans du plus jeune enfant, le RSA et la prime d'activité sont majorés. Sans revenu, les aides passent alors d'environ ${montant(p, 0, "aides")} € à ${montant(p, 0, "aides", true)} € par mois.`,
    ],
  ];
  if (p.enfants >= 3) {
    faq.push([
      "Le complément familial est-il compris ?",
      "Non. Le complément familial (à partir de 3 enfants de 3 ans ou plus, sous condition de ressources) s'ajoute aux montants de cette page. Vérifiez votre droit sur caf.fr.",
    ]);
  }

  const autres = toutes.filter((x) => x.id !== p.id).sort((a, b) => a.enfants - b.enfants);
  const liens = [
    ...autres.map((x) => ({ href: href(x.slug), libelle: `Mère célibataire avec ${enfantsTexte(x.enfants)}` })),
    { href: href(sommaire.slug), libelle: "Toutes les situations" },
    { href: "/pages/rsa", libelle: "Simulateur RSA" },
    { href: "/pages/prime-activite", libelle: "Simulateur prime d'activité" },
    { href: "/pages/apl", libelle: "Simulateur APL" },
    { href: "/pages/asf", libelle: "Simulateur ASF" },
    { href: "/pages/simulateurs/quelle-aide-selon-mon-profil-2026", libelle: "Toutes vos aides selon votre profil" },
  ];

  return `${tete(p.titre, description, url, [`<script type="application/ld+json">${ariane.jsonLd}</script>`, FAQ_VIDE])}

  <body class="bg-gray-50">
${entete("/pages/simulateurs/quelle-aide-selon-mon-profil-2026", "Simulateur toutes aides")}

    <section class="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-10">
      <div class="max-w-4xl mx-auto px-4">
        ${ariane.html}
        <h1 class="mt-3 text-3xl sm:text-4xl font-bold">${echapper(p.titre)}</h1>
        <p class="mt-4 text-lg text-blue-50">
          Une mère (ou un père) seule avec ${n} touche environ <strong>${montant(p, 0, "aides")} € d'aides par mois sans emploi</strong>.
          Au SMIC, les aides restent de <strong>${montant(p, SMIC, "aides")} €</strong>, pour un revenu total d'environ <strong>${montant(p, SMIC, "total")} €</strong> par mois.
        </p>
      </div>
    </section>

    <main class="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Les aides selon votre salaire</h2>
        <p class="text-gray-700 mb-4">Montants mensuels pour un parent isolé avec ${n}, locataire en zone 2 (grandes agglomérations) avec un loyer de ${euros(loyer)}, sans pension alimentaire.</p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-gray-100"><tr><th scope="col" class="${TH} text-left">Salaire net</th>${colonnes.map(([, l]) => `<th scope="col" class="${TH} text-right">${l}</th>`).join("")}</tr></thead>
            <tbody>
              ${lignes}
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-gray-600">Barèmes au 1er avril 2026 (RSA, prime d'activité, ASF, allocations familiales) et au 1er octobre 2026 (APL). Estimation : seule la CAF fixe les montants.</p>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Comment les aides se combinent</h2>
        <ul class="list-disc pl-5 space-y-2 text-gray-700">
          <li><strong>RSA</strong> : il complète vos ressources jusqu'au montant forfaitaire. Le salaire, les allocations familiales et une part de l'ASF sont déduits, ainsi qu'un forfait logement quand vous touchez l'APL.</li>
          <li><strong>Prime d'activité</strong> : dès que vous travaillez. Elle se cumule avec le RSA tant que celui-ci est versé, puis prend le relais.</li>
          <li><strong>APL</strong> : calculée sur vos revenus d'activité ; ni le RSA ni les prestations familiales n'y entrent.</li>
          <li><strong>ASF</strong> : ${euros(socialBaremes.asf.montantParEnfant)} par enfant quand l'autre parent ne verse pas de pension alimentaire (ou verse moins que ce montant), sans condition de ressources.</li>
          ${p.enfants >= 2 ? `<li><strong>Allocations familiales</strong> : à partir de 2 enfants, au taux plein pour ces revenus (sans la majoration pour les enfants de 14 ans et plus).</li>` : `<li><strong>Allocations familiales</strong> : elles ne sont versées qu'à partir de 2 enfants.</li>`}
        </ul>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Avec la majoration pour isolement</h2>
        <p class="text-gray-700 mb-4">Pendant 12 mois après la séparation, ou jusqu'aux 3 ans du plus jeune enfant, le RSA et la prime d'activité sont majorés.</p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-gray-100"><tr><th scope="col" class="${TH} text-left">Salaire net</th><th scope="col" class="${TH} text-right">Aides sans majoration</th><th scope="col" class="${TH} text-right">Aides avec majoration</th></tr></thead>
            <tbody>
              ${lignesMajorees}
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
        <h2 class="text-xl font-bold text-gray-900 mb-3">Ce qui n'est pas compté</h2>
        <p class="text-gray-700">Le complément familial, la majoration des allocations familiales pour les enfants de 14 ans et plus, l'allocation de rentrée scolaire et une éventuelle pension alimentaire. Une pension alimentaire réduit ou supprime l'ASF et compte dans les ressources du RSA.</p>
        <p class="mt-3 text-sm text-gray-600">Sources : barèmes CAF et service-public.fr au 1er avril 2026 ; DREES, <em>Minima sociaux et prestations sociales</em>, édition 2025, fiche 9 (ressources prises en compte) ; code de l'action sociale et des familles, articles R262-1, R262-9 et R262-10.</p>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-3">Autres situations et simulateurs</h2>
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

/** Page sommaire : une ligne par nombre d'enfants */
export function sommaireAidesFoyer(toutes = PAGES_AIDES_FOYER): string {
  const s = SOMMAIRE_AIDES_FOYER;
  const url = urlPage(s.slug);
  const ariane = filAriane([
    { nom: "Accueil", url: SITE },
    { nom: "Mère célibataire : les aides", url },
  ]);
  const pages = [...toutes].sort((a, b) => a.enfants - b.enfants);
  const premiere = pages[0];
  const derniere = pages[pages.length - 1];
  const description = `Aides d'une mère célibataire en 2026 selon le nombre d'enfants : de ${euros(calcul(premiere, 0).aides)} (1 enfant) à ${euros(calcul(derniere, 0).aides)} (${enfantsTexte(derniere.enfants)}) par mois sans emploi. RSA, prime d'activité, APL, ASF et allocations familiales.`;
  const lignes = pages
    .map(
      (p) =>
        `<tr><th scope="row" class="${TH} text-left font-medium"><a class="text-blue-700 underline hover:text-blue-900" href="${href(p.slug)}">${enfantsTexte(p.enfants)}</a></th><td class="${TD}">${montant(p, 0, "aides")} €</td><td class="${TD}">${montant(p, SMIC, "aides")} €</td><td class="${TD} font-semibold">${montant(p, SMIC, "total")} €</td></tr>`,
    )
    .join("\n              ");
  const faq: [string, string][] = [
    [
      "Quelles aides pour une mère célibataire ?",
      "Le RSA (majoré les premiers mois), la prime d'activité dès qu'elle travaille, l'aide au logement (APL), l'allocation de soutien familial (ASF) si l'autre parent ne verse pas de pension, et les allocations familiales à partir de 2 enfants.",
    ],
    [
      "Les montants valent-ils aussi pour un père seul ?",
      "Oui. Les règles sont les mêmes pour une mère ou un père qui élève seul ses enfants.",
    ],
  ];
  return `${tete(s.titre, description, url, [`<script type="application/ld+json">${ariane.jsonLd}</script>`, FAQ_VIDE])}

  <body class="bg-gray-50">
${entete("/pages/simulateurs/quelle-aide-selon-mon-profil-2026", "Simulateur toutes aides")}

    <section class="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-10">
      <div class="max-w-4xl mx-auto px-4">
        ${ariane.html}
        <h1 class="mt-3 text-3xl sm:text-4xl font-bold">${echapper(s.titre)}</h1>
        <p class="mt-4 text-lg text-blue-50">Total des aides d'un parent isolé, mère ou père, selon le nombre d'enfants et le salaire. Choisissez votre situation pour voir le détail aide par aide.</p>
      </div>
    </section>

    <main class="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Les aides selon le nombre d'enfants</h2>
        <p class="text-gray-700 mb-4">Montants mensuels, locataire en zone 2 avec un loyer au moins égal au plafond APL, sans pension alimentaire ni majoration pour isolement.</p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-gray-100"><tr><th scope="col" class="${TH} text-left">Enfants</th><th scope="col" class="${TH} text-right">Aides sans emploi</th><th scope="col" class="${TH} text-right">Aides au SMIC</th><th scope="col" class="${TH} text-right">Revenu total au SMIC</th></tr></thead>
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
        <h2 class="text-xl font-bold text-gray-900 mb-3">Simulateurs</h2>
        <ul class="grid gap-2 sm:grid-cols-2 text-sm">
          <li><a class="text-blue-700 underline hover:text-blue-900" href="/pages/simulateurs/quelle-aide-selon-mon-profil-2026">Toutes vos aides selon votre profil</a></li>
          <li><a class="text-blue-700 underline hover:text-blue-900" href="/pages/rsa">Simulateur RSA</a></li>
          <li><a class="text-blue-700 underline hover:text-blue-900" href="/pages/prime-activite">Simulateur prime d'activité</a></li>
          <li><a class="text-blue-700 underline hover:text-blue-900" href="/pages/asf">Simulateur ASF</a></li>
        </ul>
      </section>
    </main>

${PIED}
  </body>
</html>
`;
}
