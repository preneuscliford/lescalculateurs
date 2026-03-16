const DOMAIN = "https://www.lescalculateurs.fr";
const PILLAR_PATH = "/pages/simulateurs/quelle-aide-selon-mon-profil-2026";
const GENERATED_MARKER = "<!-- GENERATED:PSEO:SIMULATEURS -->";
const FAVICON_OG_IMAGE = `${DOMAIN}/assets/favicon-32x32.png`;
const ACTIVITE_LABELS = {
  actif: 'En activite',
  inactif: 'Sans activite',
  chomage: 'Chomage',
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
    .replace(/\bVerifier\b/g, "V\u00e9rifier")
    .replace(/\bverifier\b/g, "v\u00e9rifier")
    .replace(/\brenseigne\b/g, "renseign\u00e9")
    .replace(/\bresultats\b/g, "r\u00e9sultats")
    .replace(/\bentree\b/g, "entr\u00e9e")
    .replace(/\bpriorite\b/g, "priorit\u00e9")
    .replace(/\bRepere\b/g, "Rep\u00e8re")
    .replace(/\brepere\b/g, "rep\u00e8re")
    .replace(/\bapres\b/g, "apr\u00e8s")
    .replace(/\bchomage\b/g, "ch\u00f4mage")
    .replace(/\bactivite\b/g, "activit\u00e9")
    .replace(/\bactivites\b/g, "activit\u00e9s")
    .replace(/\bpercue\b/g, "per\u00e7ue")
    .replace(/\bpercus\b/g, "per\u00e7us")
    .replace(/\bresiduelle\b/g, "r\u00e9siduelle")
    .replace(/\bdepend\b/g, "d\u00e9pend")
    .replace(/\bisole\b/g, "isol\u00e9")
    .replace(/\ba tester\b/g, "\u00e0 tester")
    .replace(/\ba verifier\b/g, "\u00e0 v\u00e9rifier");
}

function renderText(value) {
  return encodeHtmlEntities(escapeHtml(normalizeFrenchText(value)));
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
  params.set("ma-situation", input.situation);
  params.set("ma-enfants", String(input.enfants));
  params.set("ma-revenus", String(input.revenus));
  params.set("ma-revenus-pro", String(input.revenusPro));
  params.set("ma-autres-revenus", String(input.autresRevenus));
  params.set("ma-loyer", String(input.loyer));
  params.set("ma-region", input.region);
  params.set("ma-logement", input.logement);
  params.set("ma-activite", input.activite);
  params.set("ma-type-activite", input.typeActivite);
  params.set("ma-autosubmit", "1");
  return `${PILLAR_PATH}?${params.toString()}#simulateur-global`;
}

function humanizeActivite(value) {
  return ACTIVITE_LABELS[value] || value;
}

export function isGeneratedPseoSimulateursPage(content) {
  return String(content).includes(GENERATED_MARKER);
}

