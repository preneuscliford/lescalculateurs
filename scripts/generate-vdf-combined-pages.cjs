#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "vdf", "revenu-des-francais-a-la-commune-1765372688826.csv");
const OUT_DIR = path.join(ROOT, "src", "pages", "revenus");
const DOMAIN = "https://www.lescalculateurs.fr";
const DATA_SOURCE_URL = "https://www.data.gouv.fr/datasets/revenu-des-francais-a-la-commune";

const TARGET_CITIES = [
  { slug: "paris", name: "Paris", type: "arrondissement-prefix", prefix: "Paris " },
  { slug: "lyon", name: "Lyon", type: "arrondissement-prefix", prefix: "Lyon " },
  { slug: "marseille", name: "Marseille", type: "arrondissement-prefix", prefix: "Marseille " },
];

const CITY_DEFAULT_RENTS = {
  paris: 1050,
  lyon: 820,
  marseille: 680,
};

const CITY_TRANSPORT = {
  paris: 86,
  lyon: 65,
  marseille: 65,
};

const CITY_LOCAL_HOOKS = {
  paris:
    "Paris combine des revenus plus élevés et un logement plus tendu, donc la question clé reste le reste à vivre après le loyer.",
  lyon: "Lyon reste plus respirable que Paris, mais le logement et les transports peuvent vite absorber la marge.",
  marseille:
    "Marseille peut laisser davantage d'air au budget, à condition de garder le loyer sous contrôle.",
};

