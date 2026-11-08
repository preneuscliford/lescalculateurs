/**
 * Pages « combien touche… » (mère célibataire, couple au RSA) selon le nombre d'enfants, générées
 * depuis src/data/aides-foyer-pages.json par scripts/generate-pages-questions.cjs.
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

type Situation = "parent-isole" | "couple";

export interface PageAidesFoyer {
  id: string;
  situation: Situation;
  enfants: number;
  slug: string;
  titre: string;
  miseAJour: string;
  statut: string;
  /** Anciennes pages redirigées (301) vers celle-ci */
  remplace?: string[];
}

export interface SommaireAidesFoyer {
  situation: Situation;
  slug: string;
  titre: string;
  ariane: string;
  miseAJour: string;
  statut: string;
  remplace?: string[];
}

export const PAGES_AIDES_FOYER = (liste.pages as PageAidesFoyer[]).filter((p) => p.statut === "valide");
export const SOMMAIRES_AIDES_FOYER = (liste.sommaires as SommaireAidesFoyer[]).filter((s) => s.statut === "valide");
export const SLUGS_AIDES_FOYER = [...PAGES_AIDES_FOYER, ...SOMMAIRES_AIDES_FOYER].map((p) => p.slug);
/** Date de la dernière modification du contenu de chaque page (lastmod du sitemap) */
export const DATES_AIDES_FOYER: Record<string, string> = Object.fromEntries([...PAGES_AIDES_FOYER, ...SOMMAIRES_AIDES_FOYER].map((p) => [p.slug, p.miseAJour]));
export const REDIRECTIONS_AIDES_FOYER = [...PAGES_AIDES_FOYER, ...SOMMAIRES_AIDES_FOYER].flatMap((p) => (p.remplace ?? []).map((de) => ({ de, vers: p.slug })));

const ZONE = "zone2" as const;
const SMIC = Math.round(baremes.smic.mensuel_net_35h_estimation);
/** Salaires du tableau : sans emploi, temps partiel, 1 000 €, SMIC net, 2 000 € */
export const SALAIRES = [0, 700, 1000, SMIC, 2000];

