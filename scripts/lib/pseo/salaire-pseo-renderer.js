const DOMAIN = "https://www.lescalculateurs.fr";
const PILLAR_PATH = "/pages/salaire";
const GENERATED_MARKER = "\x3C!-- GENERATED:PSEO:SALAIRE -->";
const FAVICON_OG_IMAGE = `${DOMAIN}/assets/favicon-32x32.png`;

const STATUT_LABELS = { cadre: "Cadre", non_cadre: "Non-cadre" };

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "\x26amp;")
    .replace(/</g, "\x26lt;")
    .replace(/>/g, "\x26gt;")
    .replace(/"/g, "\x26quot;")
    .replace(/'/g, "\x26#39;");
}
function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "\x26amp;")
    .replace(/"/g, "\x26quot;")
    .replace(/</g, "\x26lt;")
    .replace(/>/g, "\x26gt;");
}
function encodeHtmlEntities(value) {
  return String(value).replace(/[^\x20-\x7E]/g, function (char) {
    return "\x26#" + char.charCodeAt(0) + ";";
  });
}

function normalizeFrenchText(value) {
  return String(value)
    .replace(/\bV\u003Frifier\b/g, "V\u00e9rifier")
    .replace(/\bpr\u003Fl\u003Fvement\b/gi, "pr\u00e9l\u00e8vement")
    .replace(/\bs\u003Fcurit\u003F sociale\b/gi, "S\u00e9curit\u00e9 sociale")
    .replace(/\br\u003Ff\u003Frence\b/g, "r\u00e9f\u00e9rence")
    .replace(/\bd\u003Fpend\b/g, "d\u00e9pend")
    .replace(/\bsc\u003Fnario\b/g, "sc\u00e9nario")
    .replace(/\bSc\u003Fnario\b/g, "Sc\u00e9nario")
    .replace(/\b\u003F partir\b/g, "\u00e0 partir")
    .replace(/\b\u003F la source\b/g, "\u00e0 la source")
    .replace(/\bd\u003Ffinitif\b/g, "d\u00e9finitif")
    .replace(/\br\u003Feel\b/g, "r\u00e9el")
    .replace(/\br\u003Fsultat\b/g, "r\u00e9sultat")
    .replace(/\brepr\u003Fsentatif\b/gi, "repr\u00e9sentatif")
    .replace(/\butilis\u003F\b/gi, "utilis\u00e9")
    .replace(/\butilise\b/gi, "utilis\u00e9")
    .replace(/\butilisee\b/gi, "utilis\u00e9e")
    .replace(/\bverifier\b/gi, "v\u00e9rifier")
    .replace(/\bcomplete\b/gi, "compl\u00e8te")
    .replace(/\bmethodologie\b/gi, "m\u00e9thodologie")
    .replace(/\bdiff\u003Frence\b/gi, "diff\u00e9rence")
    .replace(/\btr\u003Fs\b/gi, "tr\u00e8s")
    .replace(/\bd\u003Fs\b/gi, "d\u00e8s")
    .replace(/\bapr\u003Fs\b/gi, "apr\u00e8s")
    .replace(/\bcompl\u003Fmentaire\b/gi, "compl\u00e9mentaire")
    .replace(/\bsuppl\u003Fmentaires\b/gi, "suppl\u00e9mentaires")
    .replace(/\bpartiel\b/gi, "partiel")
    .replace(/\bcotis\u003F\b/gi, "cotis\u00e9")
    .replace(/\bprelevement\b/gi, "pr\u00e9l\u00e8vement")
    .replace(/\b\u003Fquivalent\b/gi, "\u00e9quivalent")
    .replace(/\bimp\u003Ft\b/gi, "imp\u00f4t")
    .replace(/\bretraite\b/gi, "retraite")
    .replace(/\bpr\u003Fvoyance\b/gi, "pr\u00e9voyance")
    .replace(/\b\u003Ftre\b/gi, "\u00eatre")
    .replace(/\s{2,}/g, " ");
}

function normalizeInlineApproxEuro(value) {
  var normalized = String(value).replace(
    /(^|[^\w~])(\d{1,3}(?:[\s\u202f]?\d{3})*|\d+)\s*EUR\b/g,
    function (match, prefix, amount, offset, source) {
      var amountStart = Number(offset) + String(prefix).length;
      var beforeAmount = String(source).slice(Math.max(0, amountStart - 18), amountStart);
      if (/~\d[\d\s\u202f]*$/u.test(beforeAmount)) return match;
      var numeric = Number(String(amount).replace(/[\s\u202f]/g, ""));
      if (!Number.isFinite(numeric)) return prefix + amount + " EUR";
      return (
        prefix +
        "~" +
        numeric.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
        " EUR"
      );
    },
  );
  return normalized.replace(
    /~(\d{1,3})[\s\u202f]?~(\d{1,3}(?:[\s\u202f]\d{3})*)\s*EUR\b/g,
    function (_match, left, right) {
      return "~" + left + "\u202f" + right + " EUR";
    },
  );
}

