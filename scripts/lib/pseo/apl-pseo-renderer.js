const DOMAIN = "https://www.lescalculateurs.fr";
const PILLAR_PATH = "/pages/apl";
const GENERATED_MARKER = "<!-- GENERATED:PSEO:APL -->";

const SITUATION_LABELS = {
  seul: "Personne seule",
  couple: "Couple",
  monoparental: "Parent isole",
  autre: "Autre foyer",
};

const REGION_LABELS = {
  idf: "Ile-de-France",
  province: "Province",
  dom: "DOM-TOM",
};

const LOGEMENT_LABELS = {
  location: "Location",
  accession: "Accession a la propriete",
  hlm: "Logement HLM",
  colocation: "Colocation",
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
  return String(value).replace(/[^\x20-\x7E]/g, (char) => {
    const code = char.charCodeAt(0).toString(10);
    return `&#${code};`;
  });
}

function escapeJsonUnicode(value) {
  return String(value).replace(/[^\x20-\x7E]/g, (char) => {
    const code = char.charCodeAt(0).toString(16).padStart(4, "0");
    return `\\u${code}`;
  });
}

function repairCorruptedFrench(value) {
  return String(value)
    .replace(/Sc\?narios/g, "Sc\u00e9narios")
    .replace(/sc\?narios/g, "sc\u00e9narios")
    .replace(/Sc\?nario/g, "Sc\u00e9nario")
    .replace(/sc\?nario/g, "sc\u00e9nario")
    .replace(/c\?libataire/g, "c\u00e9libataire")
    .replace(/C\?libataire/g, "C\u00e9libataire")
    .replace(/\?tudiantes/g, "\u00e9tudiantes")
    .replace(/\?tudiantes/g, "\u00e9tudiantes")
    .replace(/\?tudiants/g, "\u00e9tudiants")
    .replace(/\?tudiant/g, "\u00e9tudiant")
    .replace(/\?tudiante/g, "\u00e9tudiante")
    .replace(/isol\?/g, "isol\u00e9")
    .replace(/Isol\?/g, "Isol\u00e9")
    .replace(/\?le-de-France/g, "\u00cele-de-France")
    .replace(/\?lev\?s/g, "\u00e9lev\u00e9s")
    .replace(/\?lev\?es/g, "\u00e9lev\u00e9es")
    .replace(/\?lev\?e/g, "\u00e9lev\u00e9e")
    .replace(/\?lev\?/g, "\u00e9lev\u00e9")
    .replace(/g\?ographique/g, "g\u00e9ographique")
    .replace(/g\?ographiques/g, "g\u00e9ographiques")
    .replace(/fr\?quente/g, "fr\u00e9quente")
    .replace(/fr\?quentes/g, "fr\u00e9quentes")
    .replace(/fr\?quents/g, "fr\u00e9quents")
    .replace(/r\?elle/g, "r\u00e9elle")
    .replace(/r\?elles/g, "r\u00e9elles")
    .replace(/r\?el/g, "r\u00e9el")
    .replace(/r\?els/g, "r\u00e9els")
    .replace(/d\?clar\?es/g, "d\u00e9clar\u00e9es")
    .replace(/d\?clar\?e/g, "d\u00e9clar\u00e9e")
    .replace(/d\?clar\?/g, "d\u00e9clar\u00e9")
    .replace(/d\?clarer/g, "d\u00e9clarer")
    .replace(/V\?rifier/g, "V\u00e9rifier")
    .replace(/v\?rifier/g, "v\u00e9rifier")
    .replace(/modifi\?/g, "modifi\u00e9")
    .replace(/modifi\?e/g, "modifi\u00e9e")
    .replace(/int\?grer/g, "int\u00e9grer")
    .replace(/p\?riode/g, "p\u00e9riode")
    .replace(/d\?tail/g, "d\u00e9tail")
    .replace(/s\?rieuse/g, "s\u00e9rieuse")
    .replace(/s\?rieux/g, "s\u00e9rieux")
    .replace(/\?ventuelles/g, "\u00e9ventuelles")
    .replace(/\?ventuelle/g, "\u00e9ventuelle")
    .replace(/\?ligibles/g, "\u00e9ligibles")
    .replace(/\?ligible/g, "\u00e9ligible")
    .replace(/\?tes/g, "\u00eates")
    .replace(/\?tre/g, "\u00eatre")
    .replace(/coh\?rent/g, "coh\u00e9rent")
    .replace(/coh\?rente/g, "coh\u00e9rente")
    .replace(/pr\?cis/g, "pr\u00e9cis")
    .replace(/pr\?cise/g, "pr\u00e9cise")
    .replace(/interm\?diaire/g, "interm\u00e9diaire")
    .replace(/adapt\?e/g, "adapt\u00e9e")
    .replace(/adapt\?/g, "adapt\u00e9")
    .replace(/priv\?e/g, "priv\u00e9e")
    .replace(/priv\?es/g, "priv\u00e9es")
    .replace(/activit\?/g, "activit\u00e9")
    .replace(/calcul\?e/g, "calcul\u00e9e")
    .replace(/calcul\?/g, "calcul\u00e9")
    .replace(/mod\?r\?e/g, "mod\u00e9r\u00e9e")
    .replace(/mod\?r\?/g, "mod\u00e9r\u00e9")
    .replace(/g\?n\?ralement/g, "g\u00e9n\u00e9ralement")
    .replace(/g\?n\?r\?e/g, "g\u00e9n\u00e9r\u00e9e")
    .replace(/g\?n\?r\?es/g, "g\u00e9n\u00e9r\u00e9es")
    .replace(/r\?gles/g, "r\u00e8gles")
    .replace(/concr\?te/g, "concr\u00e8te")
    .replace(/concr\?tes/g, "concr\u00e8tes")
    .replace(/\? Paris/g, "\u00e0 Paris")
    .replace(/\? Lyon/g, "\u00e0 Lyon")
    .replace(/\? Marseille/g, "\u00e0 Marseille")
    .replace(/\? Toulouse/g, "\u00e0 Toulouse")
    .replace(/\? Lille/g, "\u00e0 Lille")
    .replace(/\? Nantes/g, "\u00e0 Nantes")
    .replace(/ avecloyer /g, " avec loyer ")
    .replace(/ unloyer /g, " un loyer ")
    .replace(/ coupleloyer /g, " couple loyer ")
    .replace(/ aplloyer /g, " apl loyer ")
    .replace(/ a Paris/g, " \u00e0 Paris")
    .replace(/ a Lyon/g, " \u00e0 Lyon")
    .replace(/ a Marseille/g, " \u00e0 Marseille")
    .replace(/ a Toulouse/g, " \u00e0 Toulouse")
    .replace(/ a Lille/g, " \u00e0 Lille")
    .replace(/ a Nantes/g, " \u00e0 Nantes");
}

