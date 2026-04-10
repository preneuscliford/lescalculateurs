const DOMAIN = "https://www.lescalculateurs.fr";
const PILLAR_PATH = "/pages/impot";
const GENERATED_MARKER = "<!-- GENERATED:PSEO:IMPOT -->";
const FAVICON_OG_IMAGE = `${DOMAIN}/assets/favicon-32x32.png`;

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

function renderText(value) {
  return encodeHtmlEntities(escapeHtml(value));
}

function renderAttributeText(value) {
  return encodeHtmlEntities(escapeHtml(value));
}

function renderJsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(
    /[^\x20-\x7E]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  )}</script>`;
}

function buildSimulatorUrl(input) {
  const params = new URLSearchParams();
  params.set("revenu", String(input.revenu));
  params.set("parts", String(input.parts));
  params.set("autosubmit", "1");
  return `${PILLAR_PATH}?${params.toString()}#impot-calculator`;
}

export function isGeneratedPseoImpotPage(content) {
  return String(content).includes(GENERATED_MARKER);
}

export function renderImpotScenarioPage({
  scenario,
  estimate,
  relatedPages,
  generatedAt,
  targetConfig,
}) {
  const simulatorUrl = buildSimulatorUrl(scenario.input);
  const canonicalUrl = `${DOMAIN}/pages/impot/${scenario.slug}`;
  const faqEntities = (scenario.faq || []).map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  }));

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${renderText(scenario.title)}</title>
    <meta name="description" content="${renderAttributeText(scenario.description)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${renderAttributeText(scenario.title)}" />
    <meta property="og:description" content="${renderAttributeText(scenario.description)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${FAVICON_OG_IMAGE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${renderAttributeText(scenario.title)}" />
    <meta name="twitter:description" content="${renderAttributeText(scenario.description)}" />
    <meta name="twitter:image" content="${FAVICON_OG_IMAGE}" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />
    <link rel="shortcut icon" href="/assets/favicon.ico" />
    <link rel="stylesheet" href="${targetConfig.stylesHref}" />
    <script defer src="/third-party-loader.js"></script>
    ${targetConfig.mainScriptTag}
    ${renderJsonLd({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: `${DOMAIN}/` },
        { "@type": "ListItem", position: 2, name: "Imp\u00f4t", item: `${DOMAIN}${PILLAR_PATH}` },
        { "@type": "ListItem", position: 3, name: scenario.title, item: canonicalUrl },
      ],
    })}
    ${renderJsonLd({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqEntities,
    })}
  </head>
  <body class="bg-slate-50 text-slate-900" data-lc-page-type="pseo" data-lc-page-cluster="impot" data-lc-page-slug="${escapeHtml(scenario.slug)}">
    ${GENERATED_MARKER}
    <main class="mx-auto max-w-5xl px-4 py-10">
      <section class="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-900 to-blue-700 px-6 py-10 text-white shadow-xl ring-1 ring-white/10">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Imp&ocirc;t sur le revenu 2026</p>
        <h1 class="mt-3 text-3xl font-black leading-tight sm:text-4xl">${renderText(scenario.title)}</h1>
        <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-200">${renderText(scenario.summary)}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="${simulatorUrl}" class="inline-flex items-center rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-blue-50">Ouvrir le simulateur imp&ocirc;t complet</a>
          <a href="#hypotheses" class="inline-flex items-center rounded-xl border border-white/25 px-5 py-3 font-semibold text-white hover:bg-white/10">Voir les hypoth&egrave;ses</a>
        </div>
        <p class="mt-4 text-sm text-blue-100">Derni&egrave;re modification : ${escapeHtml(generatedAt)}</p>
      </section>

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Estimation rapide</h2>
        <p class="mt-4 text-slate-700">Montant indicatif autour de <strong>${renderText(estimate.formattedAmount)}</strong> par an pour ce sc&eacute;nario.</p>
        <p class="mt-3 text-slate-600">Taux moyen estim&eacute; : <strong>${renderText(estimate.formattedTauxMoyen)}</strong> | Taux marginal estim&eacute; : <strong>${renderText(estimate.formattedTauxMarginal)}</strong>.</p>
        <p class="mt-3 text-slate-600">Mensualit&eacute; moyenne indicative : <strong>${renderText(estimate.formattedMensualite)}</strong>.</p>
      </section>

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Sc&eacute;nario utilis&eacute;</h2>
        <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table class="min-w-full border-collapse text-sm">
            <tbody>
              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Profil</th><td class="px-4 py-3 text-slate-800">${renderText(scenario.audience)}</td></tr>
              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Revenu imposable</th><td class="px-4 py-3 text-slate-800">${renderText(estimate.formattedRevenu)}</td></tr>
              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Nombre de parts</th><td class="px-4 py-3 text-slate-800">${renderText(estimate.formattedParts)}</td></tr>
              <tr><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Imp&ocirc;t estim&eacute;</th><td class="px-4 py-3 text-slate-900 font-semibold">${renderText(estimate.formattedAmount)}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="hypotheses" class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Hypoth&egrave;ses importantes</h2>
        <ul class="mt-4 space-y-3 text-slate-700">
          ${scenario.checklist.map((item) => `<li class="rounded-xl bg-slate-50 px-4 py-3">${renderText(item)}</li>`).join("")}
        </ul>
      </section>

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Questions fr&eacute;quentes</h2>
        <div class="mt-6 space-y-4">
          ${scenario.faq
            .map(
              (item) => `<article class="rounded-xl border border-slate-200 p-4"><h3 class="font-semibold text-slate-900">${renderText(item.question)}</h3><p class="mt-2 text-slate-700">${renderText(item.answer)}</p></article>`,
            )
            .join("")}
        </div>
      </section>

      ${
        relatedPages.length
          ? `<section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 class="text-2xl font-bold text-slate-900">Sc&eacute;narios proches</h2><div class="mt-4 grid gap-3 sm:grid-cols-2">${relatedPages
              .map(
                (page) =>
                  `<a href="/pages/impot/${page.slug}" class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-800 hover:border-blue-400 hover:bg-blue-50"><span class="font-semibold">${renderText(page.title)}</span></a>`,
              )
              .join("")}</div></section>`
          : ""
      }

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Aller plus loin</h2>
        <p class="mt-4 text-slate-700">Utilisez le simulateur principal pour personnaliser votre estimation selon votre revenu, vos parts et votre situation exacte.</p>
        <div class="mt-6">
          <a href="${simulatorUrl}" class="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">Lancer la simulation imp&ocirc;t compl&egrave;te</a>
        </div>
      </section>
    </main>
  </body>
</html>`;
}
