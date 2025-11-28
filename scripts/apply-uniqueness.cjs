#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PAGES_DIR = path.join(root, "src", "pages", "blog", "departements");
const REQ_DIR = path.join(root, "reports", "deepseek-requests");

function readRequest(code) {
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

function ensureArray(a) {
  return Array.isArray(a) ? a : [];
}

function shortNationalAdvices(code) {
  // deterministic small variants per code
  const v = (code.charCodeAt(0) || 65) % 5;
  const variants = [
    [
      "Négociez les éléments mobiliers hors acte pour réduire l’assiette taxable.",
      "Demandez si un jeune notaire propose une remise sur ses émoluments.",
    ],
    [
      "Prévoyez la VEFA pour réduire significativement les frais sur le neuf.",
      "Vérifiez l’exonération possible des frais pour certaines aides locales.",
    ],
    [
      "Distinguez mobilier inclus et mobilier vendu séparément pour limiter la base taxable.",
      "Comparez plusieurs études notariales : les honoraires sont négociables.",
    ],
    [
      "En VEFA, vérifiez la répartition TVA/frais pour optimiser votre budget.",
      "Envisagez un frais-partage entre acheteur et vendeur sur certains frais annexes.",
    ],
    [
      "Demandez l’identification claire des débours pour éviter les frais cachés.",
      "Consultez un jeune notaire pour une approche souvent plus flexible sur les honoraires.",
    ],
  ];
  return variants[v % variants.length];
}

function buildIntro(input) {
  const name =
    input.departement_nom || input.departement_numero || "le département";
  const ancien = input.ancien_pct ? (+input.ancien_pct).toFixed(1) : "7 à 8";
  const neuf = input.neuf_pct ? (+input.neuf_pct).toFixed(1) : "2 à 3";
  return `<h2>Introduction</h2>\n<p>À ${name}, comptez environ ${ancien}% de droits de mutation (ancien) contre ${neuf}% dans le neuf — un poste à prévoir dans votre budget d’acquisition.</p>`;
}

function buildFaqBlock(input) {
  const localFaqs = ensureArray(input.local_faqs).slice(0, 2);
  const generic = [
    {
      q: "Quelle différence de frais entre ancien et neuf ?",
      a: `Globalement, le neuf bénéficie de frais réduits (≈ ${(
        +input.neuf_pct || 2
      ).toFixed(2)}%) contre ≈ ${(+input.ancien_pct || 7).toFixed(
        2
      )}% pour l'ancien.`,
    },
    {
      q: "Combien de temps pour finaliser une transaction ?",
      a: "Comptez en moyenne 8 à 12 semaines entre compromis et signature selon la complexité du dossier.",
    },
  ];
  const faqs = [...generic, ...localFaqs];
  let out = "<h2>FAQ</h2>\n";
  faqs.forEach((f) => {
    out += `<h3>${f.q}</h3>\n<p>${f.a}</p>\n`;
  });
  return out;
}

function buildAdvices(input, code) {
  const local = ensureArray(input.local_advices).slice(0, 2);
  const national = shortNationalAdvices(code);
  const items = [...local, ...national];
  let s = "<h2>Conseils d'optimisation</h2>\n<ul>\n";
  items.forEach((it) => (s += `<li>${it}</li>\n`));
  s += "</ul>\n";
  return s;
}

function buildSources(input) {
  const srcs = ensureArray(input.sources_shuffled).slice(0, 4);
  let s = "<h2>Sources</h2>\n<ul>\n";
  srcs.forEach(
    (it) =>
      (s += `<li><a href="${it.url}" target="_blank" rel="noopener">${it.label}</a></li>\n`)
  );
  s += "</ul>\n";
  return s;
}

function replaceSection(html, startTag, newHtml) {
  const re = new RegExp(
    `(<h2>\\s*${startTag}\\s*</h2>)([\\s\\S]*?)(?=(<h2>|</body>))`,
    "i"
  );
  if (!re.test(html)) return html;
  return html.replace(re, `$1\n${newHtml}\n`);
}

function insertJsonLd(html, jsonld) {
  const ld = `<script type="application/ld+json">${JSON.stringify(
    jsonld,
    null,
    2
  )}</script>`;
  return html.replace(/<\/body>/i, `${ld}\n</body>`);
}

function applyToCode(code) {
  const input = readRequest(code);
  if (!input) {
    console.error("Missing request for", code);
    return;
  }
  const page = path.join(PAGES_DIR, `frais-notaire-${code}.html`);
  if (!fs.existsSync(page)) {
    console.error("Missing page", page);
    return;
  }
  const bak = backup(page);
  console.log("Backed up", page, "->", bak);
  let html = fs.readFileSync(page, "utf8");

  // Intro
  html = replaceSection(html, "Introduction", buildIntro(input));

  // Table
  if (input.table_html) {
    html = replaceSection(
      html,
      "Ancien vs Neuf : frais de notaire 2025",
      input.table_html
    );
  }

  // Advices
  html = replaceSection(
    html,
    "Conseils d’optimisation",
    buildAdvices(input, code)
  );

  // FAQ
  html = replaceSection(html, "FAQ", buildFaqBlock(input));

  // Sources
  html = replaceSection(html, "Sources", buildSources(input));

  // JSON-LD
  if (input.jsonld) html = insertJsonLd(html, input.jsonld);

  fs.writeFileSync(page, html, "utf8");
  console.log("Updated", page);
}

const codes = process.argv.slice(2);
if (codes.length === 0) {
  console.log("Usage: node apply-uniqueness.cjs <code> [<code2> ...]");
  process.exit(2);
}

codes.forEach(applyToCode);
