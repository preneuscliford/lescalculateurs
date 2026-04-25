#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "vdf", "revenu-des-francais-a-la-commune-1765372688826.csv");
const OUT_DIR = path.join(ROOT, "src", "pages");
const CITY_DIR = path.join(OUT_DIR, "revenus");
const DOMAIN = "https://www.lescalculateurs.fr";
const DATA_SOURCE_URL = "https://www.data.gouv.fr/datasets/revenu-des-francais-a-la-commune";

const TARGET_CITIES = [
  { slug: "paris", name: "Paris", type: "arrondissement-prefix", prefix: "Paris " },
  { slug: "lyon", name: "Lyon", type: "arrondissement-prefix", prefix: "Lyon " },
  { slug: "marseille", name: "Marseille", type: "arrondissement-prefix", prefix: "Marseille " },
  { slug: "toulouse", name: "Toulouse", type: "exact" },
  { slug: "nice", name: "Nice", type: "exact" },
  { slug: "nantes", name: "Nantes", type: "exact" },
  { slug: "montpellier", name: "Montpellier", type: "exact" },
  { slug: "strasbourg", name: "Strasbourg", type: "exact" },
  { slug: "bordeaux", name: "Bordeaux", type: "exact" },
  { slug: "lille", name: "Lille", type: "exact" },
];

const CITY_BUDGET_CASES = {
  paris: {
    rent: 1050,
    charges: 380,
    tightRent: 1000,
    comfortIncome: 3200,
    note: "Paris demande une marge plus élevée, surtout si le logement est dans le parc privé.",
  },
  lyon: {
    rent: 820,
    charges: 330,
    tightRent: 850,
    comfortIncome: 2600,
    note: "Lyon reste plus accessible que Paris, mais le logement peut vite peser sur le budget.",
  },
  marseille: {
    rent: 680,
    charges: 300,
    tightRent: 700,
    comfortIncome: 2200,
    note: "Marseille peut laisser plus de marge si le loyer reste modéré.",
  },
  toulouse: {
    rent: 700,
    charges: 300,
    tightRent: 700,
    comfortIncome: 2300,
    note: "Toulouse offre un équilibre intéressant si le loyer ne dépasse pas trop le budget médian.",
  },
  nice: {
    rent: 850,
    charges: 330,
    tightRent: 850,
    comfortIncome: 2600,
    note: "Nice combine revenus élevés et logement cher, ce qui réduit parfois le reste à vivre.",
  },
  nantes: {
    rent: 720,
    charges: 300,
    tightRent: 750,
    comfortIncome: 2300,
    note: "Nantes reste assez équilibrée, mais la tension locative peut changer fortement le budget.",
  },
  montpellier: {
    rent: 670,
    charges: 290,
    tightRent: 700,
    comfortIncome: 2150,
    note: "Montpellier est souvent accessible avec un budget maîtrisé, mais la marge est faible au SMIC.",
  },
  strasbourg: {
    rent: 690,
    charges: 300,
    tightRent: 700,
    comfortIncome: 2200,
    note: "Strasbourg peut rester confortable si le logement est bien calibré.",
  },
  bordeaux: {
    rent: 780,
    charges: 320,
    tightRent: 800,
    comfortIncome: 2450,
    note: "Bordeaux demande une vigilance particulière sur le loyer, qui peut absorber une grande partie du revenu.",
  },
  lille: {
    rent: 650,
    charges: 290,
    tightRent: 650,
    comfortIncome: 2100,
    note: "Lille peut être vivable avec un revenu modeste, mais le confort dépend beaucoup du loyer.",
  },
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatEuro(value) {
  if (!Number.isFinite(value)) return "n.d.";
  return `${Math.round(value).toLocaleString("fr-FR")} €`;
}

function formatSignedEuro(value) {
  if (!Number.isFinite(value)) return "n.d.";
  const rounded = Math.round(value);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toLocaleString("fr-FR")} €`;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "n.d.";
  return `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
}

