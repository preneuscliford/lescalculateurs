/**
 * Fiches villes « Revenu moyen à {ville} » — Insee Filosofi 2023.
 * Appelé par scripts/build-revenus-communes-2023.cjs (ne pas lancer seul).
 */

const fs = require("fs");
const path = require("path");

const BASE = "https://www.lescalculateurs.fr";
const SOURCE_URL = "https://www.insee.fr/fr/statistiques/8984752";

// slug, code commune Insee, nom, préfixe des codes d'arrondissements (Paris, Lyon, Marseille)
const VILLES = [
  { slug: "paris", code: "75056", nom: "Paris", arm: "751" },
  { slug: "marseille", code: "13055", nom: "Marseille", arm: "132" },
  { slug: "lyon", code: "69123", nom: "Lyon", arm: "6938" },
  { slug: "toulouse", code: "31555", nom: "Toulouse" },
  { slug: "nice", code: "06088", nom: "Nice" },
  { slug: "nantes", code: "44109", nom: "Nantes" },
  { slug: "montpellier", code: "34172", nom: "Montpellier" },
  { slug: "strasbourg", code: "67482", nom: "Strasbourg" },
  { slug: "bordeaux", code: "33063", nom: "Bordeaux" },
  { slug: "lille", code: "59350", nom: "Lille" },
];

const SCENARIOS = {
  paris: ["vivre-avec-1800-net-a-paris", "reste-a-vivre-apres-loyer-700-a-paris"],
  lyon: ["vivre-avec-1800-net-a-lyon", "reste-a-vivre-apres-loyer-700-a-lyon"],
  marseille: ["vivre-avec-1800-net-a-marseille", "reste-a-vivre-apres-loyer-700-a-marseille"],
};

// Articles devant les noms de départements (« dans le Rhône », « dans les Bouches-du-Rhône »).
const DANS_DEP = {
  75: "à Paris",
  13: "dans les Bouches-du-Rhône",
  69: "dans le Rhône",
  31: "en Haute-Garonne",
  "06": "dans les Alpes-Maritimes",
  44: "en Loire-Atlantique",
  34: "dans l'Hérault",
  67: "dans le Bas-Rhin",
  33: "en Gironde",
  59: "dans le Nord",
};

const STRUCTURE = [
  ["S_EI_DI_SAL", "Salaires"],
  ["S_EI_DI_N_SAL", "Revenus d'indépendants"],
  ["S_EI_DI_UNE", "Allocations chômage"],
  ["S_RET_PEN_DI", "Retraites et pensions"],
  ["S_INC_ASS_DI", "Revenus du patrimoine et autres"],
  ["S_SOC_BEN_DI", "Prestations sociales"],
  ["S_DIR_TAX_DI", "Impôts directs"],
];

const fmt = (n) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n).replace(/ /g, " ");
const fmt1 = (n) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(n).replace(/ /g, " ");
const eur = (n) => `${fmt(n)} €`;
const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const nb = (s) => s.replace(/ ([?:;!])/g, "&nbsp;$1");

function ecart(v, ref) {
  const d = ((v - ref) / ref) * 100;
  if (Math.abs(d) < 0.5) return "au même niveau que";
  return `${d > 0 ? "+" : "−"}${fmt1(Math.abs(d))} % par rapport à`;
}

function armLabel(label) {
  const m = /(\d+)(er|e)\s+Arrondissement/i.exec(label || "");
  return m ? `${m[1]}${m[1] === "1" ? "er" : "e"} arrondissement` : label;
}

function depFromCode(code) {
  return code.startsWith("97") ? code.slice(0, 3) : code.slice(0, 2);
}

function jsonLd(obj) {
  return `    <script type="application/ld+json">\n${JSON.stringify(obj, null, 2)
    .split("\n")
    .map((l) => `      ${l}`)
    .join("\n")}\n    </script>`;
}

