#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PAGES_DIR = path.join(root, "src", "pages", "blog", "departements");
const REQ_DIR = path.join(root, "reports", "deepseek-requests");

function readInput(code) {
  const p = path.join(REQ_DIR, `request-${code}.json`);
  if (!fs.existsSync(p)) return null;
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    return j.input || j;
  } catch (e) {
    return null;
  }
}

function backup(file) {
  const bak = file + ".bak." + new Date().toISOString().replace(/[:.]/g, "-");
  fs.copyFileSync(file, bak);
  return bak;
}

function makeTableHtml(prices, ancienPct, neufPct, labelAlt = false) {
  const ancienLabel = labelAlt
    ? "Droits + émoluments (ancien)"
    : "Frais ancien";
  const rows = prices
    .map((price) => {
      const fraisAncien = Math.round(price * (ancienPct / 100));
      const fraisNeuf = Math.round(price * (neufPct / 100));
      const eco = fraisAncien - fraisNeuf;
      return `  <tr><td>${price.toLocaleString(
        "fr-FR"
      )} €</td><td>${fraisAncien.toLocaleString(
        "fr-FR"
      )} €</td><td>${fraisNeuf.toLocaleString(
        "fr-FR"
      )} €</td><td>${eco.toLocaleString("fr-FR")} €</td></tr>`;
    })
    .join("\n");
  return `<table>\n<thead><tr><th>Prix du bien</th><th>${ancienLabel}</th><th>Frais neuf</th><th>Économie</th></tr></thead>\n<tbody>\n${rows}\n</tbody>\n</table>`;
}

function injectSection(html, sectionTitle, contentHtml) {
  const re = new RegExp(
    `(<h2>\\s*${escapeReg(
      sectionTitle
    )}\\s*</h2>)([\\s\\S]*?)(?=(<h2>|</body>))`,
    `i`
  );
  if (!re.test(html)) return html;
  return html.replace(re, `$1\n${contentHtml}\n`);
}

function escapeReg(s) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

const overrides = {
  "06": {
    prices: [500000, 300000, 1200000, 450000, 750000],
    localAdvices: [
      "Profitez du taux TVA 5,5 % encore disponible sur Carros-Le-Pouget jusqu’en 2026.",
      "À Grasse, la CCPL rembourse 1 500 € de frais de notaire pour les primo-accédants < 30 ans.",
    ],
    localFaqs: [
      {
        q: "Les Monégasques doivent-ils verser une taxe additionnelle à Cannes ?",
        a: "Les règles fiscales varient selon la résidence principale; rapprochez-vous du service fiscal de la commune pour confirmation.",
      },
      {
        q: "Existe-t-il une surtaxe « résidence secondaire » à Nice ?",
        a: "Certaines communes appliquent des majorations pour les résidences secondaires : renseignez-vous auprès de la mairie.",
      },
    ],
    sources: [
      { label: "Tarif 2025 – CSN", url: "https://notaires.fr" },
      {
        label: "Fichier DVF 2024 – DGFiP",
        url: "https://data.dvf.etalab.gouv.fr",
      },
      { label: "Annuaire – notaires.fr", url: "https://annuaire.notaires.fr" },
      { label: "Stats – INSEE PACA", url: "https://insee.fr" },
    ],
  },
  "01": {
    prices: [200000, 500000, 180000, 750000, 350000],
    localAdvices: [
      "Dans le Pays de Gex, demandez la ristourne « frontalier » de 0,20 % appliquée par trois études.",
      "À Oyonnax, la VEFA dans l’éco-quartier de la Plaine de l’Yerres exonère de taxe d’aménagement.",
    ],
    localFaqs: [
      {
        q: "Le permis G frontalier réduit-il les frais de notaire dans le Pays de Gex ?",
        a: "Certaines mesures facilitent les acquisitions frontalières; consultez une étude locale pour détails.",
      },
      {
        q: "Faut-il un notaire suisse pour une donation transfrontalière ?",
        a: "Pour des donations impliquant la Suisse, il est recommandé de consulter un notaire ou avocat fiscaliste compétent en droit international.",
      },
    ],
    sources: [
      { label: "INSEE Auvergne-Rhône-Alpes", url: "https://insee.fr" },
      { label: "DGFiP – DVF 2024", url: "https://data.dvf.etalab.gouv.fr" },
      { label: "Notaires.fr", url: "https://notaires.fr" },
      { label: "Barème 2025 – CSN", url: "https://notaires.fr" },
    ],
  },
};

