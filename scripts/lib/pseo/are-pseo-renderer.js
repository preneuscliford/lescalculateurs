const DOMAIN = "https://www.lescalculateurs.fr";
const PILLAR_PATH = "/pages/are";
const GENERATED_MARKER = "<!-- GENERATED:PSEO:ARE -->";
const FAVICON_OG_IMAGE = `${DOMAIN}/assets/favicon-32x32.png`;

const SITUATION_LABELS = {
  seul: "Personne seule",
  couple: "Couple",
  parent: "Parent isol\u00e9",
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function encodeHtmlEntities(value) {
  return String(value).replace(/[^\x20-\x7E]/g, (char) => `&#${char.charCodeAt(0)};`);
}

function normalizeFrenchText(value) {
  return String(value)
    .replace(/\bV\?rifier\b/g, "V\u00e9rifier")
    .replace(/\bv\?rification\b/g, "v\u00e9rification")
    .replace(/\br\?f\?rence\b/g, "r\u00e9f\u00e9rence")
    .replace(/\br\?f\?rences\b/g, "r\u00e9f\u00e9rences")
    .replace(/\bch\?mage\b/g, "ch\u00f4mage")
    .replace(/\bsc\?nario\b/g, "sc\u00e9nario")
    .replace(/\bSc\?nario\b/g, "Sc\u00e9nario")
    .replace(/\bd\?finitif\b/g, "d\u00e9finitif")
    .replace(/\bd\?pend\b/g, "d\u00e9pend")
    .replace(/\bd\?d\?pend\b/g, "d\u00e9pend")
    .replace(/\bRep\?res\b/g, "Rep\u00e8res")
    .replace(/\bapr\?s\b/g, "apr\u00e8s")
    .replace(/\bd\?marche\b/g, "d\u00e9marche")
    .replace(/\bd\?taill\?\b/g, "d\u00e9taill\u00e9")
    .replace(/\bd\?di\?e\b/g, "d\u00e9di\u00e9e")
    .replace(/\brepresentatif\b/gi, "repr\u00e9sentatif")
    .replace(/\brepresentative\b/gi, "repr\u00e9sentative")
    .replace(/\betre\b/gi, "\u00eatre")
    .replace(/\butilisee\b/gi, "utilis\u00e9e")
    .replace(/\butilise\b/gi, "utilis\u00e9")
    .replace(/\b\? partir\b/g, "\u00e0 partir")
    .replace(/\b\?vec\b/g, "avec")
    .replace(/\s{2,}/g, " ")
    .replace(/\bscenario(s)?\b/gi, (_, plural) => `sc\u00e9nario${plural || ""}`)
    .replace(/\bmethodologie\b/gi, "m\u00e9thodologie")
    .replace(/\bcomplete\b/gi, "compl\u00e8te")
    .replace(/\brequete\b/gi, "requ\u00eate")
    .replace(/\btres\b/gi, "tr\u00e8s")
    .replace(/\bverifier\b/gi, "v\u00e9rifier")
    .replace(/\bverification\b/gi, "v\u00e9rification")
    .replace(/\breferences\b/gi, "r\u00e9f\u00e9rences")
    .replace(/\breference\b/gi, "r\u00e9f\u00e9rence")
    .replace(/\banciennete\b/gi, "anciennet\u00e9")
    .replace(/\bchomage\b/gi, "ch\u00f4mage")
    .replace(/\bduree\b/gi, "dur\u00e9e")
    .replace(/\bdetaille\b/gi, "d\u00e9taill\u00e9")
    .replace(/\bdefinitif\b/gi, "d\u00e9finitif")
    .replace(/\bresultat\b/gi, "r\u00e9sultat")
    .replace(/\binstruction\b/gi, "instruction")
    .replace(/\ba partir\b/gi, "\u00e0 partir")
    .replace(/\bd un\b/gi, "d'un")
    .replace(/\bd une\b/gi, "d'une")
    .replace(/\bd emploi\b/gi, "d'emploi")
    .replace(/\bd autres\b/gi, "d'autres")
    .replace(/\bd activite\b/gi, "d'activit\u00e9")
    .replace(/\bc est\b/gi, "c'est")
    .replace(/\ba un profil\b/gi, "\u00e0 un profil")
    .replace(/\ba utiliser\b/gi, "\u00e0 utiliser")
    .replace(/\ba verifier\b/gi, "\u00e0 v\u00e9rifier");
}

function normalizeInlineApproxEuro(value) {
  return String(value).replace(/(^|[^\w~])(\d{1,3}(?:[\s\u202f]?\d{3})*|\d+)\s*EUR\b/g, (_match, prefix, amount) => {
    const numeric = Number(String(amount).replace(/[\s\u202f]/g, ""));
    if (!Number.isFinite(numeric)) return `${prefix}${amount} EUR`;
    return `${prefix}~${numeric.toLocaleString("fr-FR")} €`;
  });
}

function renderText(value) {
  return encodeHtmlEntities(escapeHtml(normalizeInlineApproxEuro(normalizeFrenchText(value))));
}

function renderJsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(
    /[^\x20-\x7E]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  )}</script>`;
}

function buildAreSimulatorUrl(input) {
  const params = new URLSearchParams();
  params.set("are-situation", input.situation);
  params.set("are-age", String(input.agePersonne));
  params.set("are-anciennete", String(input.ancienneteEmploi));
  params.set("are-salaire", String(input.salaireReferent));
  params.set("are-enfants", String(input.personnesCharge));
  return `${PILLAR_PATH}?${params.toString()}#are-form`;
}