function page(v, ctx) {
  const { data, panel, arms, depMeasures, millesime } = ctx;
  const [m, p] = data.communes[v.code];
  const dep = depFromCode(v.code);
  const depData = data.departements[dep] || {};
  const dans = DANS_DEP[dep] || `dans le département ${depData.nom || dep}`;
  const fr = data.france.medianeMetro;
  const idx = panel.findIndex((x) => x.code === v.code);
  const rang = idx + 1;
  const above = panel[idx - 1];
  const below = panel[idx + 1];
  const url = `${BASE}/pages/revenus/${v.slug}`;
  const isDepCity = dep === "75";

  // Part des communes du département dont la médiane est plus basse.
  let partDep = null;
  if (!isDepCity) {
    const list = Object.entries(data.communes).filter(([c]) => depFromCode(c) === dep);
    partDep = {
      share: Math.round((list.filter(([, e]) => e[0] < m).length / list.length) * 100),
      total: list.length,
    };
  }

  // Arrondissements (Paris, Lyon, Marseille).
  const armRows = v.arm
    ? arms.filter((a) => a.code.startsWith(v.arm)).sort((a, b) => b.m - a.m)
    : [];

  const title = `Revenu moyen à ${v.nom} : ${eur(m)} de médiane (Insee ${millesime})`;
  const description = `${v.nom} : revenu médian de ${eur(m)} par an (${eur(m / 12)} par mois), taux de pauvreté ${
    p === null ? "non diffusé" : `${fmt1(p)} %`
  }, ${rang}e sur ${panel.length} grandes villes${armRows.length ? ", détail par arrondissement" : ""}. Données Insee ${millesime}.`;

  const faq = [
    [
      `Quel est le revenu médian à ${v.nom} ?`,
      `En ${millesime}, la moitié des habitants de ${v.nom} vit avec moins de ${eur(m)} par an, soit ${eur(
        m / 12,
      )} par mois et par unité de consommation (Insee, Filosofi). C'est ${ecart(m, fr)} la médiane de France métropolitaine (${eur(fr)}).`,
    ],
    [
      `Quel est le taux de pauvreté à ${v.nom} ?`,
      p === null
        ? `L'Insee ne publie pas de taux de pauvreté pour ${v.nom} en ${millesime}.`
        : `${fmt1(p)} % des habitants de ${v.nom} vivent sous le seuil de pauvreté en ${millesime}, contre ${fmt1(
            data.france.tauxPauvreteMetro,
          )} % en France métropolitaine. Le seuil est fixé à 60 % de la médiane nationale, soit ${eur(
            data.france.seuilPauvreteAnnuel,
          )} par an.`,
    ],
    [
      `${v.nom} fait-elle partie des villes où l'on gagne le plus ?`,
      `${v.nom} est ${rang === 1 ? "1re" : `${rang}e`} sur les ${panel.length} grandes villes de notre classement${
        above ? `, derrière ${above.nom} (${eur(above.m)})` : ""
      }${below ? ` et devant ${below.nom} (${eur(below.m)})` : ""}.`,
    ],
  ];
  if (armRows.length) {
    const top = armRows[0];
    const bot = armRows[armRows.length - 1];
    faq.push([
      `Quel est l'arrondissement le plus riche de ${v.nom} ?`,
      `Le ${armLabel(top.label)} a le revenu médian le plus élevé de ${v.nom} (${eur(top.m)} par an), le ${armLabel(
        bot.label,
      )} le plus bas (${eur(bot.m)}).`,
    ]);
  }

  const structure = STRUCTURE.map(([k, label]) => [label, depMeasures[dep]?.[k]]).filter(
    ([, val]) => typeof val === "number",
  );
  const maxStruct = Math.max(...structure.map(([, val]) => Math.abs(val)), 1);
  const deciles = depData.deciles;

  const cards = [
    ["Revenu médian par an", eur(m)],
    ["Soit par mois", eur(m / 12)],
    ["Taux de pauvreté", p === null ? "non diffusé" : `${fmt1(p)} %`],
    ["Rang parmi 40 grandes villes", `${rang}e`],
  ];

  const comparaisons = [
    `<li><strong>${ecart(m, fr)}</strong> la médiane de France métropolitaine (${eur(fr)}).</li>`,
    !isDepCity && depData.m
      ? `<li><strong>${ecart(m, depData.m)}</strong> la médiane du département (${esc(depData.nom)}) : ${eur(depData.m)}.</li>`
      : "",
    partDep
      ? `<li>Plus élevée que dans <strong>${partDep.share} %</strong> des ${partDep.total} communes du département pour lesquelles l'Insee publie une médiane.</li>`
      : "",
    above
      ? `<li>Juste au-dessus dans notre classement : <strong>${esc(above.nom)}</strong> (${eur(above.m)}).</li>`
      : "",
    below
      ? `<li>Juste en dessous : <strong>${esc(below.nom)}</strong> (${eur(below.m)}).</li>`
      : "",
  ]
    .filter(Boolean)
    .join("\n            ");

  const armSection = armRows.length
    ? `
      <section class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-950">Revenu médian par arrondissement</h2>
        <p class="mt-2 text-sm text-slate-600">Du plus élevé au plus bas, Insee ${millesime}. Médiane de la ville : ${eur(m)}.</p>
        <div class="mt-5 overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-2 py-3 sm:px-3">Arr.</th>
                <th class="px-2 py-3 sm:px-3">Revenu médian</th>
                <th class="hidden px-3 py-3 sm:table-cell">Par mois</th>
                <th class="px-2 py-3 sm:px-3">Pauvreté</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
${armRows
  .map(
    (a) => `              <tr>
                <td class="whitespace-nowrap px-2 py-2 font-semibold text-slate-950 sm:px-3">${esc(
                  armLabel(a.label).replace(" arrondissement", ""),
                )}<span class="hidden sm:inline"> arrondissement</span></td>
                <td class="w-1/2 px-2 py-2 sm:px-3">
                  <span class="whitespace-nowrap font-semibold">${eur(a.m)}</span>
                  <span class="mt-1 block h-1.5 rounded-full bg-emerald-500" style="width: ${(
                    (a.m / armRows[0].m) *
                    100
                  ).toFixed(1)}%" aria-hidden="true"></span>
                </td>
                <td class="hidden whitespace-nowrap px-3 py-2 sm:table-cell">${eur(a.m / 12)}</td>
                <td class="whitespace-nowrap px-2 py-2 sm:px-3">${a.p === null ? "n.d." : `${fmt1(a.p)} %`}</td>
              </tr>`,
  )
  .join("\n")}
            </tbody>
          </table>
        </div>
      </section>`
    : "";

  const structureSection = structure.length
    ? `
      <section class="mt-8 grid gap-6 lg:grid-cols-2">
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-slate-950">D'où viennent les revenus ${esc(dans)}&nbsp;?</h2>
          <p class="mt-2 text-sm text-slate-600">Part de chaque source dans le revenu disponible des habitants${
            isDepCity ? "" : " du département"
          } (Insee ${millesime}). Les impôts viennent en déduction.</p>
          <ul class="mt-4 space-y-3 text-sm">
${structure
  .map(
    ([label, val]) => `            <li>
              <div class="flex justify-between gap-3"><span>${esc(label)}</span><span class="font-semibold">${
                val > 0 ? "" : "−"
              }${fmt1(Math.abs(val))} %</span></div>
              <span class="mt-1 block h-1.5 rounded-full ${val < 0 ? "bg-red-400" : "bg-blue-500"}" style="width: ${(
                (Math.abs(val) / maxStruct) *
                100
              ).toFixed(1)}%" aria-hidden="true"></span>
            </li>`,
  )
  .join("\n")}
          </ul>
        </article>
        ${
          deciles
            ? `<article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-slate-950">Écarts de revenus ${esc(dans)}</h2>
          <ul class="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
            <li>Les <strong>10 % les plus modestes</strong> vivent avec moins de <strong>${eur(deciles[0])}</strong> par an (${eur(
              deciles[0] / 12,
            )} par mois).</li>
            <li>La <strong>moitié</strong> des habitants vit avec moins de <strong>${eur(deciles[4])}</strong>.</li>
            <li>Les <strong>10 % les plus aisés</strong> vivent avec plus de <strong>${eur(deciles[8])}</strong> par an (${eur(
              deciles[8] / 12,
            )} par mois).</li>
            <li>Rapport entre les deux : <strong>${fmt1(deciles[8] / deciles[0])}</strong>.</li>
          </ul>
          <p class="mt-3 text-xs text-slate-500">${
            isDepCity
              ? "Paris est à la fois une commune et un département."
              : "Chiffres du département : l'Insee ne publie plus ces écarts par commune en 2023."
          } Niveau de vie par unité de consommation.</p>
        </article>`
            : ""
        }
      </section>`
    : "";

  const scen = SCENARIOS[v.slug] || [];
  const liensBudget = scen.length
    ? `<a href="/pages/revenus/${scen[0]}" class="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-800 hover:border-blue-400">Vivre avec 1 800 € net à ${esc(
        v.nom,
      )}</a>
            <a href="/pages/revenus/${scen[1]}" class="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-800 hover:border-blue-400">Loyer de 700 € à ${esc(
              v.nom,
            )} : reste à vivre</a>
            `
    : "";

  const autres = VILLES.filter((x) => x.slug !== v.slug)
    .map(
      (x) =>
        `<a href="/pages/revenus/${x.slug}" class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 hover:border-blue-400">${esc(
          x.nom,
        )}</a>`,
    )
    .join("\n          ");

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${BASE}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Revenu par commune",
        item: `${BASE}/pages/revenu-median-commune`,
      },
      { "@type": "ListItem", position: 3, name: v.nom, item: url },
    ],
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({
      "@type": "Question",
      name: q.replace(/ \?$/, " ?"),
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta property="og:image" content="https://www.lescalculateurs.fr/assets/favicon-32x32.png" />
    <meta name="twitter:image" content="https://www.lescalculateurs.fr/assets/favicon-32x32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />
    <link rel="shortcut icon" href="/assets/favicon.ico" />
    <link rel="stylesheet" href="/tailwind.css" />
    <script defer src="/third-party-loader.js"></script>
${jsonLd(breadcrumb)}
${jsonLd(faqLd)}
  </head>
  <body
    class="bg-slate-100 text-slate-900"
    data-lc-page-type="pseo"
    data-lc-page-cluster="revenu-commune"
    data-lc-page-template="revenu-ville-2023"
    data-lc-page-slug="revenus-${v.slug}"
  >
    <!-- Généré par scripts/build-revenus-communes-2023.cjs : ne pas modifier à la main. -->
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4">
        <a href="/" class="text-lg font-bold text-slate-900">Les Calculateurs</a>
        <nav class="flex flex-wrap gap-4 text-sm text-slate-600">
          <a href="/">Accueil</a>
          <a href="/pages/simulateurs">Simulateurs</a>
          <a href="/pages/revenu-median-commune">Revenus par commune</a>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Fil d'Ariane" class="mb-4 text-sm text-slate-500">
        <a href="/" class="hover:text-slate-800">Accueil</a> ›
        <a href="/pages/revenu-median-commune" class="hover:text-slate-800">Revenu par commune</a> ›
        <span class="text-slate-700">${esc(v.nom)}</span>
      </nav>

      <section class="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 p-6 text-white shadow-xl sm:p-8">
        <p class="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-blue-100">
          Insee · Filosofi ${millesime} · publié en août 2026
        </p>
        <h1 class="mt-5 max-w-4xl text-3xl font-black leading-tight sm:text-4xl">
          ${nb(`Revenu à ${esc(v.nom)} : combien gagnent les habitants ?`)}
        </h1>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-100">
          En ${millesime}, la moitié des habitants de ${esc(v.nom)} vit avec moins de
          <strong>${eur(m)} par an</strong>, soit ${eur(m / 12)} par mois et par unité de consommation.
          C'est ${ecart(m, fr)} la médiane de France métropolitaine (${eur(fr)}).
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="/pages/revenu-median-commune?commune=${v.code}#recherche" class="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-400">Comparer mon niveau de vie</a>
          <a href="/pages/revenu-median-commune#classement" class="rounded-xl border border-white/30 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/15">Classement des grandes villes</a>
        </div>
      </section>

      <section class="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
${cards
  .map(
    ([k, val]) => `        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs text-slate-500">${esc(k)}</p>
          <p class="mt-1 text-2xl font-black text-slate-950">${val}</p>
        </div>`,
  )
  .join("\n")}
      </section>

      <section class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-950">${nb(`${esc(v.nom)} face aux autres villes`)}</h2>
        <ul class="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-slate-700">
            ${comparaisons}
        </ul>
        <p class="mt-4 text-sm text-slate-600">
          Ce chiffre est un revenu disponible par unité de consommation (salaires, retraites, allocations, revenus du patrimoine, moins les impôts), pas un salaire.
          <a href="/pages/revenu-median-commune#recherche" class="font-semibold text-blue-700 underline">Calculez le vôtre</a> pour vous comparer.
        </p>
      </section>
${armSection}
${structureSection}

      <section class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-950">${nb(`Votre budget à ${esc(v.nom)}`)}</h2>
        <p class="mt-2 text-sm text-slate-600">Passez des moyennes à votre situation : salaire, aides et reste à vivre.</p>
        <div class="mt-4 flex flex-wrap gap-2">
            ${liensBudget}<a href="/pages/salaire-brut-net-calcul-2026" class="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-800 hover:border-blue-400">Salaire brut en net</a>
            <a href="/pages/apl" class="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-800 hover:border-blue-400">Simuler mon APL</a>
            <a href="/pages/prime-activite" class="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-800 hover:border-blue-400">Prime d'activité</a>
        </div>
      </section>

      <section class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-950">Questions fréquentes</h2>
${faq
  .map(
    ([q, a]) => `        <details class="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <summary class="cursor-pointer font-semibold text-slate-950">${nb(esc(q))}</summary>
          <p class="mt-2 text-sm leading-relaxed text-slate-700">${esc(a)}</p>
        </details>`,
  )
  .join("\n")}
      </section>

      <section class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-xl font-bold text-slate-950">Les autres grandes villes</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          ${autres}
        </div>
      </section>

      <p class="mt-8 text-xs leading-relaxed text-slate-500">
        Source : <a href="${SOURCE_URL}" class="font-semibold text-blue-700 hover:text-blue-900" rel="noopener" target="_blank">Insee, revenus et pauvreté au niveau local en ${millesime}</a> (Filosofi 2, géographie au 1ᵉʳ janvier 2026).
        Les chiffres ${millesime} ne se comparent pas avec ceux de 2012 à 2021 : l'Insee a changé de méthode.
        Taux de pauvreté : part des habitants sous 60 % de la médiane de France métropolitaine.
      </p>
    </main>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
`;
}

/**
 * @param ctx { data, panel, arms:[{code,label,m,p}], depMeasures:{dep:{measure:value}}, millesime, pagesDir }
 */
function writeFiches(ctx) {
  for (const v of VILLES) {
    if (!ctx.data.communes[v.code]) throw new Error(`Pas de médiane pour ${v.nom}`);
    const out = path.join(ctx.pagesDir, `${v.slug}.html`);
    fs.writeFileSync(out, page(v, ctx));
  }
  return VILLES.map((v) => v.slug);
}

module.exports = { writeFiches, VILLES };
