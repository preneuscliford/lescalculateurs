const DOMAIN = "https://www.lescalculateurs.fr";
const PILLAR_PATH = "/pages/notaire";
const GENERATED_MARKER = "<!-- GENERATED:PSEO:NOTAIRE -->";
const FAVICON_OG_IMAGE = `${DOMAIN}/assets/favicon-32x32.png`;

const TYPE_LABELS = {
  ancien: "Ancien",
  neuf: "Neuf",
  terrain: "Terrain à bâtir",
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function encodeHtmlEntities(value) {
  return String(value).replace(/[^\x20-\x7E]/g, (char) => `&#${char.charCodeAt(0)};`);
}

function normalizeFrenchText(value) {
  return String(value)
    .replace(/\bscenario\b/gi, "scénario")
    .replace(/\bscenarios\b/gi, "scénarios")
    .replace(/\ba\b/gi, "à")
    .replace(/\babattement\b/gi, "abattement")
    .replace(/\bemoluments\b/gi, "émoluments")
    .replace(/\bdebours\b/gi, "débours");
}

function renderText(value) {
  return encodeHtmlEntities(escapeHtml(normalizeFrenchText(value)));
}

function renderAttributeText(value) {
  return encodeHtmlEntities(escapeHtml(normalizeFrenchText(value)));
}

function renderJsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(
    /[^\x20-\x7E]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  )}</script>`;
}

export function isGeneratedPseoNotairePage(content) {
  return String(content).includes(GENERATED_MARKER);
}

function buildNotaireSimulatorUrl(input) {
  const params = new URLSearchParams();
  params.set("notaire-prix", String(input.prix));
  params.set("notaire-type", input.type);
  params.set("notaire-departement", input.departement);
  params.set("notaire-autosubmit", "1");
  return PILLAR_PATH + "?" + params.toString() + "#notaire-form";
}

function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return day + "-" + month + "-" + year;
}

export function renderNotaireScenarioPage({
  scenario,
  estimate,
  relatedPages,
  generatedAt,
  targetConfig,
}) {
  const simulatorUrl = buildNotaireSimulatorUrl(scenario.input);
  const canonicalUrl = DOMAIN + "/pages/notaire/" + scenario.slug;
  const faqEntities = (scenario.faq || []).map(function (item) {
    return {
      "@type": "Question",
      name: normalizeFrenchText(item.question),
      acceptedAnswer: { "@type": "Answer", text: normalizeFrenchText(item.answer) },
    };
  });

  var relatedHtml = "";
  if (relatedPages && relatedPages.length > 0) {
    var items = relatedPages.map(function (page) {
      var url = "/pages/notaire/" + page.slug;
      return (
        '<li><a href="' +
        url +
        '" class="text-emerald-700 underline hover:text-emerald-800">' +
        renderText(page.title) +
        "</a></li>"
      );
    });
    relatedHtml = '<ul class="mt-4 space-y-2">' + items.join("") + "</ul>";
  }

  const checklist = scenario.checklist
    .map(function (item) {
      if (typeof item === "object" && item.comparisonSlug) {
        return (
          '          <li class="rounded-xl bg-slate-50 px-4 py-3"><a href="/pages/notaire/' +
          item.comparisonSlug +
          '" class="text-blue-700 underline hover:text-blue-800 font-semibold">' +
          renderText(item.text) +
          "</a></li>\n"
        );
      }
      return (
        '          <li class="rounded-xl bg-slate-50 px-4 py-3">' + renderText(item) + "</li>\n"
      );
    })
    .join("");

  var comparisonsHtml = "";
  if (scenario.comparisons && scenario.comparisons.length > 0) {
    var compItems = scenario.comparisons.map(function (comp) {
      return (
        '<li><a href="/pages/notaire/' +
        comp.slug +
        '" class="text-blue-700 underline hover:text-blue-800 font-semibold">' +
        comp.text +
        "</a></li>"
      );
    });
    comparisonsHtml =
      '      <section class="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">\n' +
      '        <h2 class="text-2xl font-bold text-slate-900">Comparaisons utiles</h2>\n' +
      '        <p class="mt-2 text-sm text-slate-600">Explorez les différences de coûts entre différents types de biens :</p>\n' +
      '        <ul class="mt-4 space-y-2 text-slate-700">\n' +
      "          " +
      compItems.join("\n          ") +
      "\n" +
      "        </ul>\n" +
      "      </section>\n" +
      "\n";
  }

  return (
    '<!doctype html>\n<html lang="fr">\n' +
    "  <head>\n" +
    '    <meta charset="UTF-8" />\n' +
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
    "    <title>" +
    renderText(scenario.title) +
    "</title>\n" +
    '    <meta name="description" content="' +
    renderAttributeText(scenario.description) +
    '" />\n' +
    '    <meta name="robots" content="index,follow" />\n' +
    '    <meta name="google-adsense-account" content="ca-pub-2209781252231399" />\n' +
    '    <link rel="canonical" href="' +
    canonicalUrl +
    '" />\n' +
    '    <meta property="og:type" content="article" />\n' +
    '    <meta property="og:title" content="' +
    renderAttributeText(scenario.title) +
    '" />\n' +
    '    <meta property="og:description" content="' +
    renderAttributeText(scenario.description) +
    '" />\n' +
    '    <meta property="og:url" content="' +
    canonicalUrl +
    '" />\n' +
    '    <meta property="og:image" content="' +
    FAVICON_OG_IMAGE +
    '" />\n' +
    '    <meta name="twitter:card" content="summary_large_image" />\n' +
    '    <meta name="twitter:title" content="' +
    renderAttributeText(scenario.title) +
    '" />\n' +
    '    <meta name="twitter:description" content="' +
    renderAttributeText(scenario.description) +
    '" />\n' +
    '    <meta name="twitter:image" content="' +
    FAVICON_OG_IMAGE +
    '" />\n' +
    '    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />\n' +
    '    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />\n' +
    '    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />\n' +
    '    <link rel="manifest" href="/assets/site.webmanifest" />\n' +
    '    <link rel="shortcut icon" href="/assets/favicon.ico" />\n' +
    '    <link rel="stylesheet" href="' +
    targetConfig.stylesHref +
    '" />\n' +
    '    <script defer src="/third-party-loader.js"></script>\n' +
    targetConfig.mainScriptTag +
    "\n" +
    renderJsonLd({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: DOMAIN + "/" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Frais de notaire",
          item: DOMAIN + PILLAR_PATH,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: normalizeFrenchText(scenario.title),
          item: canonicalUrl,
        },
      ],
    }) +
    "\n" +
    (faqEntities.length > 0
      ? renderJsonLd({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqEntities,
        })
      : "") +
    "\n" +
    renderJsonLd({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: normalizeFrenchText(scenario.title),
      description: normalizeFrenchText(scenario.description),
      url: canonicalUrl,
      isPartOf: DOMAIN + PILLAR_PATH,
      inLanguage: "fr-FR",
      author: {
        "@type": "Organization",
        name: "LesCalculateurs.fr",
        url: DOMAIN,
      },
      publisher: {
        "@type": "Organization",
        name: "LesCalculateurs.fr",
        url: DOMAIN,
        logo: {
          "@type": "ImageObject",
          url: FAVICON_OG_IMAGE,
        },
      },
    }) +
    "\n" +
    "  </head>\n" +
    '  <body class="bg-slate-50 text-slate-900" data-lc-page-type="pseo" data-lc-page-cluster="notaire" data-lc-page-slug="' +
    escapeHtml(scenario.slug) +
    '" data-lc-page-template="scenario" data-lc-page-intent="' +
    escapeHtml(scenario.title) +
    '" data-lc-page-audience="' +
    escapeHtml(scenario.audience) +
    '" data-lc-page-variant="notaire-2026">\n' +
    "    " +
    GENERATED_MARKER +
    "\n" +
    '    <div class="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">\n' +
    '      <div class="mx-auto max-w-5xl">\n' +
    "        Estimation indicative. Vérification finale à faire au moment de la signature chez le notaire.\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    '    <header class="border-b border-slate-200 bg-white">\n' +
    '      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">\n' +
    '        <a href="/" class="text-lg font-bold text-slate-900">Les Calculateurs</a>\n' +
    '        <nav class="flex gap-4 text-sm text-slate-600">\n' +
    '          <a href="/">Accueil</a>\n' +
    '          <a href="' +
    PILLAR_PATH +
    '">Simulateur frais de notaire</a>\n' +
    "        </nav>\n" +
    "      </div>\n" +
    "    </header>\n" +
    "\n" +
    '    <main class="mx-auto max-w-5xl px-4 py-10">\n' +
    '      <section class="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-700 px-6 py-10 text-white shadow-xl ring-1 ring-white/10">\n' +
    '        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Frais de notaire 2026</p>\n' +
    '        <h1 class="mt-3 text-3xl font-black leading-tight sm:text-4xl">' +
    renderText(scenario.title) +
    "</h1>\n" +
    '        <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-200">' +
    renderText(scenario.summary) +
    "</p>\n" +
    '        <div class="mt-6 flex flex-wrap gap-3">\n' +
    '          <a href="' +
    simulatorUrl +
    '" class="inline-flex items-center rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-blue-50">Lancer le calcul frais de notaire</a>\n' +
    '          <a href="#hypotheses" class="inline-flex items-center rounded-xl border border-white/25 px-5 py-3 font-semibold text-white hover:bg-white/10">Voir les hypothèses</a>\n' +
    "        </div>\n" +
    '        <p class="mt-4 text-sm text-blue-100">Dernière modification : ' +
    escapeHtml(generatedAt) +
    "</p>\n" +
    "      </section>\n" +
    "\n" +
    '      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n' +
    '        <h2 class="text-2xl font-bold text-slate-900">Estimation rapide</h2>\n' +
    '        <p class="mt-4 text-slate-700">Montant indicatif des frais de notaire : <strong>' +
    renderText(estimate.formattedTotal) +
    "</strong>.</p>\n" +
    '        <p class="mt-3 text-slate-600">Cette estimation est calculée selon les barèmes en vigueur pour 2026. Le montant réel peut varier selon le département et les particularités de la transaction.</p>\n' +
    "      </section>\n" +
    "\n" +
    '      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n' +
    '        <h2 class="text-2xl font-bold text-slate-900">Scénario utilisé pour cette estimation</h2>\n' +
    '        <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">\n' +
    '          <table class="min-w-full border-collapse text-sm">\n' +
    "            <tbody>\n" +
    '              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Profil</th><td class="px-4 py-3 text-slate-800">' +
    renderText(scenario.audience) +
    "</td></tr>\n" +
    '              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Prix du bien</th><td class="px-4 py-3 text-slate-800">' +
    renderText(estimate.formattedPrice) +
    "</td></tr>\n" +
    '              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Type</th><td class="px-4 py-3 text-slate-800">' +
    renderText(TYPE_LABELS[scenario.input.type] || scenario.input.type) +
    "</td></tr>\n" +
    '              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Département</th><td class="px-4 py-3 text-slate-800">' +
    renderText(scenario.input.departement) +
    "</td></tr>\n" +
    '              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Droits de mutation</th><td class="px-4 py-3 text-slate-800">' +
    renderText(estimate.formattedDmto) +
    "</td></tr>\n" +
    '              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Émoluments du notaire</th><td class="px-4 py-3 text-slate-800">' +
    renderText(estimate.formattedEmoluments) +
    "</td></tr>\n" +
    '              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Frais divers (CSI, débours, formalités)</th><td class="px-4 py-3 text-slate-800">' +
    renderText(estimate.formattedFees) +
    "</td></tr>\n" +
    '              <tr><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Total frais de notaire</th><td class="px-4 py-3 text-slate-900 font-semibold">' +
    renderText(estimate.formattedTotal) +
    "</td></tr>\n" +
    "            </tbody>\n" +
    "          </table>\n" +
    "        </div>\n" +
    "      </section>\n" +
    "\n" +
    '      <section id="hypotheses" class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n' +
    '        <h2 class="text-2xl font-bold text-slate-900">Hypothèses importantes</h2>\n' +
    '        <ul class="mt-4 space-y-3 text-slate-700">\n' +
    checklist +
    "        </ul>\n" +
    "      </section>\n" +
    "\n" +
    comparisonsHtml +
    "\n" +
    '      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n' +
    '        <h2 class="text-2xl font-bold text-slate-900">Méthode et sources</h2>\n' +
    '        <p class="mt-4 text-slate-700">Cette estimation est basée sur les barèmes officiels 2026 de frais de notaire en vigueur pour tous les notaires de France. Elle intègre le calcul des droits de mutation (DMTO), des émoluments réglementés, de la contribution de sécurité immobilière (CSI), des débours et des formalités.</p>\n' +
    '        <ul class="mt-4 space-y-2 text-slate-600 text-sm">\n' +
    '          <li class="flex items-start"><span class="mr-3 text-emerald-600">✓</span> Droits de mutation : varient selon le département (5,09 % à 6,32 %)</li>\n' +
    '          <li class="flex items-start"><span class="mr-3 text-emerald-600">✓</span> Émoluments du notaire : barème national fixe réglementé</li>\n' +
    '          <li class="flex items-start"><span class="mr-3 text-emerald-600">✓</span> CSI et débours : calculés selon la nature du bien et du département</li>\n' +
    "        </ul>\n" +
    '        <div class="mt-6 flex flex-wrap gap-3">\n' +
    '          <a href="/pages/methodologie" class="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 hover:bg-slate-50">Notre méthodologie frais de notaire</a>\n' +
    '          <a href="https://www.notaires.fr/fr/accueil" target="_blank" rel="noopener" class="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 hover:bg-slate-50">Guide officiel des notaires de France</a>\n' +
    "        </div>\n" +
    "      </section>\n" +
    "\n" +
    '      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n' +
    '        <h2 class="text-2xl font-bold text-slate-900">Aller plus loin</h2>\n' +
    '        <p class="mt-4 text-slate-700">Ce scénario vous a aidé à estimer les frais de notaire pour cette situation type. Utilisez notre simulateur complet pour obtenir une estimation adaptée à votre achat immobilier spécifique.</p>\n' +
    '        <div class="mt-6">\n' +
    '          <a href="' +
    PILLAR_PATH +
    '" class="inline-flex items-center rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800">Lancer le simulateur frais de notaire</a>\n' +
    "        </div>\n" +
    (relatedHtml
      ? '        <div class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 class="text-xl font-bold text-slate-900">Scénarios similaires</h2>' +
        relatedHtml +
        "</div>\n"
      : "") +
    "      </section>\n" +
    "    </main>\n" +
    "\n" +
    '    <footer class="border-t border-slate-200 bg-white">\n' +
    '      <div class="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">\n' +
    '        <p class="text-sm text-slate-500">© 2026 Les Calculateurs</p>\n' +
    '        <nav class="flex gap-4 text-sm text-slate-500">\n' +
    '          <a href="/pages/mentions-legales" class="hover:text-slate-700">Mentions légales</a>\n' +
    '          <a href="/pages/contact" class="hover:text-slate-700">Contact</a>\n' +
    "        </nav>\n" +
    "      </div>\n" +
    "    </footer>\n" +
    '    <script type="module" src="/main.ts"></script>\n' +
    "  </body>\n" +
    "</html>\n"
  );
}
