#!/usr/bin/env node
/**
 * Génère les pages HUB VDF basées sur le pattern gagnant de revenu-median-commune
 * Données source: vdf/revenu-des-francais-a-la-commune-1765372688826.csv
 */

const fs = require("fs");
const path = require("path");

const BASE = "https://www.lescalculateurs.fr";
const TODAY = "2026-06-28";

// Villes cibles avec leurs codes pour correspondance CSV
const TARGETS = [
  "Paris",
  "Marseille",
  "Lyon",
  "Toulouse",
  "Nice",
  "Nantes",
  "Strasbourg",
  "Montpellier",
  "Bordeaux",
  "Lille",
  "Rennes",
  "Reims",
  "Saint-Étienne",
  "Toulon",
  "Le Havre",
  "Grenoble",
  "Dijon",
  "Angers",
  "Nîmes",
  "Villeurbanne",
  "Clermont-Ferrand",
  "Le Mans",
  "Aix-en-Provence",
  "Brest",
  "Tours",
  "Amiens",
  "Limoges",
  "Metz",
  "Perpignan",
  "Besançon",
  "Orléans",
  "Rouen",
  "Mulhouse",
  "Caen",
  "Nancy",
  "Poitiers",
  "Avignon",
  "Dunkerque",
  "Tourcoing",
  "Versailles",
  "Colmar",
  "Valence",
];

