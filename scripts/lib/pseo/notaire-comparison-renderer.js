const DOMAIN = "https://www.lescalculateurs.fr";
const PILLAR_PATH = "/pages/notaire";
const GENERATED_MARKER = "<!-- GENERATED:PSEO:NOTAIRE:COMPARISON -->";
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

export function isGeneratedPseoNotaireComparison(content) {
  return String(content).includes(GENERATED_MARKER);
}

function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return day + "-" + month + "-" + year;
}

export function renderNotaireComparisonPage({
  comparison,
  scenario1,
  estimate1,
  scenario2,
  estimate2,
  generatedAt,
  targetConfig,
}) {
  const canonicalUrl = DOMAIN + "/pages/notaire/" + comparison.slug;

  const tableRows = [
    {
      label: "Prix du bien",
      value1: estimate1.formattedPrice,
      value2: estimate2.formattedPrice,
    },
    {
      label: "Type de bien",
      value1: TYPE_LABELS[scenario1.input.type] || scenario1.input.type,
      value2: TYPE_LABELS[scenario2.input.type] || scenario2.input.type,
    },
    {
      label: "Droits de mutation",
      value1: estimate1.formattedDmto,
      value2: estimate2.formattedDmto,
    },
    {
      label: "Émoluments notaire",
      value1: estimate1.formattedEmoluments,
      value2: estimate2.formattedEmoluments,
    },
    {
      label: "Frais divers",
      value1: estimate1.formattedFees,
      value2: estimate2.formattedFees,
    },
    {
      label: "Total frais de notaire",
      value1: estimate1.formattedTotal,
      value2: estimate2.formattedTotal,
      isTotal: true,
    },
  ];

  const tableRowsHtml = tableRows
    .map(function (row) {
      const isBold = row.isTotal ? " font-bold text-slate-900" : "";
      const totalClass = row.isTotal ? " bg-emerald-50" : "";
      return (
        '              <tr class="border-b border-slate-100' +
        totalClass +
        '">' +
        '<th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">' +
        renderText(row.label) +
        "</th>" +
        '<td class="px-4 py-3 text-slate-800' +
        isBold +
        '">' +
        renderText(row.value1) +
        "</td>" +
        '<td class="px-4 py-3 text-slate-800' +
        isBold +
        '">' +
        renderText(row.value2) +
        "</td>" +
        "</tr>\n"
      );
    })
    .join("");

  return (
    '<!doctype html>\n<html lang="fr">\n' +
    "  <head>\n" +
    '    <meta charset="UTF-8" />\n' +
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
    "    <title>" +
    renderText(comparison.title) +
    "</title>\n" +
    '    <meta name="description" content="' +
    renderAttributeText(comparison.description) +
    '" />\n' +
    '    <meta name="robots" content="index,follow" />\n' +
    '    <meta name="google-adsense-account" content="ca-pub-2209781252231399" />\n' +
    '    <link rel="canonical" href="' +
    canonicalUrl +
    '" />\n' +
    '    <meta property="og:type" content="article" />\n' +
    '    <meta property="og:title" content="' +
    renderAttributeText(comparison.title) +
    '" />\n' +
    '    <meta property="og:description" content="' +
    renderAttributeText(comparison.description) +
    '" />\n' +
    '    <meta property="og:url" content="' +
    canonicalUrl +
    '" />\n' +
    '    <meta property="og:image" content="' +
    FAVICON_OG_IMAGE +
    '" />\n' +
    '    <meta name="twitter:card" content="summary_large_image" />\n' +
    '    <meta name="twitter:title" content="' +
    renderAttributeText(comparison.title) +
    '" />\n' +
    '    <meta name="twitter:description" content="' +
    renderAttributeText(comparison.description) +
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
          name: normalizeFrenchText(comparison.title),
          item: canonicalUrl,
        },
      ],
    }) +
    "\n" +
    renderJsonLd({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: normalizeFrenchText(comparison.title),
      description: normalizeFrenchText(comparison.description),
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
    '  <body class="bg-slate-50 text-slate-900" data-lc-page-type="pseo" data-lc-page-cluster="notaire-comparison" data-lc-page-slug="' +
    escapeHtml(comparison.slug) +
    '" data-lc-page-template="comparison" data-lc-page-intent="' +
    escapeHtml(comparison.title) +
    '" data-lc-page-audience="Acheteur comparant frais de notaire" data-lc-page-variant="notaire-2026">\n' +
    "    " +
    GENERATED_MARKER +
    "\n" +
    '    <div class="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">\n' +
    '      <div class="mx-auto max-w-5xl">\n' +
    "        Estimations indicatives. Les frais réels dépendent du département et des particularités du bien.\n" +
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
    '      <section class="rounded-3xl bg-gradient-to-br from-slate-950 via-purple-900 to-indigo-700 px-6 py-10 text-white shadow-xl ring-1 ring-white/10">\n' +
    '        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-purple-200">Comparaison frais de notaire 2026</p>\n' +
    '        <h1 class="mt-3 text-3xl font-black leading-tight sm:text-4xl">' +
    renderText(comparison.title) +
    "</h1>\n" +
    '        <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-200">' +
    renderText(comparison.summary) +
    "</p>\n" +
    '        <p class="mt-4 text-sm text-purple-100">Dernière modification : ' +
    escapeHtml(generatedAt) +
    "</p>\n" +
    "      </section>\n" +
    "\n" +
    '      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n' +
    '        <h2 class="text-2xl font-bold text-slate-900">Comparaison détaillée</h2>\n' +
    '        <p class="mt-2 text-slate-600">Découvrez les différences de coûts notariés entre les deux scénarios :</p>\n' +
    '        <div class="mt-6 overflow-x-auto rounded-2xl border border-slate-200">\n' +
    '          <table class="min-w-full border-collapse text-sm">\n' +
    "            <thead>\n" +
    '              <tr class="bg-slate-100"><th class="px-4 py-3 text-left font-semibold text-slate-700">Élément</th><th class="px-4 py-3 text-left font-semibold text-slate-700">' +
    renderText(
      scenario1.input.type === "ancien"
        ? "Bien ancien"
        : scenario1.input.type === "neuf"
          ? "Bien neuf"
          : "Terrain",
    ) +
    '</th><th class="px-4 py-3 text-left font-semibold text-slate-700">' +
    renderText(
      scenario2.input.type === "ancien"
        ? "Bien ancien"
        : scenario2.input.type === "neuf"
          ? "Bien neuf"
          : "Terrain",
    ) +
    "</th></tr>\n" +
    "            </thead>\n" +
    "            <tbody>\n" +
    tableRowsHtml +
    "            </tbody>\n" +
    "          </table>\n" +
    "        </div>\n" +
    "      </section>\n" +
    "\n" +
    '      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n' +
    '        <h2 class="text-2xl font-bold text-slate-900">Analyse comparative</h2>\n' +
    '        <p class="mt-4 text-slate-700">Cette comparaison montre comment les frais de notaire varient selon le type de bien. Les principales différences proviennent des droits de mutation (DMTO) qui sont sensiblement différents entre l\'ancien, le neuf et les terrains à bâtir.</p>\n' +
    '        <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">\n' +
    '          <div class="rounded-xl border border-slate-200 p-4">\n' +
    '            <h3 class="font-bold text-slate-900">' +
    renderText(scenario1.audience) +
    "</h3>\n" +
    '            <p class="mt-2 text-sm text-slate-600">Frais de notaire : ' +
    renderText(estimate1.formattedTotal) +
    "</p>\n" +
    '            <a href="/pages/notaire/' +
    scenario1.slug +
    '" class="mt-3 inline-block text-blue-700 underline hover:text-blue-800">Voir le détail complet →</a>\n' +
    "          </div>\n" +
    '          <div class="rounded-xl border border-slate-200 p-4">\n' +
    '            <h3 class="font-bold text-slate-900">' +
    renderText(scenario2.audience) +
    "</h3>\n" +
    '            <p class="mt-2 text-sm text-slate-600">Frais de notaire : ' +
    renderText(estimate2.formattedTotal) +
    "</p>\n" +
    '            <a href="/pages/notaire/' +
    scenario2.slug +
    '" class="mt-3 inline-block text-blue-700 underline hover:text-blue-800">Voir le détail complet →</a>\n' +
    "          </div>\n" +
    "        </div>\n" +
    "      </section>\n" +
    "\n" +
    '      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n' +
    '        <h2 class="text-2xl font-bold text-slate-900">Aller plus loin</h2>\n' +
    '        <p class="mt-4 text-slate-700">Utilisez notre simulateur complet pour calculer précisément vos frais de notaire selon votre situation personnelle, votre région et le type de bien visé.</p>\n' +
    '        <div class="mt-6">\n' +
    '          <a href="' +
    PILLAR_PATH +
    '" class="inline-flex items-center rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800">Lancer le simulateur frais de notaire</a>\n' +
    "        </div>\n" +
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
