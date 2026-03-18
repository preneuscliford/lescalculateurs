const DOMAIN = "https://www.lescalculateurs.fr";
const PILLAR_PATH = "/pages/prime-activite";
const GENERATED_MARKER = "<!-- GENERATED:PSEO:PRIME -->";
const FAVICON_OG_IMAGE = `${DOMAIN}/assets/favicon-32x32.png`;

const SITUATION_LABELS = {
  seul: "Personne seule",
  couple: "Couple",
  monoparental: "Parent isol\u00e9",
};

const LOGEMENT_LABELS = {
  loue: "Logement lou\u00e9",
  proprio: "Propri\u00e9taire",
  gratuit: "H\u00e9bergement gratuit",
};

const ACTIVITE_LABELS = {
  salarie: "Salari\u00e9",
  independant: "Ind\u00e9pendant",
  apprenti: "Apprenti",
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
    .replace(/\bactivite\b/gi, "activit\u00e9")
    .replace(/\bactivites\b/gi, "activit\u00e9s")
    .replace(/\bapres\b/gi, "apr\u00e8s")
    .replace(/\bchomage\b/gi, "ch\u00f4mage")
    .replace(/\bperiode\b/gi, "p\u00e9riode")
    .replace(/\bverifier\b/gi, "v\u00e9rifier")
    .replace(/\bstabilises\b/gi, "stabilis\u00e9s")
    .replace(/\beleve\b/gi, "\u00e9lev\u00e9")
    .replace(/\bscenario\b/gi, "sc\u00e9nario")
    .replace(/\bscenarios\b/gi, "sc\u00e9narios")
    .replace(/\bhypotheses\b/gi, "hypoth\u00e8ses")
    .replace(/\bmethode\b/gi, "m\u00e9thode")
    .replace(/\bmethodologie\b/gi, "m\u00e9thodologie")
    .replace(/\bquestions frequentes\b/gi, "questions fr\u00e9quentes")
    .replace(/\bderniere\b/gi, "derni\u00e8re")
    .replace(/\bcomplete\b/gi, "compl\u00e8te")
    .replace(/\bconfirmee\b/gi, "confirm\u00e9e")
    .replace(/\bparent isole\b/gi, "parent isol\u00e9")
    .replace(/\blogement loue\b/gi, "logement lou\u00e9")
    .replace(/\bproprietaire\b/gi, "propri\u00e9taire")
    .replace(/\bhebergement\b/gi, "h\u00e9bergement")
    .replace(/\bsalarie\b/gi, "salari\u00e9")
    .replace(/\ba une\b/gi, "\u00e0 une")
    .replace(/\ba ce scenario\b/gi, "\u00e0 ce sc\u00e9nario")
    .replace(/\ba comparer\b/gi, "\u00e0 comparer")
    .replace(/\bprime estimee\b/gi, "prime estim\u00e9e")
    .replace(/\betre\b/gi, "\u00eatre");
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

function buildPrimeSimulatorUrl(input) {
  const params = new URLSearchParams();
  params.set("prime-situation", input.situation);
  params.set("prime-enfants", String(input.enfants));
  params.set("prime-revenus-pro", String(input.revenusProf));
  params.set("prime-autres-revenus", String(input.autresRevenus));
  params.set("prime-logement", input.logement);
  params.set("prime-type-activite", input.typeActivite);
  params.set("prime-autosubmit", "1");
  return `${PILLAR_PATH}?${params.toString()}#prime-form`;
}

export function isGeneratedPseoPrimePage(content) {
  return String(content).includes(GENERATED_MARKER);
}

export function renderPrimeScenarioPage({
  scenario,
  estimate,
  relatedPages,
  generatedAt,
  targetConfig,
}) {
  const simulatorUrl = buildPrimeSimulatorUrl(scenario.input);
  const canonicalUrl = `${DOMAIN}/pages/prime-activite/${scenario.slug}`;
  const faqEntities = (scenario.faq || []).map((item) => ({
    "@type": "Question",
    name: normalizeFrenchText(item.question),
    acceptedAnswer: { "@type": "Answer", text: normalizeFrenchText(item.answer) },
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
        { "@type": "ListItem", position: 2, name: "Prime d'activit\u00e9", item: `${DOMAIN}${PILLAR_PATH}` },
        { "@type": "ListItem", position: 3, name: normalizeFrenchText(scenario.title), item: canonicalUrl },
      ],
    })}
    ${renderJsonLd({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqEntities })}
  </head>
  <body class="bg-slate-50 text-slate-900" data-lc-page-type="pseo" data-lc-page-cluster="prime-activite" data-lc-page-slug="${escapeHtml(scenario.slug)}">
    ${GENERATED_MARKER}
    <main class="mx-auto max-w-5xl px-4 py-10">
      <section class="rounded-3xl bg-gradient-to-br from-slate-950 via-green-900 to-emerald-700 px-6 py-10 text-white shadow-xl ring-1 ring-white/10">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Prime d&#39;activit&eacute; 2026</p>
        <h1 class="mt-3 text-3xl font-black leading-tight sm:text-4xl">${renderText(scenario.title)}</h1>
        <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-200">${renderText(scenario.summary)}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="${simulatorUrl}" class="inline-flex items-center rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-50">Ouvrir le simulateur Prime d&#39;activit&eacute; complet</a>
          <a href="#hypotheses" class="inline-flex items-center rounded-xl border border-white/25 px-5 py-3 font-semibold text-white hover:bg-white/10">Voir les hypoth&egrave;ses</a>
        </div>
        <p class="mt-4 text-sm text-emerald-100">Derni&egrave;re modification : ${escapeHtml(generatedAt)}</p>
      </section>

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Estimation rapide</h2>
        <p class="mt-4 text-slate-700">Montant indicatif autour de <strong>${renderText(estimate.formattedAmount)}</strong> par mois pour ce sc&eacute;nario type.</p>
        <p class="mt-3 text-slate-600">Cette estimation reste indicative : la Prime d&#39;activit&eacute; d&eacute;pend des revenus professionnels, du foyer et des autres ressources prises en compte.</p>
      </section>

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Sc&eacute;nario utilis&eacute; pour cette estimation</h2>
        <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table class="min-w-full border-collapse text-sm">
            <tbody>
              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Profil</th><td class="px-4 py-3 text-slate-800">${renderText(scenario.audience)}</td></tr>
              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Situation</th><td class="px-4 py-3 text-slate-800">${renderText(SITUATION_LABELS[scenario.input.situation] || scenario.input.situation)}</td></tr>
              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Revenus professionnels</th><td class="px-4 py-3 text-slate-800">${renderText(estimate.formattedIncome)}</td></tr>
              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Autres revenus</th><td class="px-4 py-3 text-slate-800">${renderText(estimate.formattedOtherIncome)}</td></tr>
              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Logement</th><td class="px-4 py-3 text-slate-800">${renderText(LOGEMENT_LABELS[scenario.input.logement] || scenario.input.logement)}</td></tr>
              <tr class="border-b border-slate-100"><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Type d&#39;activit&eacute;</th><td class="px-4 py-3 text-slate-800">${renderText(ACTIVITE_LABELS[scenario.input.typeActivite] || scenario.input.typeActivite)}</td></tr>
              <tr><th class="bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Prime estim&eacute;e</th><td class="px-4 py-3 text-slate-900 font-semibold">${renderText(estimate.formattedAmount)}</td></tr>
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
        <p class="mt-4 text-slate-700">Cette estimation repose sur le moteur Prime d&#39;activit&eacute; du site et sur un sc&eacute;nario repr&eacute;sentatif. Elle doit &ecirc;tre confirm&eacute;e avec votre situation exacte.</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="/pages/methodologie" class="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 hover:bg-slate-50">Consulter notre m&eacute;thodologie</a>
          <a href="https://www.caf.fr/allocataires/aides-et-demarches/mes-aides/fiches-aides/la-prime-d-activite" target="_blank" rel="noopener" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-900 hover:bg-emerald-100">Voir la source officielle CAF</a>
          <a href="https://www.service-public.fr/particuliers/vosdroits/N31477" target="_blank" rel="noopener" class="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 hover:bg-slate-50">Voir la fiche service-public.fr</a>
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
                  `<a href="/pages/prime-activite/${page.slug}" class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50"><span class="font-semibold">${renderText(page.title)}</span></a>`,
              )
              .join("")}</div></section>`
          : ""
      }

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Aller plus loin</h2>
        <p class="mt-4 text-slate-700">Si votre situation ressemble &agrave; ce sc&eacute;nario, utilisez le simulateur complet pour v&eacute;rifier vos revenus d&#39;activit&eacute;, vos autres ressources et l&#39;impact d&#39;une reprise d&#39;emploi.</p>
        <div class="mt-6">
          <a href="${simulatorUrl}" class="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">Lancer une simulation Prime d&#39;activit&eacute; compl&egrave;te</a>
        </div>
      </section>
    </main>
  </body>
</html>`;
}