const href = (slug: string) => `/pages/${slug}`;
const euros = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/ /g, " ")} €`;
const salaireTexte = (s: number) => (s === 0 ? "Sans emploi" : s === SMIC ? `${euros(s)} (SMIC net)` : euros(s));
const enfantsTexte = (n: number) => (n === 0 ? "sans enfant" : `${n} enfant${n > 1 ? "s" : ""}`);
const avecEnfants = (n: number) => (n === 0 ? "sans enfant" : `avec ${enfantsTexte(n)}`);
const sommaireDe = (situation: Situation) => SOMMAIRES_AIDES_FOYER.find((s) => s.situation === situation);

/** Formulations propres à chaque situation */
const TEXTES = {
  "parent-isole": {
    sujet: (n: number) => `Une mère (ou un père) seule avec ${enfantsTexte(n)}`,
    meta: (n: number) => `Mère ou père célibataire avec ${enfantsTexte(n)}`,
    foyer: (n: number) => `un parent isolé avec ${enfantsTexte(n)}`,
    hypothese: "sans pension alimentaire",
    lienAutre: (n: number) => `Mère célibataire avec ${enfantsTexte(n)}`,
  },
  couple: {
    sujet: (n: number) => `Un couple ${avecEnfants(n)}`,
    meta: (n: number) => `Couple ${avecEnfants(n)}`,
    foyer: (n: number) => `un couple ${avecEnfants(n)}`,
    hypothese: "avec un seul salaire dans le foyer",
    lienAutre: (n: number) => `Couple au RSA ${avecEnfants(n)}`,
  },
} as const;

/** Loyer des exemples : au-dessus du plafond APL de la zone 2 (le loyer retenu est le plafond) */
export function loyerExemple(situation: Situation, enfants: number): number {
  const sit = enfants > 0 ? "monoparental" : situation === "couple" ? "couple" : "seul";
  const d = calculerAPL({ situation: sit, enfants, revenus_mensuels: 1000, loyer_mensuel: 100, region: ZONE }).data!;
  return Math.ceil(d.plafond_loyer / 10) * 10 + 50;
}

function donnees(p: PageAidesFoyer, salaire: number, majorationIsolement = false): AidesFoyerData {
  return { situation: p.situation, enfants: p.enfants, salaire, zone: ZONE, loyer: loyerExemple(p.situation, p.enfants), ...(majorationIsolement ? { majorationIsolement } : {}) };
}

/** Marqueur data-exemple, rempli par sync-exemples au build */
function montant(p: PageAidesFoyer, salaire: number, champ: keyof AidesFoyerResult, majorationIsolement = false): string {
  return `<span data-exemple="aides-foyer" data-params='${JSON.stringify(donnees(p, salaire, majorationIsolement))}' data-champ="${champ}"></span>`;
}
const calcul = (p: PageAidesFoyer, salaire: number, majorationIsolement = false) => calculerAidesFoyer(donnees(p, salaire, majorationIsolement));

const TD = "border border-gray-300 px-3 py-2 text-right text-gray-900 whitespace-nowrap";
const TH = "border border-gray-300 px-3 py-2";

const blocFaq = (faq: [string, string][]) =>
  faq
    .map(
      ([q, a]) => `          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1" data-faq-q="faq">${echapper(q)}</h3>
            <p class="text-gray-700" data-faq-a="faq">${a}</p>
          </div>`,
    )
    .join("\n");

/** Aides versées dans une situation donnée, en texte pour la FAQ (marqueurs data-exemple) */
function detailAides(p: PageAidesFoyer, salaire: number): string {
  const r = calcul(p, salaire);
  const parts: string[] = [];
  if (r.rsa > 0) parts.push(`${montant(p, salaire, "rsa")} € de RSA`);
  if (r.prime > 0) parts.push(`${montant(p, salaire, "prime")} € de prime d'activité`);
  if (r.apl > 0) parts.push(`${montant(p, salaire, "apl")} € d'APL`);
  if (r.asf > 0) parts.push(`${montant(p, salaire, "asf")} € d'ASF`);
  if (r.allocationsFamiliales > 0) parts.push(`${montant(p, salaire, "allocationsFamiliales")} € d'allocations familiales`);
  return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} et ${parts[parts.length - 1]}` : parts.join("");
}

export function pageAidesFoyer(p: PageAidesFoyer, toutes = PAGES_AIDES_FOYER): string {
  const t = TEXTES[p.situation];
  const isole = p.situation === "parent-isole";
  const url = urlPage(p.slug);
  const sommaire = sommaireDe(p.situation)!;
  const ariane = filAriane([
    { nom: "Accueil", url: SITE },
    { nom: sommaire.ariane, url: urlPage(sommaire.slug) },
    { nom: enfantsTexte(p.enfants).replace(/^s/, "S"), url },
  ]);
  const zero = calcul(p, 0);
  const smic = calcul(p, SMIC);
  const aidesNoms = ["RSA", "prime d'activité", "APL", ...(isole ? ["ASF"] : []), ...(p.enfants >= 2 ? ["allocations familiales"] : [])].join(", ");
  const description = `${t.meta(p.enfants)} en 2026 : ${euros(zero.aides)} d'aides par mois sans emploi, ${euros(smic.total)} au total au SMIC (${aidesNoms}). Tableau selon votre salaire.`;

  const colonnes: [keyof AidesFoyerResult, string][] = [
    ["rsa", "RSA"],
    ["prime", "Prime d'activité"],
    ["apl", "APL"],
    ...(isole ? ([["asf", "ASF"]] as [keyof AidesFoyerResult, string][]) : []),
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

  const loyer = loyerExemple(p.situation, p.enfants);
  const faq: [string, string][] = [
    [
      `Combien touche ${t.foyer(p.enfants)} sans emploi ?`,
      `Sans revenu, ${isole ? "le foyer" : "le couple"} touche environ ${montant(p, 0, "aides")} € d'aides par mois : ${detailAides(p, 0)}. Calcul pour un loyer de ${euros(loyer)} en zone 2${isole ? ", sans pension alimentaire" : ""}.`,
    ],
    [
      "Et au SMIC ?",
      `Avec ${euros(SMIC)} de salaire net, le RSA s'arrête mais la prime d'activité prend le relais : ${detailAides(p, SMIC)}, soit un revenu total d'environ ${montant(p, SMIC, "total")} € par mois.`,
    ],
  ];
  if (isole) {
    faq.push(
      [
        "L'ASF est-elle déduite du RSA ?",
        `En partie seulement. L'ASF est versée en entier (${euros(socialBaremes.asf.montantParEnfant)} par enfant quand l'autre parent ne verse pas de pension), mais seule une part de ${euros(socialBaremes.asf.partRessourcesRsaPrime * socialBaremes.bmaf.montant)} par enfant est comptée dans les ressources du RSA et de la prime d'activité.`,
      ],
      [
        "Qu'est-ce que la majoration pour isolement ?",
        `Pendant 12 mois après la séparation (dans les 18 mois qui suivent), ou jusqu'aux 3 ans du plus jeune enfant, le RSA et la prime d'activité sont majorés. Sans revenu, les aides passent alors d'environ ${montant(p, 0, "aides")} € à ${montant(p, 0, "aides", true)} € par mois.`,
      ],
    );
  } else {
    faq.push(
      [
        "Et si les deux membres du couple travaillent ?",
        `Le tableau suppose un seul salaire dans le foyer. Avec deux salaires, le RSA et l'APL dépendent du total des revenus du foyer, mais la prime d'activité ajoute une bonification pour chaque personne qui gagne plus de ${euros(socialBaremes.primeActivite.bonification.seuilDebut)} par mois : à revenu total égal, le montant change selon la répartition des deux salaires. Le simulateur de prime d'activité permet de saisir les deux.`,
      ],
      [
        "Le montant est-il le même pour un couple marié, pacsé ou en concubinage ?",
        "Oui. Pour le RSA, la prime d'activité et l'APL, la CAF retient le foyer : mariage, Pacs et concubinage sont traités de la même façon.",
      ],
    );
  }
  if (p.enfants >= 3) {
    faq.push([
      "Le complément familial est-il compris ?",
      "Non. Le complément familial (à partir de 3 enfants de 3 ans ou plus, sous condition de ressources) s'ajoute aux montants de cette page. Vérifiez votre droit sur caf.fr.",
    ]);
  }

  const memeSituation = toutes.filter((x) => x.situation === p.situation && x.id !== p.id).sort((a, b) => a.enfants - b.enfants);
  const autreSommaire = SOMMAIRES_AIDES_FOYER.find((s) => s.situation !== p.situation);
  const liens = [
    ...memeSituation.map((x) => ({ href: href(x.slug), libelle: t.lienAutre(x.enfants) })),
    { href: href(sommaire.slug), libelle: "Toutes les situations" },
    ...(autreSommaire ? [{ href: href(autreSommaire.slug), libelle: autreSommaire.ariane }] : []),
    { href: "/pages/rsa", libelle: "Simulateur RSA" },
    { href: "/pages/prime-activite", libelle: "Simulateur prime d'activité" },
    { href: "/pages/apl", libelle: "Simulateur APL" },
    ...(isole ? [{ href: "/pages/asf", libelle: "Simulateur ASF" }] : []),
    { href: "/pages/simulateurs/quelle-aide-selon-mon-profil-2026", libelle: "Toutes vos aides selon votre profil" },
  ];

  const combinaison = [
    `<li><strong>RSA</strong> : il complète les ressources du foyer jusqu'au montant forfaitaire. Le salaire${p.enfants >= 2 ? ", les allocations familiales" : ""}${isole ? " et une part de l'ASF" : ""} sont déduits, ainsi qu'un forfait logement quand le foyer touche l'APL.</li>`,
    `<li><strong>Prime d'activité</strong> : dès qu'un membre du foyer travaille. Elle se cumule avec le RSA tant que celui-ci est versé, puis prend le relais.</li>`,
    `<li><strong>APL</strong> : calculée sur les revenus d'activité ; ni le RSA ni les prestations familiales n'y entrent.</li>`,
    ...(isole ? [`<li><strong>ASF</strong> : ${euros(socialBaremes.asf.montantParEnfant)} par enfant quand l'autre parent ne verse pas de pension alimentaire (ou verse moins que ce montant), sans condition de ressources.</li>`] : []),
    p.enfants >= 2
      ? `<li><strong>Allocations familiales</strong> : à partir de 2 enfants, au taux plein pour ces revenus (sans la majoration pour les enfants de 14 ans et plus).</li>`
      : `<li><strong>Allocations familiales</strong> : elles ne sont versées qu'à partir de 2 enfants.</li>`,
  ].join("\n          ");

  const majoration = isole
    ? `
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Avec la majoration pour isolement</h2>
        <p class="text-gray-700 mb-4">Pendant 12 mois après la séparation, ou jusqu'aux 3 ans du plus jeune enfant, le RSA et la prime d'activité sont majorés.</p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-gray-100"><tr><th scope="col" class="${TH} text-left">Salaire net</th><th scope="col" class="${TH} text-right">Aides sans majoration</th><th scope="col" class="${TH} text-right">Aides avec majoration</th></tr></thead>
            <tbody>
              ${[0, SMIC]
                .map(
                  (s) =>
                    `<tr><th scope="row" class="${TH} text-left font-medium text-gray-900">${salaireTexte(s)}</th><td class="${TD}">${montant(p, s, "aides")} €</td><td class="${TD} font-semibold">${montant(p, s, "aides", true)} €</td></tr>`,
                )
                .join("\n              ")}
            </tbody>
          </table>
        </div>
      </section>
`
    : "";

  const nonCompte = isole
    ? "Le complément familial, la majoration des allocations familiales pour les enfants de 14 ans et plus, l'allocation de rentrée scolaire et une éventuelle pension alimentaire. Une pension alimentaire réduit ou supprime l'ASF et compte dans les ressources du RSA."
    : `${p.enfants >= 2 ? "La majoration des allocations familiales pour les enfants de 14 ans et plus, " : ""}${p.enfants >= 3 ? "le complément familial, " : ""}${p.enfants >= 1 ? "l'allocation de rentrée scolaire, " : ""}les revenus de remplacement (chômage, indemnités journalières) et un deuxième salaire.`.replace(/^./, (c) => c.toUpperCase());

  return `${tete(p.titre, description, url, [`<script type="application/ld+json">${ariane.jsonLd}</script>`, FAQ_VIDE])}

  <body class="bg-gray-50">
${entete("/pages/simulateurs/quelle-aide-selon-mon-profil-2026", "Simulateur toutes aides")}

    <section class="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-10">
      <div class="max-w-4xl mx-auto px-4">
        ${ariane.html}
        <h1 class="mt-3 text-3xl sm:text-4xl font-bold">${echapper(p.titre)}</h1>
        <p class="mt-4 text-lg text-blue-50">
          ${t.sujet(p.enfants)} touche environ <strong>${montant(p, 0, "aides")} € d'aides par mois sans emploi</strong>.
          Au SMIC, les aides restent de <strong>${montant(p, SMIC, "aides")} €</strong>, pour un revenu total d'environ <strong>${montant(p, SMIC, "total")} €</strong> par mois.
        </p>
      </div>
    </section>

    <main class="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Les aides selon votre salaire</h2>
        <p class="text-gray-700 mb-4">Montants mensuels pour ${t.foyer(p.enfants)}, locataire en zone 2 (grandes agglomérations) avec un loyer de ${euros(loyer)}, ${t.hypothese}.</p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-gray-100"><tr><th scope="col" class="${TH} text-left">Salaire net</th>${colonnes.map(([, l]) => `<th scope="col" class="${TH} text-right">${l}</th>`).join("")}</tr></thead>
            <tbody>
              ${lignes}
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-gray-600">Barèmes au 1er avril 2026 (RSA, prime d'activité${isole ? ", ASF" : ""}, allocations familiales) et au 1er octobre 2026 (APL). Estimation : seule la CAF fixe les montants.</p>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Comment les aides se combinent</h2>
        <ul class="list-disc pl-5 space-y-2 text-gray-700">
          ${combinaison}
        </ul>
      </section>
${majoration}
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
        <div class="space-y-5">
${blocFaq(faq)}
        </div>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-3">Ce qui n'est pas compté</h2>
        <p class="text-gray-700">${nonCompte}</p>
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

/** Page sommaire d'une situation : une ligne par nombre d'enfants */
export function sommaireAidesFoyer(s: SommaireAidesFoyer, toutes = PAGES_AIDES_FOYER): string {
  const isole = s.situation === "parent-isole";
  const url = urlPage(s.slug);
  const ariane = filAriane([
    { nom: "Accueil", url: SITE },
    { nom: s.ariane, url },
  ]);
  const pages = toutes.filter((p) => p.situation === s.situation).sort((a, b) => a.enfants - b.enfants);
  const premiere = pages[0];
  const derniere = pages[pages.length - 1];
  const description = isole
    ? `Aides d'une mère célibataire en 2026 selon le nombre d'enfants : de ${euros(calcul(premiere, 0).aides)} (${enfantsTexte(premiere.enfants)}) à ${euros(calcul(derniere, 0).aides)} (${enfantsTexte(derniere.enfants)}) par mois sans emploi. RSA, prime d'activité, APL, ASF et allocations familiales.`
    : `Aides d'un couple au RSA en 2026 selon le nombre d'enfants : de ${euros(calcul(premiere, 0).aides)} (${enfantsTexte(premiere.enfants)}) à ${euros(calcul(derniere, 0).aides)} (${enfantsTexte(derniere.enfants)}) par mois sans emploi. RSA, prime d'activité, APL et allocations familiales.`;
  const lignes = pages
    .map(
      (p) =>
        `<tr><th scope="row" class="${TH} text-left font-medium"><a class="text-blue-700 underline hover:text-blue-900" href="${href(p.slug)}">${enfantsTexte(p.enfants).replace(/^s/, "S")}</a></th><td class="${TD}">${montant(p, 0, "aides")} €</td><td class="${TD}">${montant(p, SMIC, "aides")} €</td><td class="${TD} font-semibold">${montant(p, SMIC, "total")} €</td></tr>`,
    )
    .join("\n              ");
  const faq: [string, string][] = isole
    ? [
        [
          "Quelles aides pour une mère célibataire ?",
          "Le RSA (majoré les premiers mois), la prime d'activité dès qu'elle travaille, l'aide au logement (APL), l'allocation de soutien familial (ASF) si l'autre parent ne verse pas de pension, et les allocations familiales à partir de 2 enfants.",
        ],
        ["Les montants valent-ils aussi pour un père seul ?", "Oui. Les règles sont les mêmes pour une mère ou un père qui élève seul ses enfants."],
      ]
    : [
        [
          "Quelles aides pour un couple au RSA ?",
          "Le RSA, la prime d'activité dès qu'un des deux travaille, l'aide au logement (APL) et les allocations familiales à partir de 2 enfants. Les allocations familiales et un forfait logement sont déduits du RSA.",
        ],
        [
          "Un couple touche-t-il deux RSA ?",
          "Non. Le RSA est versé au foyer : le montant forfaitaire d'un couple sans enfant vaut 1,5 fois celui d'une personne seule, puis augmente avec chaque enfant.",
        ],
      ];
  const hypothese = isole ? "sans pension alimentaire ni majoration pour isolement" : "avec un seul salaire dans le foyer";
  return `${tete(s.titre, description, url, [`<script type="application/ld+json">${ariane.jsonLd}</script>`, FAQ_VIDE])}

  <body class="bg-gray-50">
${entete("/pages/simulateurs/quelle-aide-selon-mon-profil-2026", "Simulateur toutes aides")}

    <section class="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-10">
      <div class="max-w-4xl mx-auto px-4">
        ${ariane.html}
        <h1 class="mt-3 text-3xl sm:text-4xl font-bold">${echapper(s.titre)}</h1>
        <p class="mt-4 text-lg text-blue-50">Total des aides ${isole ? "d'un parent isolé, mère ou père," : "d'un couple"} selon le nombre d'enfants et le salaire. Choisissez votre situation pour voir le détail aide par aide.</p>
      </div>
    </section>

    <main class="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Les aides selon le nombre d'enfants</h2>
        <p class="text-gray-700 mb-4">Montants mensuels, locataire en zone 2 avec un loyer au moins égal au plafond APL, ${hypothese}.</p>
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
${blocFaq(faq)}
        </div>
      </section>

      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-3">Autres situations et simulateurs</h2>
        <ul class="grid gap-2 sm:grid-cols-2 text-sm">
${SOMMAIRES_AIDES_FOYER.filter((x) => x.slug !== s.slug)
  .map((x) => `          <li><a class="text-blue-700 underline hover:text-blue-900" href="${href(x.slug)}">${echapper(x.ariane)}</a></li>`)
  .join("\n")}
          <li><a class="text-blue-700 underline hover:text-blue-900" href="/pages/simulateurs/quelle-aide-selon-mon-profil-2026">Toutes vos aides selon votre profil</a></li>
          <li><a class="text-blue-700 underline hover:text-blue-900" href="/pages/rsa">Simulateur RSA</a></li>
          <li><a class="text-blue-700 underline hover:text-blue-900" href="/pages/prime-activite">Simulateur prime d'activité</a></li>
          ${isole ? `<li><a class="text-blue-700 underline hover:text-blue-900" href="/pages/asf">Simulateur ASF</a></li>` : `<li><a class="text-blue-700 underline hover:text-blue-900" href="/pages/apl">Simulateur APL</a></li>`}
        </ul>
      </section>
    </main>

${PIED}
  </body>
</html>
`;
}