function toFrenchDisplayText(value) {
  return repairCorruptedFrench(value)
    .replace(/\bScenario\b/g, "Sc\u00e9nario")
    .replace(/\bscenario\b/g, "sc\u00e9nario")
    .replace(/\bScenarios\b/g, "Sc\u00e9narios")
    .replace(/\bscenarios\b/g, "sc\u00e9narios")
    .replace(/\bcelibataire\b/g, "c\u00e9libataire")
    .replace(/\bCelibataire\b/g, "C\u00e9libataire")
    .replace(/\betudiant\b/g, "\u00e9tudiant")
    .replace(/\bEtudiant\b/g, "\u00c9tudiant")
    .replace(/\betudiants\b/g, "\u00e9tudiants")
    .replace(/\bEtudiants\b/g, "\u00c9tudiants")
    .replace(/\bparent isole\b/g, "parent isol\u00e9")
    .replace(/\bParent isole\b/g, "Parent isol\u00e9")
    .replace(/\bmodifiee\b/g, "modifi\u00e9e")
    .replace(/\bmodifie\b/g, "modifi\u00e9")
    .replace(/\bparametres\b/g, "param\u00e8tres")
    .replace(/\bParametres\b/g, "Param\u00e8tres")
    .replace(/\bVerification\b/g, "V\u00e9rification")
    .replace(/\bverification\b/g, "v\u00e9rification")
    .replace(/\bResultat\b/g, "R\u00e9sultat")
    .replace(/\bresultat\b/g, "r\u00e9sultat")
    .replace(/\breelle\b/g, "r\u00e9elle")
    .replace(/\bReelle\b/g, "R\u00e9elle")
    .replace(/\breel\b/g, "r\u00e9el")
    .replace(/\bReel\b/g, "R\u00e9el")
    .replace(/\breellement\b/g, "r\u00e9ellement")
    .replace(/\baffiche\b/g, "affich\u00e9")
    .replace(/\bAffiche\b/g, "Affich\u00e9")
    .replace(/\bgeographique\b/g, "g\u00e9ographique")
    .replace(/\bGeographique\b/g, "G\u00e9ographique")
    .replace(/\bgeographiques\b/g, "g\u00e9ographiques")
    .replace(/\bspecifique\b/g, "sp\u00e9cifique")
    .replace(/\bSpecifique\b/g, "Sp\u00e9cifique")
    .replace(/\bspecifiques\b/g, "sp\u00e9cifiques")
    .replace(/\bdifferemment\b/g, "diff\u00e9remment")
    .replace(/\bdifferents\b/g, "diff\u00e9rents")
    .replace(/\bdifferentes\b/g, "diff\u00e9rentes")
    .replace(/\bdetail\b/g, "d\u00e9tail")
    .replace(/\bDetail\b/g, "D\u00e9tail")
    .replace(/\bregles\b/g, "r\u00e8gles")
    .replace(/\bRegles\b/g, "R\u00e8gles")
    .replace(/\bperiode\b/g, "p\u00e9riode")
    .replace(/\bPeriode\b/g, "P\u00e9riode")
    .replace(/\bactivite\b/g, "activit\u00e9")
    .replace(/\bActivite\b/g, "Activit\u00e9")
    .replace(/\bactivites\b/g, "activit\u00e9s")
    .replace(/\bfrequentes\b/g, "fr\u00e9quentes")
    .replace(/\bfrequentes\b/g, "fr\u00e9quentes")
    .replace(/\bfrequente\b/g, "fr\u00e9quente")
    .replace(/\bfrancilienne\b/g, "francilienne")
    .replace(/\beleve\b/g, "\u00e9lev\u00e9")
    .replace(/\bEleve\b/g, "\u00c9lev\u00e9")
    .replace(/\belevee\b/g, "\u00e9lev\u00e9e")
    .replace(/\bElevee\b/g, "\u00c9lev\u00e9e")
    .replace(/\beleves\b/g, "\u00e9lev\u00e9s")
    .replace(/\belevee\b/g, "\u00e9lev\u00e9e")
    .replace(/\bestimee\b/g, "estim\u00e9e")
    .replace(/\bEstimee\b/g, "Estim\u00e9e")
    .replace(/\bestime\b/g, "estim\u00e9")
    .replace(/\bEstime\b/g, "Estim\u00e9")
    .replace(/\bcalcule\b/g, "calcul\u00e9")
    .replace(/\bCalcule\b/g, "Calcul\u00e9")
    .replace(/\bestimation a\b/g, "estimation \u00e0")
    .replace(/\butilisee\b/g, "utilis\u00e9e")
    .replace(/\bUtilisee\b/g, "Utilis\u00e9e")
    .replace(/\butilise\b/g, "utilis\u00e9")
    .replace(/\bUtilise\b/g, "Utilis\u00e9")
    .replace(/\bconsidere\b/g, "consid\u00e9r\u00e9")
    .replace(/\bconsideree\b/g, "consid\u00e9r\u00e9e")
    .replace(/\bdeclare\b/g, "d\u00e9clar\u00e9")
    .replace(/\bdeclaree\b/g, "d\u00e9clar\u00e9e")
    .replace(/\bdeclarees\b/g, "d\u00e9clar\u00e9es")
    .replace(/\bdemarche\b/g, "d\u00e9marche")
    .replace(/\bDemarche\b/g, "D\u00e9marche")
    .replace(/\bdemarches\b/g, "d\u00e9marches")
    .replace(/\bconseille\b/g, "conseill\u00e9")
    .replace(/\bConseille\b/g, "Conseill\u00e9")
    .replace(/\bDerniere\b/g, "Derni\u00e8re")
    .replace(/\bderniere\b/g, "derni\u00e8re")
    .replace(/\bmodification\b/g, "modification")
    .replace(/\bfrequentes\b/g, "fr\u00e9quentes")
    .replace(/\bfrequents\b/g, "fr\u00e9quents")
    .replace(/\bconcrete\b/g, "concr\u00e8te")
    .replace(/\bConcrete\b/g, "Concr\u00e8te")
    .replace(/\bconcretes\b/g, "concr\u00e8tes")
    .replace(/\bdetaille\b/g, "d\u00e9taill\u00e9")
    .replace(/\bDetaille\b/g, "D\u00e9taill\u00e9")
    .replace(/\brepond\b/g, "r\u00e9pond")
    .replace(/\bRepond\b/g, "R\u00e9pond")
    .replace(/\bhypotheses\b/g, "hypoth\u00e8ses")
    .replace(/\bHypotheses\b/g, "Hypoth\u00e8ses")
    .replace(/\bgeneree\b/g, "g\u00e9n\u00e9r\u00e9e")
    .replace(/\bgenerees\b/g, "g\u00e9n\u00e9r\u00e9es")
    .replace(/\bgeneration\b/g, "g\u00e9n\u00e9ration")
    .replace(/\bgeneralement\b/g, "g\u00e9n\u00e9ralement")
    .replace(/\bbeneficier\b/g, "b\u00e9n\u00e9ficier")
    .replace(/\bbeneficie\b/g, "b\u00e9n\u00e9ficie")
    .replace(/\bbeneficient\b/g, "b\u00e9n\u00e9ficient")
    .replace(/\bpret\b/g, "pr\u00eat")
    .replace(/\bPret\b/g, "Pr\u00eat")
    .replace(/\bL intention\b/g, "L'intention")
    .replace(/\bl intention\b/g, "l'intention")
    .replace(/\bL objectif\b/g, "L'objectif")
    .replace(/\bl objectif\b/g, "l'objectif")
    .replace(/\bL APL\b/g, "L'APL")
    .replace(/\bl APL\b/g, "l'APL")
    .replace(/\bd un\b/g, "d'un")
    .replace(/\bd une\b/g, "d'une")
    .replace(/\bd autres\b/g, "d'autres")
    .replace(/\bc est\b/g, "c'est")
    .replace(/\bC est\b/g, "C'est")
    .replace(/\bqu un\b/g, "qu'un")
    .replace(/\bqu une\b/g, "qu'une")
    .replace(/\bj ai\b/g, "j'ai")
    .replace(/\bJ ai\b/g, "J'ai")
    .replace(/\bIle-de-France\b/g, "\u00cele-de-France")
    .replace(/\ba Paris\b/g, "\u00e0 Paris")
    .replace(/\ba Lyon\b/g, "\u00e0 Lyon")
    .replace(/\ba Marseille\b/g, "\u00e0 Marseille")
    .replace(/\ba Toulouse\b/g, "\u00e0 Toulouse")
    .replace(/\ba Lille\b/g, "\u00e0 Lille")
    .replace(/\ba Nantes\b/g, "\u00e0 Nantes")
    .replace(/\ba Bordeaux\b/g, "\u00e0 Bordeaux")
    .replace(/\ba Nice\b/g, "\u00e0 Nice")
    .replace(/\ba Rennes\b/g, "\u00e0 Rennes")
    .replace(/\ba Strasbourg\b/g, "\u00e0 Strasbourg")
    .replace(/\ba Montpellier\b/g, "\u00e0 Montpellier")
    .replace(/\ba partir\b/g, "\u00e0 partir")
    .replace(/\ba la CAF\b/g, "\u00e0 la CAF")
    .replace(/\ba votre situation\b/g, "\u00e0 votre situation")
    .replace(/\ba l intention\b/g, "\u00e0 l'intention")
    .replace(/\bmodifi?r\b/g, "modifier")
    .replace(/\brecalcul?r\b/g, "recalculer")
    .replace(/\bdes son\b/g, "d\u00e8s son");
}