export function renderSimulateursScenarioPage({
  scenario,
  estimates,
  relatedPages,
  generatedAt,
  targetConfig,
}) {
  const simulatorUrl = buildSimulatorUrl(scenario.input);
  const canonicalUrl = `${DOMAIN}/pages/simulateurs/${scenario.slug}`;
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
        { "@type": "ListItem", position: 2, name: "Simulateurs", item: `${DOMAIN}/pages/simulateurs` },
        { "@type": "ListItem", position: 3, name: scenario.title, item: canonicalUrl },
      ],
    })}
    ${renderJsonLd({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: (scenario.faq || []).map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    })}
  </head>
  <body class="bg-slate-50 text-slate-900" data-lc-page-type="pseo" data-lc-page-cluster="simulateurs" data-lc-page-slug="${escapeHtml(scenario.slug)}">
    ${GENERATED_MARKER}
    <main class="mx-auto max-w-5xl px-4 py-10">
      <section class="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-800 px-6 py-10 text-white shadow-xl ring-1 ring-white/10">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Aides essentielles 2026</p>
        <h1 class="mt-3 text-3xl font-black leading-tight sm:text-4xl">${renderText(scenario.title)}</h1>
        <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-200">${renderText(scenario.summary)}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="${simulatorUrl}" class="inline-flex items-center rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-sky-50">Ouvrir le simulateur complet</a>
          <a href="#hypotheses" class="inline-flex items-center rounded-xl border border-white/25 px-5 py-3 font-semibold text-white hover:bg-white/10">Voir les hypoth&egrave;ses</a>
        </div>
        <p class="mt-4 text-sm text-sky-100">Derni&egrave;re modification : ${escapeHtml(generatedAt)}</p>
      </section>

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Estimation rapide</h2>
        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-2xl bg-slate-50 p-4"><p class="text-sm text-slate-500">RSA</p><p class="mt-2 text-2xl font-bold text-slate-900">${renderText(estimates.rsa)}</p></div>
          <div class="rounded-2xl bg-slate-50 p-4"><p class="text-sm text-slate-500">APL</p><p class="mt-2 text-2xl font-bold text-slate-900">${renderText(estimates.apl)}</p></div>
          <div class="rounded-2xl bg-slate-50 p-4"><p class="text-sm text-slate-500">Prime d&#39;activit&eacute;</p><p class="mt-2 text-2xl font-bold text-slate-900">${renderText(estimates.prime)}</p></div>
          <div class="rounded-2xl bg-sky-50 p-4"><p class="text-sm text-sky-700">Total indicatif</p><p class="mt-2 text-2xl font-black text-sky-950">${renderText(estimates.total)}</p></div>
        </div>
        <p class="mt-4 text-slate-600">Cette page donne un rep&egrave;re global. Le d&eacute;tail final d&eacute;pend du logement, du foyer, de l'activit&eacute; et des revenus encore per&ccedil;us.</p>
      </section>

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Sc&eacute;nario utilis&eacute; pour cette estimation</h2>
        <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table class="min-w-full border-collapse text-sm">
            <tbody>
              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Profil</th><td class="px-4 py-3 text-slate-800">${renderText(scenario.audience)}</td></tr>
              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Revenus du foyer</th><td class="px-4 py-3 text-slate-800">${renderText(estimates.revenus)}</td></tr>
              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Loyer</th><td class="px-4 py-3 text-slate-800">${renderText(estimates.loyer)}</td></tr>
              <tr><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Activit&eacute;</th><td class="px-4 py-3 text-slate-800">${renderText(humanizeActivite(scenario.input.activite))}</td></tr>
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
        <h2 class="text-2xl font-bold text-slate-900">M&eacute;thode et sources</h2>
        <p class="mt-4 text-slate-700">Cette estimation repose sur les moteurs APL, RSA et Prime d'activit&eacute; du site et sur un sc&eacute;nario repr&eacute;sentatif. Elle reste indicative.</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="/pages/methodologie" class="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 hover:bg-slate-50">Consulter notre m&eacute;thodologie</a>
          <a href="https://www.caf.fr/" target="_blank" rel="noopener" class="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 font-semibold text-sky-900 hover:bg-sky-100">Voir les sources officielles CAF</a>
        </div>
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
                  `<a href="/pages/simulateurs/${page.slug}" class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-800 hover:border-sky-400 hover:bg-sky-50"><span class="font-semibold">${renderText(page.title)}</span></a>`,
              )
              .join("")}</div></section>`
          : ""
      }

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Aller plus loin</h2>
        <p class="mt-4 text-slate-700">Si votre situation ressemble &agrave; ce sc&eacute;nario, ouvrez le simulateur complet pour v&eacute;rifier les aides prioritaires et comparer plusieurs hypoth&egrave;ses.</p>
        <div class="mt-6">
          <a href="${simulatorUrl}" class="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">Lancer une simulation compl&egrave;te</a>
        </div>
      </section>
    </main>
  </body>
</html>`;
}