function renderMethodologySources() {
  return `
      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">M&eacute;thodologie et sources</h2>
        <p class="mt-4 text-slate-700 leading-relaxed">
          ${renderText(
            "Cette estimation repose sur le moteur de calcul ARE du site et sur un scenario representatif. Elle donne un ordre de grandeur utile avant verification par France Travail.",
          )}
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="/pages/methodologie" class="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-50">Consulter notre m&eacute;thodologie</a>
          <a href="https://www.francetravail.fr/candidat/vos-services-en-ligne/estimer-vos-allocations-et-aid.html" target="_blank" rel="noopener" class="inline-flex rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 font-semibold text-orange-900 transition-colors hover:bg-orange-100">Voir la source officielle France Travail</a>
          <a href="https://www.service-public.fr/particuliers/vosdroits/N549" target="_blank" rel="noopener" class="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-50">Voir la fiche service-public.fr</a>
        </div>
      </section>`;
}

function renderComparisonTable(scenario, estimate, relatedPages) {
  const comparable = [{ ...scenario, estimate }, ...relatedPages.filter((item) => item?.estimate)].slice(0, 4);
  if (comparable.length < 2) return "";

  return `
      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Comparer plusieurs sc&eacute;narios</h2>
        <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table class="min-w-full border-collapse text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-slate-700">Sc&eacute;nario</th>
                <th class="px-4 py-3 text-right font-semibold text-slate-700">ARE estim&eacute;e</th>
                <th class="px-4 py-3 text-right font-semibold text-slate-700">Salaire de r&eacute;f&eacute;rence</th>
                <th class="px-4 py-3 text-right font-semibold text-slate-700">&Acirc;ge</th>
              </tr>
            </thead>
            <tbody>
              ${comparable
                .map(
                  (page) => `
              <tr class="border-b border-slate-100 last:border-0">
                <td class="px-4 py-3">
                  <a href="/pages/are/${escapeAttribute(page.slug)}" class="font-semibold text-slate-900 hover:text-orange-700">${renderText(
                    page.audience || page.title,
                  )}</a>
                </td>
                <td class="px-4 py-3 text-right font-semibold text-slate-900">${escapeHtml(
                  page.estimate.formattedAmount,
                )}</td>
                <td class="px-4 py-3 text-right text-slate-700">${escapeHtml(
                  page.estimate.formattedSalary,
                )}</td>
                <td class="px-4 py-3 text-right text-slate-700">${escapeHtml(
                  `${page.input.agePersonne} ans`,
                )}</td>
              </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </section>`;
}

function renderRelatedLinks(relatedPages) {
  if (!relatedPages.length) return "";
  return `
      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Sc&eacute;narios proches</h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          ${relatedPages
            .map(
              (page) => `
          <a href="/pages/are/${page.slug}" class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-800 transition-colors hover:border-orange-500 hover:bg-orange-50">
            <span class="font-semibold">${renderText(page.title)}</span>
          </a>`,
            )
            .join("")}
        </div>
      </section>`;
}

export function isGeneratedPseoArePage(content) {
  return String(content).includes(GENERATED_MARKER);
}

export function renderAREScenarioPage({
  scenario,
  estimate,
  relatedPages,
  generatedAt,
  targetConfig,
}) {
  const canonicalUrl = `${DOMAIN}/pages/are/${scenario.slug}`;
  const simulatorUrl = buildAreSimulatorUrl(scenario.input);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: scenario.faq.map((item) => ({
      "@type": "Question",
      name: normalizeFrenchText(item.question),
      acceptedAnswer: { "@type": "Answer", text: normalizeFrenchText(item.answer) },
    })),
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: normalizeFrenchText(scenario.title),
    description: normalizeFrenchText(scenario.description),
    url: canonicalUrl,
    isPartOf: `${DOMAIN}${PILLAR_PATH}`,
    publisher: { "@type": "Organization", name: "LesCalculateurs.fr", url: DOMAIN },
  };

  const tableRows = [
    ["Situation familiale", SITUATION_LABELS[scenario.input.situation] || scenario.input.situation],
    ["Age", `${scenario.input.agePersonne} ans`],
    ["Anciennet\u00e9 d'emploi", `${scenario.input.ancienneteEmploi} mois`],
    ["Salaire de r\u00e9f\u00e9rence", estimate.formattedSalary],
    ["Personnes \u00e0 charge", String(scenario.input.personnesCharge)],
  ]
    .map(
      ([label, value]) => `
              <tr class="border-b border-slate-100 last:border-0">
                <th class="px-4 py-3 text-left font-medium text-slate-600">${renderText(label)}</th>
                <td class="px-4 py-3 text-right font-semibold text-slate-900">${renderText(value)}</td>
              </tr>`,
    )
    .join("");

  const faqHtml = scenario.faq
    .map(
      (item) => `
          <details class="group rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary class="cursor-pointer list-none font-semibold text-slate-900">${renderText(item.question)}</summary>
            <p class="mt-3 text-slate-700 leading-relaxed">${renderText(item.answer)}</p>
          </details>`,
    )
    .join("");

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${renderText(scenario.title)}</title>
    <meta name="description" content="${renderText(scenario.description)}" />
    <meta name="robots" content="index, follow" />
    <meta name="google-adsense-account" content="ca-pub-2209781252231399" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${renderText(scenario.title)}" />
    <meta property="og:description" content="${renderText(scenario.description)}" />
    <meta property="og:image" content="${FAVICON_OG_IMAGE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${renderText(scenario.title)}" />
    <meta name="twitter:description" content="${renderText(scenario.description)}" />
    <meta name="twitter:image" content="${FAVICON_OG_IMAGE}" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />
    <link rel="shortcut icon" href="/assets/favicon.ico" />
    <link rel="stylesheet" href="${targetConfig.stylesHref}" />
    ${renderJsonLd(pageSchema)}
    ${renderJsonLd(faqSchema)}
    <script defer src="/third-party-loader.js"></script>
    ${targetConfig.mainScriptTag}
  </head>
  <body class="bg-slate-100 text-slate-900">
    ${GENERATED_MARKER}
    <div class="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <div class="mx-auto max-w-5xl">Estimation indicative. V&eacute;rification finale &agrave; faire sur <a href="https://www.francetravail.fr" class="font-semibold underline" target="_blank" rel="noopener">francetravail.fr</a>.</div>
    </div>
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <a href="/" class="text-lg font-bold text-slate-900">Les Calculateurs</a>
        <nav class="flex gap-4 text-sm text-slate-600">
          <a href="/">Accueil</a>
          <a href="${PILLAR_PATH}">Simulateur ARE</a>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-10">
      <section class="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-orange-800 px-6 py-10 text-white shadow-xl ring-1 ring-white/10">
        <p class="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200">Estimation indicative 2026</p>
        <h1 class="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">${renderText(scenario.title)}</h1>
        <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-100">${renderText(
          `${scenario.description} Cette page donne un premier ordre de grandeur avant d'utiliser le simulateur complet.`,
        )}</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a href="${simulatorUrl}" class="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-400">Ouvrir le simulateur ARE complet</a>
          <a href="#hypotheses" class="rounded-xl border border-white/30 bg-white/5 px-5 py-3 font-semibold text-white transition-colors hover:bg-white/15">Voir les hypoth&egrave;ses</a>
        </div>
      </section>

      <section class="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-900">Estimation rapide</h2>
          <p class="mt-4 text-lg leading-relaxed text-slate-700">${renderText(
            `Montant indicatif autour de ${estimate.formattedAmount} par mois pour ce scenario type.`,
          )}</p>
          <p class="mt-4 text-slate-700 leading-relaxed">${renderText(
            `Cette estimation correspond a un profil type : ${scenario.audience}.`,
          )}</p>
          <div class="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">R&eacute;sultat estim&eacute;</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">${escapeHtml(estimate.formattedAmount)} / mois</p>
            <p class="mt-2 text-sm text-slate-700">${renderText(estimate.durationLabel)}</p>
          </div>
        </article>
        <aside class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Profil</p>
          <p class="mt-3 text-lg font-semibold text-slate-950">${renderText(scenario.audience)}</p>
          <p class="mt-3 text-sm leading-relaxed text-slate-600">${renderText(scenario.summary)}</p>
        </aside>
      </section>

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Sc&eacute;nario utilis&eacute; pour cette estimation</h2>
        <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table class="min-w-full border-collapse text-sm"><tbody>${tableRows}</tbody></table>
        </div>
      </section>

      <section id="hypotheses" class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Hypoth&egrave;ses importantes</h2>
        <ul class="mt-6 list-disc space-y-3 pl-5">
          ${scenario.checklist.map((item) => `<li class="text-slate-700 leading-relaxed">${renderText(item)}</li>`).join("")}
        </ul>
      </section>

      ${renderMethodologySources()}
      ${renderComparisonTable(scenario, estimate, relatedPages)}
      ${renderRelatedLinks(relatedPages)}

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Questions fr&eacute;quentes</h2>
        <div class="mt-5 space-y-4">${faqHtml}</div>
      </section>

      <section class="mt-8 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Aller plus loin</h2>
        <p class="mt-4 text-slate-700 leading-relaxed">${renderText(
          "Utilisez le simulateur complet pour verifier votre situation exacte, puis confrontez l'estimation aux references officielles.",
        )}</p>
        <a href="${simulatorUrl}" class="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700">Lancer une simulation ARE compl&egrave;te</a>
        <p class="mt-4 text-sm text-slate-600">Derni&egrave;re modification : ${escapeHtml(generatedAt)}</p>
      </section>
    </main>
  </body>
</html>`;
}