function renderText(value) {
  return encodeHtmlEntities(escapeHtml(toFrenchDisplayText(value)));
}

function renderJsonLd(data) {
  return `<script type="application/ld+json">${escapeJsonUnicode(
    JSON.stringify(data),
  )}</script>`;
}

function renderRelatedLinks(relatedPages) {
  if (!relatedPages.length) return "";

  return `
      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Sc&eacute;narios proches</h2>
        <p class="mb-4 text-slate-700 leading-relaxed">
          Ces pages proposent d'autres estimations selon des profils et des contextes proches.
        </p>
        <div class="grid gap-3 sm:grid-cols-2">
          ${relatedPages
            .map(
              (page) => `
          <a href="/pages/apl/${page.slug}" class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-800 hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <span class="block text-sm uppercase tracking-wide text-slate-500 mb-1">${escapeHtml(
              toFrenchDisplayText(page.intent),
            )}</span>
            <span class="font-semibold">${escapeHtml(
              toFrenchDisplayText(page.title),
            )}</span>
          </a>`,
            )
            .join("")}
        </div>
      </section>`;
}

export function isGeneratedPseoAplPage(content) {
  return String(content).includes(GENERATED_MARKER);
}

export function renderAPLScenarioPage({
  scenario,
  estimate,
  relatedPages,
  targetConfig,
  generatedAt,
}) {
  const canonicalUrl = `${DOMAIN}/pages/apl/${scenario.slug}`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: DOMAIN },
      {
        "@type": "ListItem",
        position: 2,
        name: "Simulateur APL",
        item: `${DOMAIN}${PILLAR_PATH}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: toFrenchDisplayText(scenario.title),
        item: canonicalUrl,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: scenario.faq.map((item) => ({
      "@type": "Question",
      name: toFrenchDisplayText(item.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: toFrenchDisplayText(item.answer),
      },
    })),
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: toFrenchDisplayText(scenario.title),
    description: toFrenchDisplayText(scenario.description),
    url: canonicalUrl,
    isPartOf: `${DOMAIN}${PILLAR_PATH}`,
    publisher: {
      "@type": "Organization",
      name: "LesCalculateurs.fr",
      url: DOMAIN,
    },
  };

  const checklistItems = scenario.checklist
    .map(
      (item) => `<li class="text-slate-700 leading-relaxed">${renderText(item)}</li>`,
    )
    .join("");

  const faqHtml = scenario.faq
    .map(
      (item) => `
          <details class="group rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary class="cursor-pointer list-none font-semibold text-slate-900">${escapeHtml(
              toFrenchDisplayText(item.question),
            )}</summary>
            <p class="mt-3 text-slate-700 leading-relaxed">${renderText(item.answer)}</p>
          </details>`,
    )
    .join("");

  const estimationMessage = estimate.reasonZero
    ? `Montant estime a ${estimate.formattedApl}. ${estimate.reasonZero}`
    : `Estimation indicative autour de ${estimate.formattedApl} par mois.`;
  const approxAplDisplay = estimate.formattedApl.startsWith("~")
    ? estimate.formattedApl
    : `~${estimate.formattedApl}`;

  const introText = toFrenchDisplayText(
    `${scenario.description} Cette page donne un premier ordre de grandeur avant d'utiliser le simulateur complet.`,
  );

  const tableRows = [
    ["Situation familiale", toFrenchDisplayText(SITUATION_LABELS[scenario.input.situation] || scenario.input.situation)],
    ["Nombre d'enfants", String(scenario.input.enfants)],
    ["Revenus mensuels", estimate.formattedRevenue],
    ["Loyer mensuel", estimate.formattedRent],
    ["Zone", toFrenchDisplayText(REGION_LABELS[scenario.input.region] || scenario.input.region)],
    ["Type de logement", toFrenchDisplayText(LOGEMENT_LABELS[scenario.input.type_logement] || scenario.input.type_logement)],
  ]
    .map(
      ([label, value]) => `
              <tr class="border-b border-slate-100 last:border-0">
                <th class="px-4 py-3 text-left font-medium text-slate-600">${escapeHtml(label)}</th>
                <td class="px-4 py-3 text-right font-semibold text-slate-900">${escapeHtml(value)}</td>
              </tr>`,
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
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${renderText(scenario.title)}" />
    <meta name="twitter:description" content="${renderText(scenario.description)}" />
    <link rel="stylesheet" href="${targetConfig.stylesHref}" />
    ${renderJsonLd(breadcrumbSchema)}
    ${renderJsonLd(pageSchema)}
    ${renderJsonLd(faqSchema)}
    <script defer src="/third-party-loader.js"></script>
    ${targetConfig.mainScriptTag}
  </head>
  <body
    class="bg-slate-100 text-slate-900"
    data-lc-page-type="pseo"
    data-lc-page-cluster="apl"
    data-lc-page-template="scenario"
    data-lc-page-slug="${escapeAttribute(scenario.slug)}"
    data-lc-page-intent="${escapeAttribute(toFrenchDisplayText(scenario.intent))}"
    data-lc-page-audience="${escapeAttribute(toFrenchDisplayText(scenario.audience))}"
    data-lc-page-variant="pilot-2026"
  >
    ${GENERATED_MARKER}
    <div class="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <div class="mx-auto max-w-5xl">
        ${renderText("Estimation indicative. V\u00e9rification finale \u00e0 faire sur")}
        <a href="https://www.caf.fr" class="font-semibold underline" target="_blank" rel="noopener">caf.fr</a>.
      </div>
    </div>

    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <a href="/" class="text-lg font-bold text-slate-900">Les Calculateurs</a>
        <nav class="flex gap-4 text-sm text-slate-600">
          <a href="/">Accueil</a>
          <a href="${PILLAR_PATH}">Simulateur APL</a>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-10">
      <section class="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-800 px-6 py-10 text-white shadow-xl ring-1 ring-white/10">
        <p class="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200">
          Estimation indicative 2026
        </p>
        <h1 class="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">${renderText(
          scenario.title,
        )}</h1>
        <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-100">${renderText(
          introText,
        )}</p>
        <p class="mt-4 max-w-3xl text-sm leading-relaxed text-slate-100/90">
          ${renderText(
            "Le montant affich\u00e9 est calcul\u00e9 \u00e0 partir du moteur de simulation APL utilis\u00e9 sur LesCalculateurs.fr, avec un sc\u00e9nario repr\u00e9sentatif.",
          )}
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a href="${PILLAR_PATH}" class="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-400">
            Ouvrir le simulateur APL complet
          </a>
          <a href="#hypotheses" class="rounded-xl border border-white/30 bg-white/5 px-5 py-3 font-semibold text-white transition-colors hover:bg-white/15">
            Voir les hypoth&egrave;ses
          </a>
        </div>
      </section>

      <section class="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-900">Estimation rapide</h2>
          <p class="mt-4 text-lg leading-relaxed text-slate-700">${renderText(
            estimationMessage.replace(estimate.formattedApl, approxAplDisplay),
          )}</p>
          <p class="mt-4 text-slate-700 leading-relaxed">${renderText(
            `Cette estimation correspond \u00e0 un profil type : ${scenario.audience}.`,
          )}</p>
          <p class="mt-4 text-slate-700 leading-relaxed">${renderText(
            "Elle reste indicative : le montant r\u00e9el d\u00e9pend notamment du logement, des ressources retenues par la CAF et de la situation administrative.",
          )}</p>
          <div class="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p class="text-sm font-semibold uppercase tracking-wide text-blue-700">${renderText(
              "R\u00e9sultat estim\u00e9",
            )}</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">${escapeHtml(approxAplDisplay)} / mois</p>
            <p class="mt-2 text-sm text-slate-700">${renderText(
              "Montant indicatif calcul\u00e9 \u00e0 partir du moteur de simulation du site.",
            )}</p>
          </div>
        </article>

        <aside class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Profil</p>
          <p class="mt-3 text-lg font-semibold text-slate-950">${renderText(scenario.audience)}</p>
          <p class="mt-3 text-sm leading-relaxed text-slate-600">
            ${renderText(scenario.summary)}
          </p>
        </aside>
      </section>

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Sc&eacute;nario utilise pour cette estimation</h2>
        <p class="mt-4 text-slate-700 leading-relaxed">
          ${renderText(
            "Cette estimation repose sur un sc\u00e9nario repr\u00e9sentatif construit \u00e0 partir d'un profil type.",
          )}
        </p>
        <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table class="min-w-full border-collapse text-sm">
            <tbody>
            ${tableRows}
            </tbody>
          </table>
        </div>
      </section>

      <section id="hypotheses" class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Hypoth&egrave;ses importantes</h2>
        <p class="mt-4 text-slate-700 leading-relaxed">
          ${renderText(
            "Cette estimation repose sur un sc\u00e9nario simplifi\u00e9 et sur des hypoth\u00e8ses moyennes. Avant toute d\u00e9marche, il est conseill\u00e9 de v\u00e9rifier les param\u00e8tres qui influencent r\u00e9ellement le calcul.",
          )}
        </p>
        <ul class="mt-6 list-disc space-y-3 pl-5">
          ${checklistItems}
        </ul>
        <p class="mt-4 text-slate-700 leading-relaxed">
          ${renderText(
            "Dans certains cas, une colocation, un logement HLM ou un autre type de bail peut modifier sensiblement le montant.",
          )}
        </p>
      </section>

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Pourquoi cette page existe</h2>
        <p class="mt-4 text-slate-700 leading-relaxed">
          ${renderText(
            `Cette page r\u00e9pond \u00e0 l'intention de recherche ${scenario.intent}. Son objectif est de fournir une estimation r\u00e9aliste, d'expliquer les principaux facteurs qui influencent l'APL et d'orienter vers le simulateur d\u00e9taill\u00e9 pour affiner la situation.`,
          )}
        </p>
        <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Derni&egrave;re modification</p>
          <p class="mt-2 text-slate-800">${escapeHtml(generatedAt)}</p>
        </div>
      </section>

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Questions fr&eacute;quentes</h2>
        <div class="mt-5 space-y-4">
          ${faqHtml}
        </div>
      </section>

      ${renderRelatedLinks(relatedPages)}

      <section class="mt-8 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Aller plus loin</h2>
        <p class="mt-4 text-slate-700 leading-relaxed">
          ${renderText(
            "Si votre situation ressemble \u00e0 ce sc\u00e9nario, utilisez le simulateur complet pour tester plusieurs param\u00e8tres : loyer, revenus, zone g\u00e9ographique et composition du foyer. Vous obtiendrez ainsi une estimation plus proche de votre situation r\u00e9elle.",
          )}
        </p>
        <a href="${PILLAR_PATH}" class="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
          Lancer une simulation APL complete
        </a>
      </section>
    </main>
  </body>
</html>`;
}