function renderText(value) {
  return encodeHtmlEntities(escapeHtml(normalizeInlineApproxEuro(normalizeFrenchText(value))));
}

function renderJsonLd(data) {
  var json = JSON.stringify(data).replace(/[^\x20-\x7E]/g, function (char) {
    return "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0");
  });
  return '<script type="application/ld+json">' + json + "<\/script>";
}

function buildSalaireSimulatorUrl(input) {
  var params = new URLSearchParams();
  params.set("salaire-brut", String(input.brutMensuel));
  params.set("salaire-statut", input.statut);
  params.set("salaire-pas", String(input.tauxPAS || 0));
  return PILLAR_PATH + "?" + params.toString() + "#salaire-form";
}

var INTRO_VARIANTS = [
  "Cette page donne un premier ordre de grandeur avant d'utiliser le simulateur complet.",
  "Un repère indicatif pour anticiper votre net avant de lancer une simulation personnalisée.",
  "Ce scénario type vous donne une estimation rapide, à affiner ensuite avec le simulateur.",
  "Une première estimation concrète pour vous aider à projeter votre salaire net mensuel.",
  "Ce calcul indicatif vous permet d'avoir un ordre d'idée avant simulation complète.",
  "Un aperçu utile pour comprendre la conversion brut/net avant d'utiliser l'outil complet.",
  "Cette projection vous donne un point de départ fiable avant d'affiner avec vos paramètres réels.",
  "Un chiffrage rapide basé sur un profil type, à vérifier ensuite avec le simulateur.",
  "Ce repère indicatif vous aide à estimer votre net sans attendre une simulation détaillée.",
  "Une estimation pratique pour visualiser l'impact des cotisations sur votre salaire.",
  "Ce calcul express vous donne une base solide avant de personnaliser avec le simulateur.",
  "Un ordre de grandeur utile pour anticiper votre budget mensuel net.",
  "Cette simulation simplifiée vous permet de comprendre rapidement le passage brut/net.",
  "Un premier jalon concret pour évaluer votre salaire net avant simulation fine.",
  "Ce scénario indicatif pose les bases avant d'ajuster avec votre situation réelle.",
  "Une référence rapide pour situer votre net mensuel dans ce cas de figure.",
  "Ce calcul préliminaire donne le ton avant de plonger dans le simulateur complet.",
  "Un repère express pour jauger votre salaire net sans entrer dans le détail.",
  "Cette estimation éclaire votre brut/net en un clin d'oeil, à compléter ensuite.",
  "Un aperçu synthétique pour comprendre ce que deviendra votre brut une fois cotisé.",
];