function makeAdvicesHtml(localAdvices) {
  const national = [
    "Négociez les éléments mobiliers hors acte pour réduire l’assiette taxable.",
    "Comparez plusieurs études notariales : les honoraires sont négociables.",
  ];
  const items = [...localAdvices.slice(0, 2), ...national];
  return (
    "<h2>Conseils d'optimisation</h2>\n<ul>\n" +
    items.map((it) => `<li>${it}</li>`).join("\n") +
    "\n</ul>"
  );
}

function makeFaqsHtml(localFaqs, input) {
  const generic = [
    {
      q: "Quelle différence de frais entre ancien et neuf ?",
      a: `Le neuf bénéficie généralement de taux réduits (~${(
        +input.neuf_pct || 2
      ).toFixed(2)}%) contre ~${(+input.ancien_pct || 7).toFixed(
        2
      )}% pour l'ancien.`,
    },
    {
      q: "Combien de temps pour finaliser une transaction ?",
      a: "Comptez généralement 8 à 12 semaines entre compromis et signature.",
    },
  ];
  const faqs = [...generic, ...localFaqs.slice(0, 2)];
  return (
    "<h2>FAQ</h2>\n" +
    faqs.map((f) => `<h3>${f.q}</h3>\n<p>${f.a}</p>`).join("\n")
  );
}

function makeSourcesHtml(sources) {
  return (
    "<h2>Sources</h2>\n<ul>\n" +
    sources
      .map(
        (s) =>
          `<li><a href="${s.url}" target="_blank" rel="noopener">${s.label}</a></li>`
      )
      .join("\n") +
    "\n</ul>"
  );
}

function insertJsonLd(html, jsonld) {
  const ld = `<script type="application/ld+json">${JSON.stringify(
    jsonld,
    null,
    2
  )}</script>`;
  return html.replace(/<\/body>/i, `${ld}\n</body>`);
}

function applyFinal(code) {
  const input = readInput(code) || {};
  const ov = overrides[code];
  if (!ov) {
    console.log("No overrides for", code);
    return;
  }
  const page = path.join(PAGES_DIR, `frais-notaire-${code}.html`);
  if (!fs.existsSync(page)) {
    console.error("Page not found", page);
    return;
  }
  backup(page);
  let html = fs.readFileSync(page, "utf8");

  // table
  const ancienPct = input.ancien_pct || input.ancienPct || 7.0;
  const neufPct = input.neuf_pct || input.neufPct || 2.5;
  const tableHtml = makeTableHtml(ov.prices, ancienPct, neufPct, true);
  html = injectSection(
    html,
    "Ancien vs Neuf : frais de notaire 2025",
    tableHtml
  );

  // advices
  html = injectSection(
    html,
    "Conseils d’optimisation",
    makeAdvicesHtml(ov.localAdvices)
  );

  // FAQ
  html = injectSection(html, "FAQ", makeFaqsHtml(ov.localFaqs, input));

  // sources
  html = injectSection(html, "Sources", makeSourcesHtml(ov.sources));

  // jsonld
  const jsonld = input.jsonld || {
    "@context": "https://schema.org",
    "@type": "Place",
    name: input.departement_nom || code,
    identifier: `DEP-${code}`,
  };
  html = insertJsonLd(html, jsonld);

  fs.writeFileSync(page, html, "utf8");
  console.log("Finalized", page);
}

const codes = process.argv.slice(2);
if (codes.length === 0) {
  console.log("Usage: node finalize-pages.cjs 06 01");
  process.exit(2);
}
codes.forEach((c) => applyFinal(String(c).padStart(2, "0")));