function loadVDFData() {
  const csv = fs.readFileSync("vdf/revenu-des-francais-a-la-commune-1765372688826.csv", "utf8");
  const lines = csv.split("\n");
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";");
    const nom = cols[0];
    for (const t of TARGETS) {
      if (nom === t) {
        const d = {
          nom,
          dispMed: Math.round(parseFloat(cols[7]) || 0),
          dispD1: Math.round(parseFloat(cols[10]) || 0),
          dispD9: Math.round(parseFloat(cols[17]) || 0),
          partImposes: parseFloat(cols[35]) || 0,
          partActivite: parseFloat(cols[21]) || 0,
          partRetraite: parseFloat(cols[25]) || 0,
          nbMenages: parseFloat(cols[3]) || 0,
        };
        if (d.dispMed > 0 && d.nbMenages > 500) results.push(d);
        break;
      }
    }
  }

  // Dedup
  const seen = new Set();
  return results.filter((c) => {
    const k = c.nom;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function formatNum(n) {
  return n.toLocaleString("fr-FR");
}
function formatEuroBreak(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F");
}
function monthly(n) {
  return Math.round(n / 12);
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

function renderHero(title, subtitle, badge, ctaLabel, ctaHref, gradient) {
  return `      <section class="rounded-3xl bg-gradient-to-br ${gradient} p-8 text-white shadow-xl">
        <p class="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
          ${escapeHtml(badge)}
        </p>
        <h1 class="mt-5 max-w-4xl text-4xl font-black leading-tight">
          ${escapeHtml(title)}
        </h1>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-100">
          ${escapeHtml(subtitle)}
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="#classement" class="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-400">${escapeHtml(ctaLabel)}</a>
          <a href="/pages/salaire-brut-net-calcul-2026" class="rounded-xl border border-white/30 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/15">Calculer mon salaire net</a>
        </div>
      </section>`;
}

function renderTableRows(cities, showDetails) {
  const median = cities.reduce((s, c) => s + c.dispMed, 0) / cities.length;
  return cities
    .map((c, i) => {
      const ecart = c.dispMed - Math.round(median);
      const sign = ecart >= 0 ? "+" : "";
      let row = `              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 font-semibold text-slate-950">${i + 1}. ${escapeHtml(c.nom)}</td>
                <td class="px-4 py-3" data-label="Revenu annuel">${formatEuroBreak(c.dispMed)}\u00A0\u20AC</td>
                <td class="px-4 py-3" data-label="Mensuel">${formatNum(monthly(c.dispMed))}\u00A0\u20AC</td>`;
      if (showDetails) {
        row += `
                <td class="px-4 py-3" data-label="D1">${c.dispD1 ? formatEuroBreak(c.dispD1) + "\u00A0\u20AC" : "-"}</td>
                <td class="px-4 py-3" data-label="D9">${c.dispD9 ? formatEuroBreak(c.dispD9) + "\u00A0\u20AC" : "-"}</td>
                <td class="px-4 py-3" data-label="D9/D1">${c.dispD1 && c.dispD9 ? (c.dispD9 / c.dispD1).toFixed(1) : "-"}</td>
                <td class="px-4 py-3" data-label="Imposés">${c.partImposes}%</td>
                <td class="px-4 py-3" data-label="Actifs">${c.partActivite}%</td>`;
      } else {
        row += `
                <td class="px-4 py-3" data-label="Vs médiane">${sign}${formatNum(Math.abs(ecart))}\u00A0\u20AC</td>`;
      }
      row += `
              </tr>`;
      return row;
    })
    .join("");
}

function renderChartJson(cities, type, title, label, unit, color) {
  const data = {
    type,
    title,
    label,
    unit,
    color,
    labels: cities.map((c) => c.nom),
    values: cities.map((c) => {
      if (unit === "euro") return c.dispMed;
      if (unit === "percent") return c.partImposes;
      if (unit === "number")
        return c.dispD1 && c.dispD9 ? parseFloat((c.dispD9 / c.dispD1).toFixed(1)) : 0;
      return 0;
    }),
  };
  return `<script type="application/json" data-vdf-chart-data>${JSON.stringify(data)}</script>`;
}

function renderCityCards(cities) {
  return cities
    .map((c) => {
      const m = monthly(c.dispMed);
      return `          <a href="/pages/revenus/${c.nom.toLowerCase().replace(/[^a-z]/g, "-")}" class="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:border-blue-400 hover:bg-blue-50">
            <span class="text-lg font-bold text-slate-950">${escapeHtml(c.nom)}</span>
            <span class="mt-2 block text-sm text-slate-600">Revenu disponible médian : <strong>${formatEuroBreak(c.dispMed)}\u00A0\u20AC</strong></span>
            <span class="mt-1 block text-sm text-slate-600">\u00C9quivalent mensuel : ${formatNum(m)}\u00A0\u20AC</span>
          </a>`;
    })
    .join("");
}

function buildHTML(
  title,
  metaDescription,
  h1,
  subtitle,
  badge,
  gradient,
  cities,
  topN,
  tableHeaderLabels,
  showDetails,
  extraChartTitle,
  extraChartUnit,
  extraChartColor,
  secondChartTitle,
  secondChartUnit,
  secondChartColor,
  pageTitle,
  pageSlug,
) {
  const top = cities.slice(0, topN);
  const tableHeaders = tableHeaderLabels
    .map((l) => `                <th class="px-4 py-3">${escapeHtml(l)}</th>`)
    .join("\n");

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(metaDescription)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${BASE}/pages/${pageSlug}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(metaDescription)}" />
    <meta property="og:url" content="${BASE}/pages/${pageSlug}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(metaDescription)}" />
    <meta property="og:image" content="${BASE}/assets/favicon-32x32.png" />
    <meta name="twitter:image" content="${BASE}/assets/favicon-32x32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />
    <link rel="shortcut icon" href="/assets/favicon.ico" />
    <link rel="stylesheet" href="/tailwind.css" />
    <script defer src="/third-party-loader.js"></script>
  </head>
  <body class="bg-slate-100 text-slate-900" data-lc-page-type="pseo" data-lc-page-cluster="revenu-commune" data-lc-page-template="vdf-income" data-lc-page-slug="${pageSlug}">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="/" class="text-lg font-bold text-slate-900">Les Calculateurs</a>
        <nav class="flex gap-4 text-sm text-slate-600">
          <a href="/">Accueil</a>
          <a href="/pages/simulateurs">Simulateurs</a>
          <a href="/pages/revenu-median-commune">Revenus par commune</a>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-10">
${renderHero(h1, subtitle, badge, "Voir le classement", "#classement", gradient)}

      <section class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-950">${escapeHtml(extraChartTitle || "Classement des revenus médians")}</h2>
          <p class="mt-2 text-sm leading-relaxed text-slate-600">
            Le graphique ci-dessous montre l\u2019\u00E9cart de revenus entre les grandes villes.
          </p>
          <div class="mt-6 h-72 md:h-96" data-vdf-chart>
            ${renderChartJson(top, "bar", extraChartTitle || "Revenu disponible médian", "Revenu médian", extraChartUnit || "euro", extraChartColor || "emerald")}
          </div>
        </article>
        <aside class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-950">Réponse rapide</h2>
          <p class="mt-4 leading-relaxed text-slate-700">
            Parmi ces ${topN} grandes villes, <strong>${escapeHtml(top[0].nom)}</strong> affiche le revenu médian le plus élevé avec <strong>${formatEuroBreak(top[0].dispMed)}\u00A0\u20AC</strong>.
            À l\u2019opposé, <strong>${escapeHtml(top[top.length - 1].nom)}</strong> se situe à <strong>${formatEuroBreak(top[top.length - 1].dispMed)}\u00A0\u20AC</strong>.
          </p>
          <div class="mt-5 rounded-2xl bg-slate-50 p-4">
            <p class="font-semibold text-slate-950">Repère mensuel</p>
            <p class="mt-2 text-slate-700">
              ${formatEuroBreak(top[0].dispMed)}\u00A0\u20AC par an représente environ <strong>${formatNum(monthly(top[0].dispMed))}\u00A0\u20AC</strong> par mois.
            </p>
          </div>
          <div class="mt-4 rounded-2xl bg-cyan-50 p-4 text-sm text-cyan-950">
            Les montants sont des revenus disponibles médians par unité de consommation, pas des salaires nets individuels.
          </div>
          <p class="mt-4 text-sm text-slate-600">
            Source :
            <a href="https://www.data.gouv.fr/datasets/revenu-des-francais-a-la-commune" class="font-semibold text-blue-700 hover:text-blue-900" rel="nofollow noopener" target="_blank">revenu des Français à la commune sur data.gouv.fr</a>.
          </p>
        </aside>
      </section>

      <section id="classement" class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-950">${escapeHtml(title)}</h2>
        <style>
          @media (max-width: 768px) {
            .responsive-table { display: block; border: none; }
            .responsive-table thead { display: none; }
            .responsive-table tbody { display: block; }
            .responsive-table tr { display: block; margin-bottom: 1.5rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; background-color: #f8fafc; }
            .responsive-table td { display: block; text-align: left; padding: 0.5rem 0; border: none; }
            .responsive-table td::before { content: attr(data-label); font-weight: 600; color: #64748b; display: block; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.25rem; }
            .responsive-table td:first-child { font-size: 1.125rem; font-weight: 700; color: #0f172a; padding-bottom: 0.75rem; border-bottom: 1px solid #cbd5e1; margin-bottom: 0.75rem; }
            .responsive-table td:first-child::before { display: none; }
          }
        </style>
        <div class="mt-5 overflow-x-auto md:overflow-visible">
          <table class="responsive-table min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
${tableHeaders}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
${renderTableRows(top, showDetails)}
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-slate-500">
          Données issues du fichier Revenu des Français à la commune (data.gouv.fr). La comparaison est calculée par rapport à la médiane de ce panel.
        </p>
      </section>

${
  secondChartTitle
    ? `
      <section class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-950">${escapeHtml(secondChartTitle)}</h2>
          <div class="mt-6 h-72 md:h-96" data-vdf-chart>
            ${renderChartJson(top, "bar", secondChartTitle, secondChartTitle, secondChartUnit || "percent", secondChartColor || "blue")}
          </div>
        </article>
      </section>`
    : ""
}

      <section class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-950">Fiches villes disponibles</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
${renderCityCards(top)}
        </div>
      </section>

      <section class="mt-8 grid gap-6 lg:grid-cols-3">
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-slate-950">Que signifient ces chiffres ?</h2>
          <p class="mt-3 leading-relaxed text-slate-700">
            Un revenu médian plus élevé ne signifie pas toujours un meilleur pouvoir d\u2019achat : le logement, les transports et le coût de la vie peuvent absorber une partie de l\u2019écart.
          </p>
        </article>
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-slate-950">Peut-on vivre avec un SMIC ?</h2>
          <p class="mt-3 leading-relaxed text-slate-700">
            Pour juger une ville, comparez le salaire net, le loyer, les aides possibles et le reste à vivre réel.
          </p>
          <a href="/pages/apl" class="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Simuler mon APL</a>
        </article>
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-slate-950">Simuler mon niveau de vie</h2>
          <p class="mt-3 leading-relaxed text-slate-700">
            Transformez ces repères statistiques en calcul personnel avec les simulateurs salaire, impôt et aides.
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <a href="/pages/salaire-brut-net-calcul-2026" class="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-800 hover:border-blue-400">Salaire net</a>
            <a href="/pages/impot" class="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-800 hover:border-blue-400">Impôt</a>
          </div>
        </article>
      </section>
    </main>
    <script type="module" src="/main.ts"></script>
  </body>
</html>`;
}

// ============================================================
// MAIN
// ============================================================
function main() {
  const cities = loadVDFData();

  // Trier par revenu médian
  const byRevenue = [...cities].sort((a, b) => b.dispMed - a.dispMed);
  // Trier par D9/D1
  const byD9D1 = [...cities]
    .filter((c) => c.dispD1 && c.dispD9)
    .sort((a, b) => b.dispD9 / b.dispD1 - a.dispD9 / a.dispD1);

  const pagesDir = path.join("src", "pages");

  // === PAGE 1: Revenu médian classement (update existing - 25 villes) ===
  const top25 = byRevenue.slice(0, 25);
  const page1 = buildHTML(
    "Classement détaillé : annuel, mensuel et écart au panel",
    "Classement 2026 des revenus par grande ville française : médiane annuelle, équivalent mensuel, graphique et écarts entre les 25 plus grandes villes de France.",
    "Quelles sont les villes où l\u2019on gagne le plus en France ?",
    "Paris arrive en tête avec 30\u202F838\u00A0\u20AC, soit environ 2\u202F570\u00A0\u20AC par mois. À l\u2019inverse, des villes comme Saint-Étienne ou Perpignan affichent des revenus médians inférieurs à 20\u202F000\u00A0\u20AC.",
    "Données VDF · Revenus locaux",
    "from-slate-950 via-slate-900 to-cyan-900",
    cities,
    25,
    ["Ville", "Revenu annuel", "Équivalent mensuel", "Vs médiane du panel"],
    false,
    "Revenu disponible médian",
    "euro",
    "emerald",
    "Part de ménages imposés",
    "percent",
    "blue",
    "Revenu médian par ville en France : classement des 25 grandes villes (2026)",
    "revenu-median-commune",
  );
  fs.writeFileSync(path.join(pagesDir, "revenu-median-commune.html"), page1, "utf8");
  console.log("✓ revenu-median-commune.html (25 villes)");

  // === PAGE 2: Top 25 revenu disponible médian ===
  const page2 = buildHTML(
    "Classement des 25 plus grandes villes par revenu disponible",
    "Top 25 des villes françaises où le revenu disponible médian est le plus élevé en 2026. Classement complet avec données détaillées par ville.",
    "Top 25 des villes où le revenu disponible est le plus élevé en France",
    "Versailles arrive en tête avec 33\u202F780\u00A0\u20AC de revenu disponible médian, suivi d\u2019Aix-en-Provence (25\u202F810\u00A0\u20AC) et Bordeaux (24\u202F870\u00A0\u20AC). Découvrez le classement complet.",
    "Classement revenu · 25 villes",
    "from-slate-950 via-slate-900 to-emerald-900",
    cities,
    25,
    ["Rang", "Ville", "Revenu annuel", "Mensuel", "D1", "D9", "D9/D1", "% Imposés", "% Actifs"],
    true,
    "Top 25 : revenu disponible médian par ville",
    "euro",
    "emerald",
    "% Ménages imposés par ville",
    "percent",
    "emerald",
    "Top 25 des villes au revenu disponible le plus élevé en France (2026) | Les Calculateurs",
    "top-25-revenu-median-france-2026",
  );
  fs.writeFileSync(path.join(pagesDir, "top-25-revenu-median-france-2026.html"), page2, "utf8");
  console.log("✓ top-25-revenu-median-france-2026.html");

  // === PAGE 3: Inégalités D9/D1 ===
  const top20D9D1 = byD9D1.slice(0, 20);
  const page3 = buildHTML(
    "Classement des inégalités de revenu par ville : rapport D9/D1",
    "Quelles sont les villes les plus inégalitaires de France en 2026 ? Classement basé sur le rapport interdécile D9/D1 mesurant l\u2019écart entre les 10% les plus riches et les 10% les plus modestes.",
    "Quelles sont les villes les plus inégalitaires de France ?",
    "Le rapport D9/D1 mesure l\u2019écart entre les plus hauts et les plus bas revenus. Un score élevé signifie de fortes inégalités. Versailles affiche un D9/D1 de 4,2 tandis que certaines villes restent plus homogènes.",
    "Inégalités · D9/D1",
    "from-slate-950 via-slate-900 to-rose-900",
    cities,
    20,
    [
      "Rang",
      "Ville",
      "Revenu annuel",
      "D1 (10% plus bas)",
      "D9 (10% plus haut)",
      "Rapport D9/D1",
      "% Imposés",
    ],
    true,
    "Rapport D9/D1 par ville",
    "number",
    "rose",
    null,
    null,
    null,
    "Inégalités de revenu par ville en France : classement D9/D1 (2026) | Les Calculateurs",
    "inegalites-revenu-ville-france-2026",
  );
  // Customize the hero for inequality page
  const heroText =
    "Le rapport D9/D1 mesure l\u2019écart entre les 10% les plus riches et les 10% les plus modestes. Versailles affiche un D9/D1 de 4,2. Découvrez le classement complet des inégalités par ville.";
  page3.replace(
    /<p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-100">\s*[^<]*<\/p>/,
    `<p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-100">${heroText}</p>`,
  );
  fs.writeFileSync(path.join(pagesDir, "inegalites-revenu-ville-france-2026.html"), page3, "utf8");
  console.log("✓ inegalites-revenu-ville-france-2026.html");

  // === PAGE 4: Top 40 complet ===
  const page4 = buildHTML(
    "Classement complet des 40 plus grandes villes de France : revenu, inégalités, emploi",
    "Tableau complet 2026 des 40 plus grandes villes françaises avec revenu disponible médian, déciles D1/D9, rapport d\u2019inégalité, part de ménages imposés et part des revenus d\u2019activité.",
    "Les 40 plus grandes villes de France passées au crible du revenu",
    "Un classement exhaustif des 40 plus grandes villes françaises avec toutes les métriques : revenu disponible médian, inégalités (D9/D1), taux d\u2019imposition et structure des revenus.",
    "Classement complet · 40 villes",
    "from-slate-950 via-slate-900 to-indigo-900",
    cities,
    40,
    ["Rang", "Ville", "Revenu annuel", "Mensuel", "D1", "D9", "D9/D1", "% Imposés", "% Actifs"],
    true,
    "Revenu médian des 40 plus grandes villes",
    "euro",
    "indigo",
    "Rapport D9/D1 (inégalités)",
    "number",
    "indigo",
    "Classement complet des 40 plus grandes villes françaises au crible du revenu (2026) | Les Calculateurs",
    "top-40-villes-revenu-complet-2026",
  );
  fs.writeFileSync(path.join(pagesDir, "top-40-villes-revenu-complet-2026.html"), page4, "utf8");
  console.log("✓ top-40-villes-revenu-complet-2026.html");

  console.log("\nGénération terminée : 4 pages HUB créées/mises à jour.");
}

main();