function pickIntroVariant(slug) {
  var hash = 0;
  for (var i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return INTRO_VARIANTS[Math.abs(hash) % INTRO_VARIANTS.length];
}

function renderMethodologySources() {
  return (
    '\n      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n        <h2 class="text-2xl font-bold text-slate-900">M\u00e9thodologie et sources</h2>\n        <p class="mt-4 text-slate-700 leading-relaxed">\n          ' +
    renderText(
      "Cette estimation repose sur le moteur de calcul brut/net du site et sur des taux de cotisations standards (23% non-cadre, 25% cadre). Elle donne un ordre de grandeur utile avant verification sur votre bulletin de paie.",
    ) +
    '\n        </p>\n        <div class="mt-6 flex flex-wrap gap-3">\n          <a href="/pages/methodologie" class="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-50">Consulter notre m\u00e9thodologie</a>\n          <a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F559" target="_blank" rel="noopener" class="inline-flex rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 font-semibold text-orange-900 transition-colors hover:bg-orange-100">Voir la fiche service-public.fr</a>\n          <a href="https://mon-entreprise.urssaf.fr/simulateurs/salaire-brut-net" target="_blank" rel="noopener" class="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-50">Simulateur URSSAF</a>\n        </div>\n      </section>'
  );
}

function renderComparisonTable(scenario, estimate, relatedPages) {
  var comparable = [Object.assign({}, scenario, { estimate: estimate })];
  for (var i = 0; i < relatedPages.length; i++) {
    if (relatedPages[i] && relatedPages[i].estimate) comparable.push(relatedPages[i]);
  }
  comparable = comparable.slice(0, 4);
  if (comparable.length < 2) return "";

  var mobileCards = "";
  for (var j = 0; j < comparable.length; j++) {
    var page = comparable[j];
    mobileCards +=
      '\n            <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">\n              <a href="/pages/salaire/' +
      escapeAttribute(page.slug) +
      '" class="font-semibold text-slate-900 hover:text-orange-700">' +
      renderText(page.audience || page.title) +
      '</a>\n              <div class="mt-2 text-sm text-slate-700">\n                <div class="flex justify-between"><span>Brut</span><span class="font-semibold text-slate-900">' +
      renderText(page.estimate.formattedBrut) +
      '</span></div>\n                <div class="flex justify-between mt-1"><span>Net avant imp\u00f4t</span><span>' +
      renderText(page.estimate.formattedNet) +
      '</span></div>\n                <div class="flex justify-between mt-1"><span>Statut</span><span>' +
      renderText(STATUT_LABELS[page.input.statut] || page.input.statut) +
      "</span></div>\n              </div>\n            </article>";
  }

  var tableRows = "";
  for (var k = 0; k < comparable.length; k++) {
    var row = comparable[k];
    tableRows +=
      '\n                <tr class="border-b border-slate-100 last:border-0">\n                  <td class="px-2 sm:px-3 md:px-4 py-2 sm:py-3">\n                    <a href="/pages/salaire/' +
      escapeAttribute(row.slug) +
      '" class="text-xs sm:text-sm font-semibold text-slate-900 hover:text-orange-700">' +
      renderText(row.audience || row.title) +
      '</a>\n                  </td>\n                  <td class="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-700">' +
      renderText(row.estimate.formattedBrut) +
      '</td>\n                  <td class="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right font-semibold text-slate-900">' +
      renderText(row.estimate.formattedNet) +
      '</td>\n                  <td class="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-700">' +
      renderText(STATUT_LABELS[row.input.statut] || row.input.statut) +
      "</td>\n                </tr>";
  }

  return (
    '\n      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n        <h2 class="text-2xl font-bold text-slate-900">Comparer plusieurs sc\u00e9narios</h2>\n        <div class="mt-6">\n          <div class="space-y-4 md:hidden">' +
    mobileCards +
    '</div>\n          <div class="hidden md:block mt-4 overflow-x-auto -mx-4 sm:mx-0 rounded-2xl border border-slate-200">\n            <table class="w-full border-collapse text-xs sm:text-sm">\n              <thead class="bg-slate-50">\n                <tr>\n                  <th class="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-slate-700">Sc\u00e9nario</th>\n                  <th class="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right font-semibold text-slate-700">Brut</th>\n                  <th class="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right font-semibold text-slate-700">Net estim\u00e9</th>\n                  <th class="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right font-semibold text-slate-700">Statut</th>\n                </tr>\n              </thead>\n              <tbody>' +
    tableRows +
    "</tbody>\n            </table>\n          </div>\n        </div>\n      </section>"
  );
}

function renderRelatedLinks(relatedPages) {
  if (!relatedPages.length) return "";
  var links = "";
  for (var i = 0; i < relatedPages.length; i++) {
    var page = relatedPages[i];
    links +=
      '\n          <a href="/pages/salaire/' +
      page.slug +
      '" class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-800 transition-colors hover:border-orange-500 hover:bg-orange-50">\n            <span class="font-semibold">' +
      renderText(page.title) +
      "</span>\n          </a>";
  }
  return (
    '\n      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n        <h2 class="text-2xl font-bold text-slate-900">Sc\u00e9narios proches</h2>\n        <div class="mt-4 grid gap-3 sm:grid-cols-2">' +
    links +
    "\n        </div>\n      </section>"
  );
}

export function isGeneratedPseoSalairePage(content) {
  return String(content).includes(GENERATED_MARKER);
}

export function renderSalaireScenarioPage(args) {
  var scenario = args.scenario;
  var estimate = args.estimate;
  var relatedPages = args.relatedPages;
  var generatedAt = args.generatedAt;
  var targetConfig = args.targetConfig;

  var canonicalUrl = DOMAIN + "/pages/salaire/" + scenario.slug;
  var simulatorUrl = buildSalaireSimulatorUrl(scenario.input);

  var faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: scenario.faq.map(function (item) {
      return {
        "@type": "Question",
        name: normalizeFrenchText(item.question),
        acceptedAnswer: { "@type": "Answer", text: normalizeFrenchText(item.answer) },
      };
    }),
  };

  var pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: normalizeFrenchText(scenario.title),
    description: normalizeFrenchText(scenario.description),
    url: canonicalUrl,
    isPartOf: DOMAIN + PILLAR_PATH,
    publisher: { "@type": "Organization", name: "LesCalculateurs.fr", url: DOMAIN },
  };

  var tableRows = [
    ["Salaire brut mensuel", estimate.formattedBrut],
    ["Statut", STATUT_LABELS[scenario.input.statut] || scenario.input.statut],
    ["Net estim\u00e9 avant imp\u00f4t", estimate.formattedNet],
  ]
    .map(function (row) {
      var label = row[0];
      var value = row[1];
      return (
        '\n              <tr class="border-b border-slate-100 last:border-0">\n                <th class="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-medium text-slate-600">' +
        renderText(label) +
        '</th>\n                <td class="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right font-semibold text-slate-900">' +
        renderText(value) +
        "</td>\n              </tr>"
      );
    })
    .join("");

  var faqHtml = scenario.faq
    .map(function (item) {
      return (
        '\n          <details class="group rounded-xl border border-slate-200 bg-slate-50 p-4">\n            <summary class="cursor-pointer list-none font-semibold text-slate-900">' +
        renderText(item.question) +
        '</summary>\n            <p class="mt-3 text-slate-700 leading-relaxed">' +
        renderText(item.answer) +
        "</p>\n          </details>"
      );
    })
    .join("");

  var titleSuffix = "\u2013 Simulation salaire brut/net 2026 | Les Calculateurs";

  var checklistItems = scenario.checklist
    .map(function (item) {
      return '<li class="text-slate-700 leading-relaxed">' + renderText(item) + "</li>";
    })
    .join("");

  return (
    '<!doctype html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>' +
    renderText(scenario.title) +
    " " +
    titleSuffix +
    '</title>\n    <meta name="description" content="' +
    renderText(scenario.description) +
    ' Estimez votre salaire net 2026 gratuitement avec notre simulateur bas\u00e9 sur les bar\u00e8mes URSSAF officiels." />\n    <meta name="robots" content="index, follow" />\n    <meta name="google-adsense-account" content="ca-pub-2209781252231399" />\n    <link rel="canonical" href="' +
    canonicalUrl +
    '" />\n    <meta property="og:url" content="' +
    canonicalUrl +
    '" />\n    <meta property="og:type" content="website" />\n    <meta property="og:title" content="' +
    renderText(scenario.title) +
    " " +
    titleSuffix +
    '" />\n    <meta property="og:description" content="' +
    renderText(scenario.description) +
    ' Estimez votre salaire net 2026 gratuitement avec notre simulateur bas\u00e9 sur les bar\u00e8mes URSSAF officiels." />\n    <meta property="og:image" content="' +
    FAVICON_OG_IMAGE +
    '" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:title" content="' +
    renderText(scenario.title) +
    " " +
    titleSuffix +
    '" />\n    <meta name="twitter:description" content="' +
    renderText(scenario.description) +
    ' Estimez votre salaire net 2026 gratuitement avec notre simulateur bas\u00e9 sur les bar\u00e8mes URSSAF officiels." />\n    <meta name="twitter:image" content="' +
    FAVICON_OG_IMAGE +
    '" />\n    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />\n    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />\n    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />\n    <link rel="manifest" href="/assets/site.webmanifest" />\n    <link rel="shortcut icon" href="/assets/favicon.ico" />\n    <link rel="stylesheet" href="' +
    targetConfig.stylesHref +
    '" />\n    ' +
    renderJsonLd(pageSchema) +
    "\n    " +
    renderJsonLd(faqSchema) +
    '\n    <script defer src="/third-party-loader.js"></script>\n    ' +
    targetConfig.mainScriptTag +
    '\n  </head>\n  <body class="bg-slate-100 text-slate-900" data-lc-page-type="pseo" data-lc-page-cluster="salaire" data-lc-page-template="scenario" data-lc-page-intent="' +
    escapeHtml(scenario.title) +
    '" data-lc-page-audience="' +
    escapeHtml(scenario.audience) +
    '" data-lc-page-variant="salaire-2026">\n    ' +
    GENERATED_MARKER +
    '\n    <div class="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">\n      <div class="mx-auto max-w-5xl">Estimation indicative. Le montant r\u00e9el figure sur votre bulletin de paie.</div>\n    </div>\n    <header class="border-b border-slate-200 bg-white">\n      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">\n        <a href="/" class="text-lg font-bold text-slate-900">Les Calculateurs</a>\n        <nav class="flex gap-4 text-sm text-slate-600">\n          <a href="/">Accueil</a>\n          <a href="' +
    PILLAR_PATH +
    '">Simulateur Brut/Net</a>\n        </nav>\n      </div>\n    </header>\n    <main class="mx-auto max-w-5xl px-4 py-10">\n      <section class="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-800 px-6 py-10 text-white shadow-xl ring-1 ring-white/10">\n        <p class="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200">Estimation indicative 2026</p>\n        <h1 class="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">' +
    renderText(scenario.title) +
    '</h1>\n        <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-100">' +
    renderText(scenario.description + " " + pickIntroVariant(scenario.slug)) +
    '</p>\n        <div class="mt-8 flex flex-wrap gap-3">\n          <a href="' +
    simulatorUrl +
    '" class="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-400">Ouvrir le simulateur complet</a>\n          <a href="#hypotheses" class="rounded-xl border border-white/30 bg-white/5 px-5 py-3 font-semibold text-white transition-colors hover:bg-white/15">Voir les hypoth\u00e8ses</a>\n        </div>\n      </section>\n\n      <section class="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">\n        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n          <h2 class="text-2xl font-bold text-slate-900">Estimation rapide</h2>\n          <p class="mt-4 text-lg leading-relaxed text-slate-700">' +
    renderText(
      "Pour un brut de " +
        estimate.formattedBrut +
        ", le net avant imp\u00f4t est estim\u00e9 \u00e0 " +
        estimate.formattedNet +
        " par mois pour ce sc\u00e9nario type.",
    ) +
    '</p>\n          <p class="mt-4 text-slate-700 leading-relaxed">' +
    renderText("Cette estimation correspond \u00e0 un profil type : " + scenario.audience + ".") +
    '</p>\n          <div class="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">\n            <p class="text-sm font-semibold uppercase tracking-wide text-blue-700">R\u00e9sultat estim\u00e9</p>\n            <p class="mt-2 text-2xl font-bold text-slate-900">' +
    renderText(estimate.formattedNet) +
    ' / mois</p>\n            <p class="mt-2 text-sm text-slate-700">Net avant imp\u00f4t (' +
    renderText(STATUT_LABELS[scenario.input.statut] || scenario.input.statut) +
    ')</p>\n          </div>\n        </article>\n        <aside class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n          <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Profil</p>\n          <p class="mt-3 text-lg font-semibold text-slate-950">' +
    renderText(scenario.audience) +
    '</p>\n          <p class="mt-3 text-sm leading-relaxed text-slate-600">' +
    renderText(scenario.summary) +
    '</p>\n        </aside>\n      </section>\n\n      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n        <h2 class="text-2xl font-bold text-slate-900">Sc\u00e9nario utilis\u00e9 pour cette estimation</h2>\n        <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">\n          <table class="min-w-full border-collapse text-sm"><tbody>' +
    tableRows +
    '</tbody></table>\n        </div>\n      </section>\n\n      <section id="hypotheses" class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n        <h2 class="text-2xl font-bold text-slate-900">Hypoth\u00e8ses importantes</h2>\n        <ul class="mt-6 list-disc space-y-3 pl-5">\n          ' +
    checklistItems +
    "\n        </ul>\n      </section>\n\n      " +
    renderMethodologySources() +
    "\n      " +
    renderComparisonTable(scenario, estimate, relatedPages) +
    "\n      " +
    renderRelatedLinks(relatedPages) +
    '\n\n      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n        <h2 class="text-2xl font-bold text-slate-900">Questions fr\u00e9quentes</h2>\n        <div class="mt-5 space-y-4">' +
    faqHtml +
    '</div>\n      </section>\n\n      <section class="mt-8 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 shadow-sm">\n        <h2 class="text-2xl font-bold text-slate-900">Aller plus loin</h2>\n        <p class="mt-4 text-slate-700 leading-relaxed">' +
    renderText(
      "Utilisez le simulateur complet pour ajouter votre taux de pr\u00e9l\u00e8vement \u00e0 la source et obtenir une estimation personnalis\u00e9e.",
    ) +
    '</p>\n        <a href="' +
    simulatorUrl +
    '" class="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700">Calculer mon salaire net</a>\n        <p class="mt-4 text-sm text-slate-600">Derni\u00e8re modification : ' +
    renderText(generatedAt) +
    "</p>\n      </section>\n    </main>\n  </body>\n</html>"
  );
}