const APL_BAREMES = require(path.join(ROOT, "src", "data", "baremes.json")).apl;
const APL_PLAFOND_REALISTE_SINGLE = 320;
const PRIME_BAREMES = {
  montantForfaitaire: {
    nonMajoree: {
      unePersonne: 638.28,
      coupleOuIsole1Enfant: 957.42,
      couple1EnfantOuIsole2Enfants: 1148.9,
      couple2Enfants: 1340.38,
      isole3Enfants: 1404.21,
      couple3Enfants: 1595.69,
      personneSupplementaire: 255.32,
    },
    majoree: {
      grossesse: 819.63,
      isole1Enfant: 1092.84,
      isole2Enfants: 1366.05,
      isole3Enfants: 1639.26,
      isole4Enfants: 1912.47,
      personneSupplementaire: 271.04,
    },
  },
  forfaitLogement: {
    unePersonne: 76.59,
    deuxPersonnes: 153.19,
    troisPersonnesOuPlus: 189.57,
  },
  bonification: {
    montantMaximum: 240.63,
    seuilDebut: 709.18,
    seuilMaximum: 1658.76,
  },
  revenusProfessionnelsPrisEnCompte: 0.61,
  montantMinimumVerse: 15,
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
    .replace(/,/g, ".");
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

function layout({ title, description, canonicalPath, body, pageSlug }) {
  const canonical = `${DOMAIN}${canonicalPath}`;
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow" />
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
    data-lc-page-cluster="niveau-de-vie"
    data-lc-page-template="vdf-combined"
    data-lc-page-slug="${escapeHtml(pageSlug)}"
  >
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="/" class="text-lg font-bold text-slate-900">Les Calculateurs</a>
        <button id="menu-toggle" class="md:hidden inline-flex h-10 w-10 items-center justify-center text-slate-600 hover:text-slate-900">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <nav id="nav-menu" class="hidden gap-4 text-sm text-slate-600 md:flex">
          <a href="/">Accueil</a>
          <a href="/pages/simulateurs">Simulateurs</a>
          <a href="/pages/revenu-median-commune">Revenus par commune</a>
        </nav>
      </div>
      <nav id="mobile-nav" class="hidden border-t border-slate-100 bg-white px-4 py-3 text-sm text-slate-600 md:hidden">
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

function getRentGuide(city) {
  return CITY_DEFAULT_RENTS[city.slug] || 700;
}

function getTransportBudget(city) {
  return CITY_TRANSPORT[city.slug] || 65;
}

function getHousingZone(city) {
  return city.slug === "paris" ? "idf" : "province";
}

function calculateAplEstimate({ city, income, rent }) {
  const zone = getHousingZone(city);
  const singlePlafond =
    zone === "idf" ? APL_BAREMES.plafonds_loyer.zone1.seul : APL_BAREMES.plafonds_loyer.zone2.seul;
  const loyerPrisCompte = Math.min(rent, singlePlafond);
  const forfaitLogement = PRIME_BAREMES.forfaitLogement.unePersonne;
  let participation = income * 0.3 - forfaitLogement;
  participation = Math.max(35, participation);
  let aplBrute = loyerPrisCompte - participation;
  if (participation >= loyerPrisCompte) {
    aplBrute = 0;
  }
  aplBrute = Math.max(0, aplBrute);
  const plafondApl = APL_PLAFOND_REALISTE_SINGLE;
  const aplEstimee = Math.floor(Math.min(aplBrute, plafondApl));
  return {
    zone,
    loyerPrisCompte,
    participation: Math.round(participation),
    aplEstimee,
    plafondApl,
    forfaitLogement,
  };
}

function getPrimeForfait(situation, enfants) {
  const nbEnfants = Math.max(0, Math.floor(enfants || 0));
  if (situation === "monoparental") {
    if (nbEnfants <= 0) return PRIME_BAREMES.montantForfaitaire.nonMajoree.unePersonne;
    if (nbEnfants === 1) return PRIME_BAREMES.montantForfaitaire.majoree.isole1Enfant;
    if (nbEnfants === 2) return PRIME_BAREMES.montantForfaitaire.majoree.isole2Enfants;
    if (nbEnfants === 3) return PRIME_BAREMES.montantForfaitaire.majoree.isole3Enfants;
    return (
      PRIME_BAREMES.montantForfaitaire.majoree.isole4Enfants +
      (nbEnfants - 4) * PRIME_BAREMES.montantForfaitaire.majoree.personneSupplementaire
    );
  }

  if (situation === "couple") {
    if (nbEnfants <= 0) return PRIME_BAREMES.montantForfaitaire.nonMajoree.coupleOuIsole1Enfant;
    if (nbEnfants === 1)
      return PRIME_BAREMES.montantForfaitaire.nonMajoree.couple1EnfantOuIsole2Enfants;
    if (nbEnfants === 2) return PRIME_BAREMES.montantForfaitaire.nonMajoree.couple2Enfants;
    if (nbEnfants === 3) return PRIME_BAREMES.montantForfaitaire.nonMajoree.couple3Enfants;
    return (
      PRIME_BAREMES.montantForfaitaire.nonMajoree.couple3Enfants +
      (nbEnfants - 3) * PRIME_BAREMES.montantForfaitaire.nonMajoree.personneSupplementaire
    );
  }

  if (nbEnfants <= 0) return PRIME_BAREMES.montantForfaitaire.nonMajoree.unePersonne;
  if (nbEnfants === 1) return PRIME_BAREMES.montantForfaitaire.nonMajoree.coupleOuIsole1Enfant;
  if (nbEnfants === 2)
    return PRIME_BAREMES.montantForfaitaire.nonMajoree.couple1EnfantOuIsole2Enfants;
  if (nbEnfants === 3) return PRIME_BAREMES.montantForfaitaire.nonMajoree.isole3Enfants;
  return (
    PRIME_BAREMES.montantForfaitaire.nonMajoree.isole3Enfants +
    (nbEnfants - 3) * PRIME_BAREMES.montantForfaitaire.nonMajoree.personneSupplementaire
  );
}

function getPrimeBonification(revenusProf) {
  const revenus = Math.max(0, revenusProf || 0);
  const { seuilDebut, seuilMaximum, montantMaximum } = PRIME_BAREMES.bonification;
  if (revenus < seuilDebut) return 0;
  if (revenus >= seuilMaximum) return montantMaximum;
  const ratio = (revenus - seuilDebut) / (seuilMaximum - seuilDebut);
  return Math.round(montantMaximum * ratio * 100) / 100;
}

function calculatePrimeEstimate({ income }) {
  const situation = "seul";
  const enfants = 0;
  const logement = "loue";
  const montantBase = getPrimeForfait(situation, enfants);
  const bonification = getPrimeBonification(income);
  const forfaitLogement = logement === "loue" ? 0 : PRIME_BAREMES.forfaitLogement.unePersonne;
  const revenusProfsComptabilises = income * PRIME_BAREMES.revenusProfessionnelsPrisEnCompte;
  const totalRevenusComptabilises = Math.max(0, income) + forfaitLogement;
  let montantFinal =
    montantBase + bonification + revenusProfsComptabilises - totalRevenusComptabilises;
  montantFinal = Math.max(0, Math.round(montantFinal * 100) / 100);
  if (montantFinal > 0 && montantFinal < PRIME_BAREMES.montantMinimumVerse) {
    montantFinal = 0;
  }
  return {
    montantBase,
    bonification,
    forfaitLogement,
    revenusProfsComptabilises,
    montantFinal,
  };
}

function calculateLoanCapacity(income) {
  const mensualiteMax = Math.max(0, Math.round(income * 0.35));
  const monthlyRate = 0.035 / 12;
  const months = 20 * 12;
  const factor =
    monthlyRate === 0
      ? months
      : (Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months));
  const capitalEmpruntable = mensualiteMax * factor;
  return {
    mensualiteMax,
    capitalEmpruntable,
  };
}

function calculateSimulation(city, mode) {
  const localMedianAnnual = city.disposableMedian;
  const localMedianMonthly = localMedianAnnual / 12;
  const income = mode.kind === "income-led" ? mode.income : localMedianMonthly;
  const rent = mode.kind === "income-led" ? getRentGuide(city) : mode.rent;
  const apl = calculateAplEstimate({ city, income, rent });
  const prime = calculatePrimeEstimate({ income });
  const transport = getTransportBudget(city);
  const charges = {
    loyer: rent,
    assuranceLogement: 18,
    electricite: 65,
    eau: 20,
    internet: 35,
    telephone: 20,
    transportRoutier: 0,
    transportPublic: transport,
    assuranceSante: 45,
    gardienEnfants: 0,
    alimentation: 275,
    hygiene: 45,
    vetements: 55,
    loisirs: 90,
    autres: 80,
  };

  const revenusTotal = income + apl.aplEstimee + prime.montantFinal;
  const chargesLogement =
    charges.loyer +
    charges.assuranceLogement +
    charges.electricite +
    charges.eau +
    charges.internet +
    charges.telephone;
  const chargesTransport = charges.transportRoutier + charges.transportPublic;
  const chargesSante = charges.assuranceSante;
  const chargesAlimentaires = charges.alimentation + charges.hygiene;
  const chargesAffaires = charges.vetements + charges.gardienEnfants;
  const chargesDiverses = charges.loisirs + charges.autres;
  const chargesTotal =
    chargesLogement +
    chargesTransport +
    chargesSante +
    chargesAlimentaires +
    chargesAffaires +
    chargesDiverses;
  const resteAVivre = revenusTotal - chargesTotal;
  const tauxEndettement = revenusTotal > 0 ? (chargesTotal / revenusTotal) * 100 : 0;
  const niveauRisque =
    tauxEndettement < 40
      ? "faible"
      : tauxEndettement < 60
        ? "modéré"
        : tauxEndettement < 85
          ? "élevé"
          : "critique";
  const loan = calculateLoanCapacity(income);
  const epargnePossible = Math.max(0, Math.round((resteAVivre - 300) * 100) / 100);
  const niveauDeVie =
    resteAVivre >= 700
      ? "confortable"
      : resteAVivre >= 350
        ? "équilibré"
        : resteAVivre >= 150
          ? "serré"
          : "fragile";

  return {
    city,
    mode,
    localMedianAnnual,
    localMedianMonthly,
    income,
    rent,
    apl,
    prime,
    charges,
    chargesLogement,
    chargesTransport,
    chargesSante,
    chargesAlimentaires,
    chargesAffaires,
    chargesDiverses,
    chargesTotal,
    revenusTotal,
    resteAVivre,
    tauxEndettement,
    niveauRisque,
    loan,
    epargnePossible,
    niveauDeVie,
    incomeVsLocalMedian: income - localMedianMonthly,
  };
}

function getModeTitle(mode) {
  if (mode.kind === "income-led") {
    return `Vivre avec ${formatEuro(mode.income)} net à ${mode.cityName}`;
  }
  return `Reste à vivre après un loyer de ${formatEuro(mode.rent)} à ${mode.cityName}`;
}

function getModeDescription(mode) {
  if (mode.kind === "income-led") {
    return `Simulation de budget pour un revenu net de ${formatEuro(mode.income)} par mois à ${mode.cityName} : aides possibles, reste à vivre, épargne et capacité de prêt.`;
  }
  return `Simulation de budget à ${mode.cityName} avec un loyer de ${formatEuro(mode.rent)} et un revenu de base calé sur la médiane locale VDF.`;
}

function buildScenarioPage(simulation) {
  const { city, mode, localMedianMonthly, localMedianAnnual, income, rent } = simulation;
  const title = `${getModeTitle(mode)} : aides, budget, reste à vivre et niveau de vie`;
  const description = getModeDescription(mode);
  const localComparison = income - localMedianMonthly;
  const cityHook =
    CITY_LOCAL_HOOKS[city.slug] ||
    "Le niveau de vie dépend surtout du couple revenu / loyer / aides.";
  const mainMetricLabel =
    mode.kind === "income-led" ? "Revenu net mensuel" : "Base de revenu mensuelle";
  const titleCity = city.cityName;
  const rentLabel = mode.kind === "income-led" ? "Loyer de référence" : "Loyer cible";

  const body = `
    <main class="mx-auto max-w-6xl px-4 py-10">
      <section class="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_35%),linear-gradient(135deg,_#0f172a_0%,_#1e293b_45%,_#0f172a_100%)] px-6 py-10 text-white shadow-2xl md:px-10">
        <div class="max-w-4xl">
          <p class="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
            Simulation de niveau de vie · ${escapeHtml(city.cityName)}
          </p>
          <h1 class="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-5xl">
            ${escapeHtml(title)}
          </h1>
          <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-100">
            ${escapeHtml(description)}
          </p>
          <div class="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
            <span class="rounded-full border border-white/15 bg-white/10 px-4 py-2">${escapeHtml(city.sourceLabel || "Donnée VDF")}</span>
            <span class="rounded-full border border-white/15 bg-white/10 px-4 py-2">Revenu médian local : ${escapeHtml(formatEuro(localMedianAnnual))} / an</span>
            <span class="rounded-full border border-white/15 bg-white/10 px-4 py-2">${escapeHtml(cityHook)}</span>
          </div>
        </div>
      </section>

      <section class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium uppercase tracking-wide text-slate-500">${escapeHtml(mainMetricLabel)}</p>
          <p class="mt-3 text-3xl font-black text-slate-950">${formatEuro(income)}</p>
          <p class="mt-2 text-sm text-slate-600">Comparé à la médiane locale : ${formatSignedEuro(localComparison)}</p>
        </article>
        <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium uppercase tracking-wide text-slate-500">${escapeHtml(rentLabel)}</p>
          <p class="mt-3 text-3xl font-black text-slate-950">${formatEuro(rent)}</p>
          <p class="mt-2 text-sm text-slate-600">Repère logement ${mode.kind === "income-led" ? "pour la simulation" : "comparatif"}</p>
        </article>
        <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium uppercase tracking-wide text-slate-500">APL estimée</p>
          <p class="mt-3 text-3xl font-black text-slate-950">${formatEuro(simulation.apl.aplEstimee)}</p>
          <p class="mt-2 text-sm text-slate-600">Loyer retenu : ${formatEuro(simulation.apl.loyerPrisCompte)}</p>
        </article>
        <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium uppercase tracking-wide text-slate-500">Prime d'activité</p>
          <p class="mt-3 text-3xl font-black text-slate-950">${formatEuro(simulation.prime.montantFinal)}</p>
          <p class="mt-2 text-sm text-slate-600">Bonification estimée : ${formatEuro(simulation.prime.bonification)}</p>
        </article>
        <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium uppercase tracking-wide text-slate-500">Reste à vivre</p>
          <p class="mt-3 text-3xl font-black text-slate-950">${formatEuro(simulation.resteAVivre)}</p>
          <p class="mt-2 text-sm text-slate-600">Après toutes les charges du mois</p>
        </article>
        <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium uppercase tracking-wide text-slate-500">Niveau de vie</p>
          <p class="mt-3 text-3xl font-black text-slate-950">${escapeHtml(simulation.niveauDeVie)}</p>
          <p class="mt-2 text-sm text-slate-600">Risque budget : ${escapeHtml(simulation.niveauRisque)}</p>
        </article>
      </section>

      <section class="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-950">Budget mensuel détaillé</h2>
          <p class="mt-2 text-sm leading-relaxed text-slate-600">Hypothèses communes à la simulation : personne seule, locataire, aucun enfant. Le but est de rendre le calcul lisible et comparable d'une ville à l'autre.</p>
          <div class="mt-6 overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-4 py-3">Poste</th>
                  <th class="px-4 py-3">Montant</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${[
                  [rentLabel, rent],
                  ["Assurance logement", simulation.charges.assuranceLogement],
                  ["Électricité", simulation.charges.electricite],
                  ["Eau", simulation.charges.eau],
                  ["Internet", simulation.charges.internet],
                  ["Téléphone", simulation.charges.telephone],
                  ["Transport", simulation.charges.transportPublic],
                  ["Santé / mutuelle", simulation.charges.assuranceSante],
                  ["Alimentation", simulation.charges.alimentation],
                  ["Hygiène", simulation.charges.hygiene],
                  ["Vêtements", simulation.charges.vetements],
                  ["Loisirs", simulation.charges.loisirs],
                  ["Autres charges", simulation.charges.autres],
                ]
                  .map(
                    ([label, amount]) => `<tr>
                      <td class="px-4 py-3 font-medium text-slate-900">${escapeHtml(label)}</td>
                      <td class="px-4 py-3 text-slate-700">${formatEuro(amount)}</td>
                    </tr>`,
                  )
                  .join("")}
                <tr class="bg-slate-50 font-semibold text-slate-950">
                  <td class="px-4 py-3">Total charges</td>
                  <td class="px-4 py-3">${formatEuro(simulation.chargesTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <aside class="space-y-6">
          <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-2xl font-bold text-slate-950">Aides estimées pour ce cas</h2>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl bg-cyan-50 p-4">
                <p class="text-sm font-semibold text-cyan-900">APL estimée</p>
                <p class="mt-2 text-2xl font-black text-cyan-950">${formatEuro(simulation.apl.aplEstimee)}</p>
                <p class="mt-2 text-sm text-cyan-900">Calculée avec un loyer plafonné à ${formatEuro(simulation.apl.loyerPrisCompte)} pour la zone ${escapeHtml(simulation.apl.zone.toUpperCase())}.</p>
              </div>
              <div class="rounded-2xl bg-emerald-50 p-4">
                <p class="text-sm font-semibold text-emerald-900">Prime d'activité</p>
                <p class="mt-2 text-2xl font-black text-emerald-950">${formatEuro(simulation.prime.montantFinal)}</p>
                <p class="mt-2 text-sm text-emerald-900">Montant théorique selon votre revenu (profil personne seule, sans enfant).</p>
              </div>
            </div>
            <p class="mt-4 text-sm leading-relaxed text-slate-600">En pratique : ces montants donnent un ordre d'idée pour vérifier si votre budget reste tenable. Le montant réel dépendra de votre dossier CAF complet.</p>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-2xl font-bold text-slate-950">Ce que vous pouvez mettre de côté (et emprunter)</h2>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl bg-amber-50 p-4">
                <p class="text-sm font-semibold text-amber-900">Épargne possible en fin de mois</p>
                <p class="mt-2 text-2xl font-black text-amber-950">${formatEuro(simulation.epargnePossible)}</p>
                <p class="mt-2 text-sm text-amber-900">Après vos dépenses mensuelles, en gardant 300 € de marge de sécurité.</p>
              </div>
              <div class="rounded-2xl bg-violet-50 p-4">
                <p class="text-sm font-semibold text-violet-900">Mensualité de prêt possible</p>
                <p class="mt-2 text-2xl font-black text-violet-950">${formatEuro(simulation.loan.mensualiteMax)}</p>
                <p class="mt-2 text-sm text-violet-900">Estimation prudente avec une limite d'endettement à 35 % du revenu.</p>
              </div>
            </div>
            <div class="mt-4 rounded-2xl bg-slate-50 p-4">
              <p class="text-sm font-semibold text-slate-900">Capital empruntable sur 20 ans</p>
              <p class="mt-2 text-2xl font-black text-slate-950">${formatEuro(simulation.loan.capitalEmpruntable)}</p>
              <p class="mt-2 text-sm text-slate-600">Repère indicatif avec un taux fixe de 3,5 %.</p>
            </div>
          </article>
        </aside>
      </section>

      <section class="mt-8 grid gap-6 lg:grid-cols-3">
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-slate-950">Lecture rapide</h2>
          <p class="mt-3 leading-relaxed text-slate-700">
            ${escapeHtml(
              mode.kind === "income-led"
                ? `Avec ${formatEuro(income)} nets à ${city.cityName}, le sujet n'est pas seulement le salaire. Le couple loyer + aides + charges courantes détermine le vrai confort du mois.`
                : `À ${city.cityName}, partir du revenu médian local puis retirer ${formatEuro(rent)} de loyer permet de visualiser immédiatement la pression réelle du logement.`,
            )}
          </p>
        </article>
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-slate-950">Niveau de vie local</h2>
          <p class="mt-3 leading-relaxed text-slate-700">
            Le revenu médian local vaut ${formatEuro(localMedianMonthly)} par mois. Cette simulation se situe à ${formatSignedEuro(localComparison)} de ce repère.
          </p>
          <p class="mt-3 text-sm text-slate-500">Source VDF communale via data.gouv.fr.</p>
        </article>
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-xl font-bold text-slate-950">Comment utiliser cette simulation</h2>
            <p class="mt-3 leading-relaxed text-slate-700">
              ${escapeHtml((CITY_LOCAL_HOOKS && CITY_LOCAL_HOOKS[city.slug]) || "")} Commencez par comparer le reste à vivre obtenu avec votre niveau de dépenses réel. Si le résultat est trop serré, testez un loyer plus bas ou un revenu plus élevé pour voir rapidement le seuil de confort à ${escapeHtml(city.cityName)}.
            </p>
        </article>
      </section>

      <section class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-950">Pages liées</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <a href="/pages/revenus/${city.slug}" class="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:border-cyan-400 hover:bg-cyan-50">
            <span class="text-lg font-bold text-slate-950">Fiche revenu de ${escapeHtml(titleCity)}</span>
            <span class="mt-2 block text-sm text-slate-600">Comparer le revenu médian, les déciles et le niveau de dispersion.</span>
          </a>
          <a href="/pages/apl" class="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:border-cyan-400 hover:bg-cyan-50">
            <span class="text-lg font-bold text-slate-950">Simuler une APL</span>
            <span class="mt-2 block text-sm text-slate-600">Vérifier l'impact du loyer sur le budget mensuel.</span>
          </a>
          <a href="/pages/salaire-brut-net-calcul-2026" class="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:border-cyan-400 hover:bg-cyan-50">
            <span class="text-lg font-bold text-slate-950">Calculer un salaire net</span>
            <span class="mt-2 block text-sm text-slate-600">Relier un salaire brut à un revenu net exploitable dans ces scénarios.</span>
          </a>
        </div>
      </section>

      <section class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-950">Hypothèses et méthode</h2>
        <ul class="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
          <li>• Calculs effectués pour un foyer d'une personne seule, locataire, sans enfant.</li>
          <li>• APL et prime d'activité sont estimées avec un moteur simplifié, suffisant pour comparer des cas concrets.</li>
          <li>• La capacité de prêt correspond à une mensualité théorique de 35 % du revenu net, avec un taux fixe indicatif à 3,5 % sur 20 ans.</li>
          <li>• Le revenu médian local provient du fichier VDF des revenus des Français à la commune.</li>
        </ul>
        <p class="mt-4 text-xs text-slate-500">Source : <a href="${DATA_SOURCE_URL}" class="font-semibold text-blue-700 hover:text-blue-900" rel="nofollow noopener" target="_blank">données VDF sur data.gouv.fr</a>.</p>
      </section>
    </main>`;

  return layout({
    title,
    description,
    canonicalPath: `/pages/revenus/${mode.slug}`,
    body,
    pageSlug: mode.slug,
  });
}

function simulationSlug(citySlug, kind) {
  return kind === "income-led"
    ? `vivre-avec-1800-net-a-${citySlug}`
    : `reste-a-vivre-apres-loyer-700-a-${citySlug}`;
}

function buildPillarPage(cities, simulations) {
  const title = "Niveau de vie par ville : vivre avec 1 800 € net ou un loyer de 700 €";
  const description =
    "Une page pilier pour comparer le reste à vivre, les aides et la capacité de prêt selon la ville, le revenu et le loyer.";

  const body = `
    <main class="mx-auto max-w-6xl px-4 py-10">
      <section class="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(135deg,_#0f172a_0%,_#111827_55%,_#020617_100%)] px-6 py-10 text-white shadow-2xl md:px-10">
        <div class="max-w-4xl">
          <p class="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-100">Cluster de simulation</p>
          <h1 class="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-5xl">Niveau de vie par ville : revenus, loyer, aides et reste à vivre</h1>
          <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-100">Cette série de pages combine les revenus VDF des communes avec des scénarios concrets de budget. Chaque page croise un lieu, un revenu ou un loyer, puis calcule les aides, l'épargne et la capacité de prêt.</p>
        </div>
      </section>

      <section class="mt-8 grid gap-6 lg:grid-cols-2">
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-950">Scénarios revenus</h2>
          <div class="mt-5 grid gap-4 md:grid-cols-2">
            ${cities
              .map(
                (
                  city,
                ) => `<a href="/pages/revenus/${simulationSlug(city.slug, "income-led")}" class="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:border-emerald-400 hover:bg-emerald-50">
                  <span class="text-lg font-bold text-slate-950">Vivre avec 1 800 € net à ${escapeHtml(city.cityName)}</span>
                  <span class="mt-2 block text-sm text-slate-600">Comparer revenu, loyer guide, aides et reste à vivre.</span>
                </a>`,
              )
              .join("")}
          </div>
        </article>
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-950">Scénarios loyer</h2>
          <div class="mt-5 grid gap-4 md:grid-cols-2">
            ${cities
              .map(
                (
                  city,
                ) => `<a href="/pages/revenus/${simulationSlug(city.slug, "rent-led")}" class="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:border-cyan-400 hover:bg-cyan-50">
                  <span class="text-lg font-bold text-slate-950">Reste à vivre après un loyer de 700 € à ${escapeHtml(city.cityName)}</span>
                  <span class="mt-2 block text-sm text-slate-600">Base de revenu calée sur la médiane locale VDF.</span>
                </a>`,
              )
              .join("")}
          </div>
        </article>
      </section>

      <section class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-950">Pourquoi ce format compte</h2>
        <p class="mt-4 max-w-4xl leading-relaxed text-slate-700">Le simple revenu médian d'une ville n'explique pas le quotidien. Ce cluster relie la donnée VDF à des cas d'usage concrets : vivre avec 1 800 € net, tenir un loyer de 700 €, estimer les aides, puis évaluer ce qu'il reste réellement pour épargner ou emprunter.</p>
        <div class="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
          <span class="rounded-full bg-slate-100 px-4 py-2">Aides</span>
          <span class="rounded-full bg-slate-100 px-4 py-2">Budget</span>
          <span class="rounded-full bg-slate-100 px-4 py-2">Reste à vivre</span>
          <span class="rounded-full bg-slate-100 px-4 py-2">Épargne</span>
          <span class="rounded-full bg-slate-100 px-4 py-2">Capacité prêt</span>
          <span class="rounded-full bg-slate-100 px-4 py-2">Niveau de vie</span>
        </div>
      </section>

      <section class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-950">Méthode de comparaison</h2>
        <p class="mt-4 text-sm leading-relaxed text-slate-700">Chaque page utilise le revenu médian local de la commune ou de l'agrégation VDF correspondante, puis applique les mêmes hypothèses de charges pour garder la comparaison lisible entre villes.</p>
      </section>
    </main>`;

  return layout({
    title,
    description,
    canonicalPath: "/pages/revenus/niveau-de-vie-par-ville",
    body,
    pageSlug: "niveau-de-vie-par-ville",
  });
}

function writePage(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function main() {
  const rows = parseCsv();
  const cities = TARGET_CITIES.map((target) => aggregateCity(rows, target));
  const simulations = [];

  writePage(
    path.join(OUT_DIR, "niveau-de-vie-par-ville.html"),
    buildPillarPage(cities, simulations),
  );

  for (const city of cities) {
    const incomeLed = calculateSimulation(city, {
      kind: "income-led",
      slug: simulationSlug(city.slug, "income-led"),
      cityName: city.cityName,
      income: 1800,
    });
    const rentLed = calculateSimulation(city, {
      kind: "rent-led",
      slug: simulationSlug(city.slug, "rent-led"),
      cityName: city.cityName,
      rent: 700,
    });

    simulations.push(incomeLed, rentLed);

    writePage(path.join(OUT_DIR, `${incomeLed.mode.slug}.html`), buildScenarioPage(incomeLed));
    writePage(path.join(OUT_DIR, `${rentLed.mode.slug}.html`), buildScenarioPage(rentLed));
  }

  console.log(`Generated combined VDF pages: 1 pillar + ${simulations.length} simulation pages`);
}

main();