function formatNumber(value, digits = 1) {
  if (!Number.isFinite(value)) return "n.d.";
  return value.toLocaleString("fr-FR", { maximumFractionDigits: digits });
}

function toNumber(value) {
  if (value == null) return null;
  const normalized = String(value)
    .trim()
    .replace(/\u202f/g, "")
    .replace(/\s/g, "")
    .replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function weightedAverage(rows, field, weightField = "fiscalHouseholds") {
  let total = 0;
  let weights = 0;
  for (const row of rows) {
    const value = row[field];
    const weight = row[weightField] || 0;
    if (!Number.isFinite(value) || !Number.isFinite(weight) || weight <= 0) continue;
    total += value * weight;
    weights += weight;
  }
  return weights > 0 ? total / weights : null;
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + (Number.isFinite(row[field]) ? row[field] : 0), 0);
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function cityLivingSummary(city, panelMedian) {
  const gap = city.disposableMedian - panelMedian;
  if (gap >= 4000) {
    return `${city.cityName} affiche un revenu médian supérieur au panel, mais le coût du logement peut réduire le confort réel. Comparez toujours le salaire net, le loyer et les aides avant de juger le niveau de vie.`;
  }
  if (gap <= -2500) {
    return `${city.cityName} affiche un revenu médian plus bas que le panel, mais la ville peut rester plus accessible si le loyer est maîtrisé. Le reste à vivre dépend surtout du logement et de la composition du foyer.`;
  }
  return `${city.cityName} se situe dans une zone intermédiaire du panel. Pour savoir si le budget est confortable, il faut croiser revenu, loyer, impôt et aides éventuelles.`;
}

function budgetCaseFor(city) {
  return (
    CITY_BUDGET_CASES[city.slug] || {
      rent: 700,
      charges: 300,
      tightRent: 700,
      comfortIncome: 2200,
      note: "Le niveau de confort dépend surtout du loyer, des charges et des aides possibles.",
    }
  );
}

function smicAnswer(city, budgetCase) {
  return `Oui, mais avec un budget serré si le loyer dépasse ${formatEuro(budgetCase.tightRent)}. À ${city.cityName}, un SMIC peut couvrir les dépenses de base, mais il faut surveiller le logement, les charges et les aides possibles.`;
}

function panelComparison(city, panelMedian) {
  const gap = city.disposableMedian - panelMedian;
  if (gap > 1500) {
    return `Le revenu médian à ${city.cityName} est au-dessus de la médiane de ce panel de grandes villes. Cela ne garantit pas un meilleur pouvoir d’achat, car le logement peut être plus cher.`;
  }
  if (gap < -1500) {
    return `Le revenu médian à ${city.cityName} est inférieur à la médiane de ce panel de grandes villes. La ville peut toutefois rester intéressante si le coût du logement est plus bas.`;
  }
  return `Le revenu médian à ${city.cityName} est proche de la médiane de ce panel de grandes villes. Le confort réel dépend surtout du loyer et de la situation du foyer.`;
}

function parseCsv() {
  const text = fs.readFileSync(INPUT, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter(Boolean);
  return lines.slice(1).map((line) => {
    const cells = line.split(";");
    return {
      name: cells[2] || cells[0] || "",
      code: cells[1] || "",
      fiscalHouseholds: toNumber(cells[3]),
      people: toNumber(cells[4]),
      disposableQ1: toNumber(cells[6]),
      disposableMedian: toNumber(cells[7]),
      disposableQ3: toNumber(cells[8]),
      disposableD1: toNumber(cells[10]),
      disposableD9: toNumber(cells[17]),
      disposableD9D1: toNumber(cells[18]),
      gini: toNumber(cells[20]),
      activityShare: toNumber(cells[21]),
      salaryShare: toNumber(cells[22]),
      unemploymentShare: toNumber(cells[23]),
      pensionShare: toNumber(cells[25]),
      propertyShare: toNumber(cells[26]),
      socialBenefitsShare: toNumber(cells[27]),
      familyBenefitsShare: toNumber(cells[28]),
      minimaShare: toNumber(cells[29]),
      housingBenefitsShare: toNumber(cells[30]),
      taxShare: toNumber(cells[31]),
      taxedHouseholdShare: toNumber(cells[35]),
      declaredMedian: toNumber(cells[37]),
    };
  });
}

function aggregateCity(rows, target) {
  const matches =
    target.type === "exact"
      ? rows.filter((row) => row.name.toLowerCase() === target.name.toLowerCase())
      : rows.filter((row) => row.name.startsWith(target.prefix));

  if (!matches.length) {
    throw new Error(`Aucune donnée VDF trouvée pour ${target.name}`);
  }

  if (matches.length === 1) {
    return {
      ...matches[0],
      slug: target.slug,
      cityName: target.name,
      sourceLabel: "Donnée communale VDF",
      sourceNote: "Donnée communale issue du fichier VDF.",
      components: matches,
    };
  }

  return {
    slug: target.slug,
    cityName: target.name,
    code: matches.map((row) => row.code).join(", "),
    fiscalHouseholds: sum(matches, "fiscalHouseholds"),
    people: sum(matches, "people"),
    disposableQ1: weightedAverage(matches, "disposableQ1"),
    disposableMedian: weightedAverage(matches, "disposableMedian"),
    disposableQ3: weightedAverage(matches, "disposableQ3"),
    disposableD1: weightedAverage(matches, "disposableD1"),
    disposableD9: weightedAverage(matches, "disposableD9"),
    disposableD9D1: weightedAverage(matches, "disposableD9D1"),
    gini: weightedAverage(matches, "gini"),
    activityShare: weightedAverage(matches, "activityShare"),
    salaryShare: weightedAverage(matches, "salaryShare"),
    unemploymentShare: weightedAverage(matches, "unemploymentShare"),
    pensionShare: weightedAverage(matches, "pensionShare"),
    propertyShare: weightedAverage(matches, "propertyShare"),
    socialBenefitsShare: weightedAverage(matches, "socialBenefitsShare"),
    familyBenefitsShare: weightedAverage(matches, "familyBenefitsShare"),
    minimaShare: weightedAverage(matches, "minimaShare"),
    housingBenefitsShare: weightedAverage(matches, "housingBenefitsShare"),
    taxShare: weightedAverage(matches, "taxShare"),
    taxedHouseholdShare: weightedAverage(matches, "taxedHouseholdShare"),
    declaredMedian: weightedAverage(matches, "declaredMedian"),
    sourceLabel: "Agrégation indicative des arrondissements VDF",
    sourceNote:
      "Paris, Lyon et Marseille sont fournis par arrondissement dans le fichier. Le repère affiché est une moyenne pondérée indicative des arrondissements.",
    components: matches,
  };
}

function chartPayload(payload) {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

function chartBlock(payload, className = "h-80") {
  return `<div class="${className}" data-vdf-chart>
            <script type="application/json" data-vdf-chart-data>${chartPayload(payload)}</script>
          </div>`;
}

function layout({ title, description, canonicalPath, body, pageSlug, robots = "index, follow" }) {
  const canonical = `${DOMAIN}${canonicalPath}`;
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${DOMAIN}/assets/favicon-32x32.png" />
    <meta name="twitter:image" content="${DOMAIN}/assets/favicon-32x32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />
    <link rel="shortcut icon" href="/assets/favicon.ico" />
    <link rel="stylesheet" href="/tailwind.css" />
    <script defer src="/third-party-loader.js"></script>
  </head>
  <body
    class="bg-slate-100 text-slate-900"
    data-lc-page-type="pseo"
    data-lc-page-cluster="revenu-commune"
    data-lc-page-template="vdf-income"
    data-lc-page-slug="${escapeHtml(pageSlug)}"
  >
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="/" class="text-lg font-bold text-slate-900">Les Calculateurs</a>
        <button id="menu-toggle" class="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <nav id="nav-menu" class="hidden md:flex gap-4 text-sm text-slate-600">
          <a href="/">Accueil</a>
          <a href="/pages/simulateurs">Simulateurs</a>
          <a href="/pages/revenu-median-commune">Revenus par commune</a>
        </nav>
      </div>
      <nav id="mobile-nav" class="hidden md:hidden border-t border-slate-100 bg-white px-4 py-3 text-sm text-slate-600">
        <a href="/" class="block py-2 hover:text-slate-900">Accueil</a>
        <a href="/pages/simulateurs" class="block py-2 hover:text-slate-900">Simulateurs</a>
        <a href="/pages/revenu-median-commune" class="block py-2 hover:text-slate-900">Revenus par commune</a>
      </nav>
    </header>
    <script>
      document.getElementById('menu-toggle')?.addEventListener('click', function() {
        const mobileNav = document.getElementById('mobile-nav');
        mobileNav.classList.toggle('hidden');
      });
    </script>
    ${body}
    <script type="module" src="/main.ts"></script>
  </body>
</html>`;
}

function cityPage(city, allCities) {
  const panelMedian = median(allCities.map((row) => row.disposableMedian));
  const monthlyMedian = city.disposableMedian / 12;
  const budgetCase = budgetCaseFor(city);
  const remainingBudget = monthlyMedian - budgetCase.rent - budgetCase.charges;
  const title = `Revenu moyen à ${city.cityName} en 2026 : combien faut-il pour vivre ?`;
  const description = `Revenu médian à ${city.cityName}, équivalent mensuel, coût de la vie, SMIC et graphiques pour estimer si votre budget est confortable.`;
  const pathName = `/pages/revenus/${city.slug}`;
  const richer = [...allCities]
    .filter((row) => row.slug !== city.slug)
    .sort((a, b) => b.disposableMedian - a.disposableMedian)
    .slice(0, 4);

  const body = `<main class="mx-auto max-w-6xl px-4 py-10">
      <section class="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 p-8 text-white shadow-xl">
        <p class="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-blue-100">
          Données VDF · Revenu par commune
        </p>
        <h1 class="mt-5 max-w-4xl text-4xl font-black leading-tight">
          Quel revenu faut-il pour vivre à ${escapeHtml(city.cityName)} ?
        </h1>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-100">
          À ${escapeHtml(city.cityName)}, le revenu médian est d’environ ${formatEuro(monthlyMedian)} par mois, soit ${formatEuro(city.disposableMedian)} par an.
          ${escapeHtml(smicAnswer(city, budgetCase))}
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="#graphiques" class="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-400">Voir les graphiques</a>
          <a href="/pages/salaire-brut-net-calcul-2026" class="rounded-xl border border-white/30 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/15">Calculer mon salaire net</a>
          <a href="/pages/apl" class="rounded-xl border border-white/30 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/15">Calculer mes aides</a>
        </div>
      </section>

      <section class="mt-8 grid gap-4 md:grid-cols-4">
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Revenu disponible médian</p>
          <p class="mt-2 text-3xl font-black text-slate-950">${formatEuro(city.disposableMedian)}</p>
          <p class="mt-2 text-sm text-slate-600">Environ ${formatEuro(monthlyMedian)} par mois.</p>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Ménages fiscaux</p>
          <p class="mt-2 text-3xl font-black text-slate-950">${formatNumber(city.fiscalHouseholds, 0)}</p>
          <p class="mt-2 text-sm text-slate-600">Base statistique locale.</p>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Part imposée</p>
          <p class="mt-2 text-3xl font-black text-slate-950">${formatPercent(city.taxedHouseholdShare)}</p>
          <p class="mt-2 text-sm text-slate-600">Ménages fiscaux imposés.</p>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Dispersion D9/D1</p>
          <p class="mt-2 text-3xl font-black text-slate-950">${formatNumber(city.disposableD9D1, 1)}</p>
          <p class="mt-2 text-sm text-slate-600">Écart hauts/bas revenus.</p>
        </article>
      </section>

      <section class="mt-8 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-amber-700">Exemple de reste à vivre</p>
            <h2 class="mt-2 text-2xl font-bold text-slate-950">Budget type à ${escapeHtml(city.cityName)} avec le revenu médian</h2>
            <p class="mt-3 max-w-2xl leading-relaxed text-slate-700">
              Exemple indicatif : ${formatEuro(monthlyMedian)} de revenu mensuel, ${formatEuro(budgetCase.rent)} de loyer et ${formatEuro(budgetCase.charges)} de charges courantes.
              Il resterait environ ${formatEuro(remainingBudget)} avant alimentation, transport, épargne et dépenses personnelles.
            </p>
          </div>
          <div class="grid min-w-72 grid-cols-2 gap-3 rounded-3xl bg-white p-4 shadow-sm">
            <div class="rounded-2xl bg-emerald-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">Revenu</p>
              <p class="mt-1 text-2xl font-black text-emerald-900">${formatEuro(monthlyMedian)}</p>
            </div>
            <div class="rounded-2xl bg-rose-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-rose-700">Loyer</p>
              <p class="mt-1 text-2xl font-black text-rose-900">-${formatEuro(budgetCase.rent)}</p>
            </div>
            <div class="rounded-2xl bg-orange-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-orange-700">Charges</p>
              <p class="mt-1 text-2xl font-black text-orange-900">-${formatEuro(budgetCase.charges)}</p>
            </div>
            <div class="rounded-2xl bg-blue-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-blue-700">Reste</p>
              <p class="mt-1 text-2xl font-black text-blue-900">${formatEuro(remainingBudget)}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-950">${escapeHtml(city.cityName)} est-elle une ville chère ?</h2>
          <p class="mt-3 leading-relaxed text-slate-700">
            ${escapeHtml(cityLivingSummary(city, panelMedian))}
          </p>
          <p class="mt-3 leading-relaxed text-slate-700">
            ${escapeHtml(panelComparison(city, panelMedian))}
          </p>
          <p class="mt-3 leading-relaxed text-slate-700">
            ${escapeHtml(budgetCase.note)}
          </p>
          <p class="mt-3 text-sm text-slate-600">
            Ce repère ne remplace pas un budget personnel : deux foyers avec le même revenu peuvent avoir un niveau de vie très différent selon le loyer, les transports et les aides.
          </p>
          <p class="mt-4 text-sm text-slate-600">
            Source des données :
            <a href="${DATA_SOURCE_URL}" class="font-semibold text-blue-700 hover:text-blue-900" rel="nofollow noopener" target="_blank">revenu des Français à la commune sur data.gouv.fr</a>.
          </p>
        </article>
        <article class="rounded-3xl border border-blue-200 bg-blue-50 p-6">
          <h2 class="text-2xl font-bold text-slate-950">Peut-on vivre avec un SMIC à ${escapeHtml(city.cityName)} ?</h2>
          <p class="mt-3 leading-relaxed text-slate-700">
            ${escapeHtml(smicAnswer(city, budgetCase))}
          </p>
          <h3 class="mt-5 text-lg font-bold text-slate-950">Quel salaire pour vivre confortablement à ${escapeHtml(city.cityName)} ?</h3>
          <p class="mt-2 leading-relaxed text-slate-700">
            Pour vivre plus confortablement à ${escapeHtml(city.cityName)}, visez environ ${formatEuro(budgetCase.comfortIncome)} nets par mois si vous êtes seul, avec un loyer proche de ${formatEuro(budgetCase.rent)}.
            Ce seuil reste indicatif : il dépend du quartier, du transport, du foyer et des aides.
          </p>
          <div class="mt-5 flex flex-wrap gap-3">
            <a href="/pages/salaire-brut-net-calcul-2026" class="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Calculer mon salaire net</a>
            <a href="/pages/apl" class="rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-800 hover:border-blue-400">Calculez vos aides à ${escapeHtml(city.cityName)} en 30 secondes</a>
          </div>
        </article>
      </section>

      <section id="graphiques" class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-950">Répartition des revenus à ${escapeHtml(city.cityName)}</h2>
          <p class="mt-2 text-sm leading-relaxed text-slate-600">
            Ce graphique compare le premier décile, les quartiles, la médiane et le neuvième décile.
          </p>
          ${chartBlock({
            type: "bar",
            title: `Repères de revenu à ${city.cityName}`,
            label: "Revenu disponible",
            unit: "euro",
            color: "emerald",
            labels: ["D1", "Q1", "Médiane", "Q3", "D9"],
            values: [
              city.disposableD1,
              city.disposableQ1,
              city.disposableMedian,
              city.disposableQ3,
              city.disposableD9,
            ],
          })}
        </article>

        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-950">Composition indicative des revenus</h2>
          <p class="mt-2 text-sm leading-relaxed text-slate-600">
            La composition donne un repère sur la part de l’activité, des pensions, du patrimoine et des prestations sociales.
          </p>
          ${chartBlock({
            type: "doughnut",
            title: `Composition à ${city.cityName}`,
            label: "Part",
            unit: "percent",
            color: "blue",
            labels: ["Activité", "Pensions", "Patrimoine", "Prestations sociales"],
            values: [
              city.activityShare,
              city.pensionShare,
              city.propertyShare,
              city.socialBenefitsShare,
            ],
          })}
        </article>
      </section>

      <section class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-950">Comment lire ces chiffres ?</h2>
        <div class="mt-4 grid gap-4 md:grid-cols-3">
          <p class="rounded-2xl bg-slate-50 p-4 text-slate-700">
            Le revenu disponible médian coupe la population en deux : la moitié se situe au-dessus, l’autre moitié en dessous.
          </p>
          <p class="rounded-2xl bg-slate-50 p-4 text-slate-700">
            Le rapport D9/D1 mesure la dispersion entre les hauts et les bas revenus observés dans la commune.
          </p>
          <p class="rounded-2xl bg-slate-50 p-4 text-slate-700">
            ${escapeHtml(city.sourceNote)}
          </p>
        </div>
      </section>

      <section class="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6">
        <h2 class="text-2xl font-bold text-slate-950">Comparer ${escapeHtml(city.cityName)} avec d’autres villes</h2>
        <div class="mt-4 grid gap-3 md:grid-cols-4">
          ${richer
            .map(
              (
                row,
              ) => `<a class="rounded-2xl border border-blue-100 bg-white p-4 hover:border-blue-400" href="/pages/revenus/${row.slug}">
            <span class="font-semibold text-slate-950">${escapeHtml(row.cityName)}</span>
            <span class="mt-1 block text-sm text-slate-600">${formatEuro(row.disposableMedian)}</span>
          </a>`,
            )
            .join("")}
        </div>
        <div class="mt-5 flex flex-wrap gap-3">
          <a href="/pages/revenu-median-commune" class="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Voir la page pilier</a>
          <a href="/pages/impot" class="rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-800 hover:border-blue-400">Estimer mon impôt</a>
          <a href="/pages/apl" class="rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-800 hover:border-blue-400">Calculer mes aides à ${escapeHtml(city.cityName)}</a>
          <a href="/pages/salaire-brut-net-calcul-2026" class="rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-800 hover:border-blue-400">Convertir mon brut en net</a>
        </div>
      </section>
    </main>`;

  return layout({
    title,
    description,
    canonicalPath: pathName,
    body,
    pageSlug: `revenus-${city.slug}`,
  });
}

function pillarPage(cities) {
  const sorted = [...cities].sort((a, b) => b.disposableMedian - a.disposableMedian);
  const lowest = sorted[sorted.length - 1];
  const panelMedian = median(sorted.map((city) => city.disposableMedian));
  const title = "Revenu médian par ville en France : classement des 10 grandes villes (2026)";
  const description =
    "Classement 2026 des revenus par grande ville, souvent recherchés comme revenu moyen : médiane annuelle, équivalent mensuel, graphique et écarts.";

  const body = `<main class="mx-auto max-w-6xl px-4 py-10">
      <section class="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-8 text-white shadow-xl">
        <p class="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
          Données VDF · Revenus locaux
        </p>
        <h1 class="mt-5 max-w-4xl text-4xl font-black leading-tight">
          Quelles sont les villes où l’on gagne le plus en France ?
        </h1>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-100">
          ${escapeHtml(sorted[0].cityName)} arrive en tête de ce premier classement avec un revenu médian de ${formatEuro(sorted[0].disposableMedian)}, soit environ ${formatEuro(sorted[0].disposableMedian / 12)} par mois.
          À l’inverse, ${escapeHtml(lowest.cityName)} affiche ${formatEuro(lowest.disposableMedian)}, ce qui montre des écarts marqués entre grandes villes.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="#classement" class="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-400">Voir le classement</a>
          <a href="/pages/salaire-brut-net-calcul-2026" class="rounded-xl border border-white/30 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/15">Calculer mon salaire net</a>
        </div>
      </section>

      <section class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-950">Classement des revenus médians des grandes villes</h2>
          <p class="mt-2 text-sm leading-relaxed text-slate-600">
            Le graphique ci-dessous montre l’écart de revenus entre les grandes villes du premier lot.
          </p>
          ${chartBlock(
            {
              type: "bar",
              title: "Revenu disponible médian",
              label: "Revenu médian",
              unit: "euro",
              color: "emerald",
              labels: sorted.map((row) => row.cityName),
              values: sorted.map((row) => row.disposableMedian),
            },
            "mt-6 h-64 md:h-80 lg:h-96",
          )}
        </article>
        <aside class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-950">Réponse rapide</h2>
          <p class="mt-4 leading-relaxed text-slate-700">
            Parmi ces 10 grandes villes, ${escapeHtml(sorted[0].cityName)} affiche le revenu médian le plus élevé.
            Le revenu médian correspond au niveau où la moitié des ménages se situe au-dessus et l’autre moitié en dessous.
          </p>
          <div class="mt-5 rounded-2xl bg-slate-50 p-4">
            <p class="font-semibold text-slate-950">Repère mensuel</p>
            <p class="mt-2 text-slate-700">
              ${formatEuro(sorted[0].disposableMedian)} par an représente environ ${formatEuro(sorted[0].disposableMedian / 12)} par mois.
            </p>
          </div>
          <div class="mt-4 rounded-2xl bg-cyan-50 p-4 text-sm text-cyan-950">
            Les montants sont des revenus disponibles médians par unité de consommation, pas des salaires nets individuels.
          </div>
          <p class="mt-4 text-sm text-slate-600">
            Source :
            <a href="${DATA_SOURCE_URL}" class="font-semibold text-blue-700 hover:text-blue-900" rel="nofollow noopener" target="_blank">revenu des Français à la commune sur data.gouv.fr</a>.
          </p>
        </aside>
      </section>

      <section id="classement" class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-950">Classement détaillé : annuel, mensuel et écart au panel</h2>
        <style>
          @media (max-width: 768px) {
            .responsive-table {
              display: block;
              border: none;
            }
            .responsive-table thead {
              display: none;
            }
            .responsive-table tbody {
              display: block;
            }
            .responsive-table tr {
              display: block;
              margin-bottom: 1.5rem;
              border: 1px solid #e2e8f0;
              border-radius: 0.5rem;
              padding: 1rem;
              background-color: #f8fafc;
            }
            .responsive-table td {
              display: block;
              text-align: left;
              padding: 0.5rem 0;
              border: none;
            }
            .responsive-table td::before {
              content: attr(data-label);
              font-weight: 600;
              color: #64748b;
              display: block;
              font-size: 0.75rem;
              text-transform: uppercase;
              margin-bottom: 0.25rem;
            }
            .responsive-table td:first-child {
              font-size: 1.125rem;
              font-weight: 700;
              color: #0f172a;
              padding-bottom: 0.75rem;
              border-bottom: 1px solid #cbd5e1;
              margin-bottom: 0.75rem;
            }
            .responsive-table td:first-child::before {
              display: none;
            }
          }
        </style>
        <div class="mt-5 overflow-x-auto md:overflow-visible">
          <table class="responsive-table min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3">Ville</th>
                <th class="px-4 py-3">Revenu annuel</th>
                <th class="px-4 py-3">Équivalent mensuel</th>
                <th class="px-4 py-3">Vs médiane du panel</th>
                <th class="px-4 py-3">Fiche</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${sorted
                .map(
                  (city) => `<tr class="hover:bg-slate-50">
                <td class="px-4 py-3 font-semibold text-slate-950">${escapeHtml(city.cityName)}</td>
                <td class="px-4 py-3" data-label="Revenu annuel">${formatEuro(city.disposableMedian)}</td>
                <td class="px-4 py-3" data-label="Équivalent mensuel">${formatEuro(city.disposableMedian / 12)}</td>
                <td class="px-4 py-3" data-label="Vs médiane du panel">${formatSignedEuro(city.disposableMedian - panelMedian)}</td>
                <td class="px-4 py-3" data-label="Fiche"><a class="font-semibold text-blue-700 hover:text-blue-900" href="/pages/revenus/${city.slug}">Voir la ville</a></td>
              </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-slate-500">
          La comparaison est calculée par rapport à la médiane de ce panel de 10 grandes villes, car le fichier utilisé ici ne contient pas de ligne nationale consolidée.
        </p>
      </section>

      <section class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-950">Fiches villes disponibles</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          ${sorted
            .map(
              (
                city,
              ) => `<a href="/pages/revenus/${city.slug}" class="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:border-blue-400 hover:bg-blue-50">
            <span class="text-lg font-bold text-slate-950">${escapeHtml(city.cityName)}</span>
            <span class="mt-2 block text-sm text-slate-600">Revenu disponible médian : <strong>${formatEuro(city.disposableMedian)}</strong></span>
            <span class="mt-1 block text-sm text-slate-600">D9/D1 : ${formatNumber(city.disposableD9D1, 1)}</span>
          </a>`,
            )
            .join("")}
        </div>
      </section>

      <section class="mt-8 grid gap-6 lg:grid-cols-3">
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-slate-950">Que signifient ces chiffres ?</h2>
          <p class="mt-3 leading-relaxed text-slate-700">
            Un revenu médian plus élevé ne signifie pas toujours un meilleur pouvoir d’achat : le logement, les transports et le coût de la vie peuvent absorber une partie de l’écart.
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

      <section class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-950">Part de ménages imposés</h2>
          ${chartBlock(
            {
              type: "bar",
              title: "Ménages fiscaux imposés",
              label: "Part imposée",
              unit: "percent",
              color: "blue",
              labels: sorted.map((row) => row.cityName),
              values: sorted.map((row) => row.taxedHouseholdShare),
            },
            "mt-6 h-64 md:h-80",
          )}
        </article>
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-950">Dispersion D9/D1</h2>
          ${chartBlock(
            {
              type: "bar",
              title: "Rapport D9/D1",
              label: "D9/D1",
              unit: "number",
              color: "rose",
              labels: sorted.map((row) => row.cityName),
              values: sorted.map((row) => row.disposableD9D1),
            },
            "mt-6 h-64 md:h-80",
          )}
        </article>
      </section>

    </main>`;

  return layout({
    title,
    description,
    canonicalPath: "/pages/revenu-median-commune",
    body,
    pageSlug: "revenu-median-commune",
  });
}

function writePage(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function main() {
  const rows = parseCsv();
  const cities = TARGET_CITIES.map((target) => aggregateCity(rows, target));

  writePage(path.join(OUT_DIR, "revenu-median-commune.html"), pillarPage(cities));

  for (const city of cities) {
    const html = cityPage(city, cities);
    writePage(path.join(CITY_DIR, `${city.slug}.html`), html);
    writePage(path.join(CITY_DIR, city.slug, "index.html"), html);
  }

  console.log(`Generated VDF income pages: 1 pillar + ${cities.length} city pages`);
}

main();
