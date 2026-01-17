import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const DEPT_DIR = path.join(ROOT, "src", "pages", "blog", "departements");

function listHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".html"))
    .map((e) => path.join(dir, e.name));
}

function extractDepInfo(html, fallbackCode) {
  const h1 = html.match(/Frais de notaire 2026 en\s+([^<(]+)\s*\(([^)]+)\)/i);
  if (h1) {
    const nom = h1[1].trim().replace(/^(à|en|dans)\s+/i, "").trim();
    return { nom, code: h1[2].trim() };
  }
  const title = html.match(/Frais de notaire 2026\s+([^<(]+)\s*\(([^)]+)\)/i);
  if (title) {
    const nom = title[1].trim().replace(/^(à|en|dans)\s+/i, "").trim();
    return { nom, code: title[2].trim() };
  }
  return { nom: "ce département", code: fallbackCode };
}

function withArticle(html, transform) {
  const start = html.indexOf("<article");
  const end = html.indexOf("</article>");
  if (start === -1 || end === -1 || end <= start) return html;
  const startTagEnd = html.indexOf(">", start);
  if (startTagEnd === -1) return html;
  const before = html.slice(0, startTagEnd + 1);
  const article = html.slice(startTagEnd + 1, end);
  const after = html.slice(end);
  return before + transform(article) + after;
}

function ensureSafeMetaDescription(html) {
  return html.replace(
    /Tableau comparatif ancien\/neuf,\s*exemples concrets et simulateur officiel gratuit\./gi,
    "Estimation indicative et simulateur gratuit."
  );
}

function normalizeFAQYear(html) {
  return html.replace(
    /(Frais de notaire\s+[^<"]+)\s+2025(\s*:\s*neuf\s+ou\s+ancien\s*\?)/gi,
    "$1 2026$2"
  );
}

function replaceFAQJsonLdPercentAnswers(html) {
  return html.replace(
    /"acceptedAnswer":\s*\{\s*"@type":\s*"Answer",\s*"text":\s*"[^"]*%[^"]*"\s*\}/g,
    `"acceptedAnswer": {"@type": "Answer", "text": "Les frais de notaire varient selon le type de bien (ancien ou neuf) et les formalités. Utilisez le calculateur pour un montant exact et à jour."}`
  );
}

function fixHighlightsWording(articleHtml, dep) {
  const re = /(<div[^>]*id="dept-highlights"[^>]*>)([\s\S]*?)(<\/div>)/i;
  const match = articleHtml.match(re);
  if (!match) return articleHtml;
  const inner = match[2];

  let fixed = inner;
  fixed = fixed.replace(
    /Pour un achat immobilier en 2026 en\s+[^:<]+/gi,
    "Pour un achat immobilier en France en 2026, les frais de notaire dépendent du type de bien et du département"
  );
  fixed = fixed.replace(
    /En 2026, les frais de notaire y oscillent entre[\s\S]*?<\/strong>\s*\(ancien\)[^<]*,/gi,
    "En 2026, les frais de notaire y représentent généralement environ <strong>2 à 3 %</strong> pour un bien <strong>neuf (VEFA)</strong> et environ <strong>7 à 8 %</strong> pour un bien <strong>ancien</strong>, selon la nature du bien et les formalités,"
  );
  fixed = fixed.replace(
    /À\s+[^<]+?\s*\(\s*[^)]+\s*\),?\s*ils représentent généralement\s*:/gi,
    `À ${dep.nom} (${dep.code}), ils représentent généralement :`
  );
  fixed = fixed.replace(/7[,.\s]*39%/gi, "7 à 8 %");
  fixed = fixed.replace(/2[,.\s]*2%/gi, "2 à 3 %");

  return articleHtml.replace(re, `$1${fixed}$3`);
}

function replaceEuroFiguresKeepStructure(articleHtml) {
  let out = articleHtml;
  out = out.replace(/[0-9][0-9\s\u202f\u00a0 ]*[,\.]?[0-9]*\s*M€/gi, "montant variable");
  out = out.replace(/[0-9][0-9\s\u202f\u00a0 ]*[,\.]?[0-9]*\s*k€/gi, "montant variable");
  out = out.replace(/[0-9][0-9\s\u202f\u00a0 ]*[,\.]?[0-9]*\s*€/gi, "montant variable");
  return out;
}

function sanitizeContradictionsAndPrecisePercent(articleHtml) {
  let out = articleHtml;
  out = out.replace(/≈\s*7[,\.]\d{1,2}(?:&nbsp;)?\s*%?/gi, "≈ 7 à 8 %");
  out = out.replace(/≈\s*2[,\.]\d{1,2}(?:&nbsp;)?\s*%?/gi, "≈ 2 à 3 %");
  out = out.replace(/0[,.\s]*715\s*%/gi, "un taux variable");
  out = out.replace(
    /Entre\s*<strong>\s*4%\s*<\/strong>\s*\(neuf\)\s*et\s*<strong>\s*[0-9\s\u202f\u00a0,.]+%\s*<\/strong>\s*\(ancien\)/gi,
    "Environ <strong>7 à 8 %</strong> (ancien) et <strong>2 à 3 %</strong> (neuf/VEFA)"
  );
  out = out.replace(
    /<p class="mt-2 text-gray-700">Entre\s*<strong>\s*4%\s*<\/strong>\s*\(neuf\)[\s\S]*?<\/p>/gi,
    `<p class="mt-2 text-gray-700">En 2026, les frais de notaire varient surtout selon le type de bien (ancien ou neuf) et les formalités. Pour un montant exact et à jour, utilisez le calculateur.</p>`
  );
  out = out.replace(
    /En 2026,\s*ces frais représentent entre\s*<strong>\s*4%\s*et\s*[0-9\s\u202f\u00a0,.]+%\s*du prix d'achat\s*<\/strong>[\s\S]*?(?=<\/p>)/gi,
    "En 2026, les frais de notaire varient principalement selon le type de bien (ancien ou neuf) et les formalités. Ils se situent généralement dans les fourchettes nationales observées"
  );
  out = out.replace(/\b7[,\.]\d{1,2}%/gi, "7 à 8 %");
  out = out.replace(/\b2[,\.]\d{1,2}%/gi, "2 à 3 %");
  out = out.replace(/\b\d+[,\.]\d{1,3}\s*%/gi, "un taux variable");
  out = out.replace(/7[,.\s]*39%/gi, "7 à 8 %");
  out = out.replace(/2[,.\s]*2%/gi, "2 à 3 %");
  out = out.replace(/2[,.\s]*29%/gi, "2 à 3 %");
  out = out.replace(/7[,.\s]*4%/gi, "7 à 8 %");
  return out;
}

function sanitizeSavings(articleHtml) {
  let out = articleHtml;
  out = out.replace(
    /jusqu['’]à\s*<strong>[\s\S]*?€\s*d['’]économie<\/strong>[\s\S]*?(?=<\/p>)/gi,
    "une économie significative selon le prix du bien et les formalités applicables"
  );
  out = out.replace(
    /Économie potentielle\s*:\s*<strong>[\s\S]*?<\/strong>/gi,
    "Acheter certains meubles hors acte notarié peut réduire l’assiette des droits d’enregistrement, dans les limites prévues par la réglementation."
  );
  out = out.replace(/des milliers d['’]euros d['’]économie/gi, "une économie significative");
  return out;
}

function sanitizeDvfAndPrices(articleHtml) {
  let out = articleHtml;
  out = out.replace(/\b\d+\s*(mutations|ventes)\/mois\b/gi, "une activité variable");
  out = out.replace(/\bmédiane\s*:\s*[0-9\s\u202f\u00a0 ]+/gi, "médiane : variable");
  return out;
}

function sanitizeOne(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  const code = path
    .basename(filePath)
    .replace(/^frais-notaire-/, "")
    .replace(/\.html$/, "");
  const dep = extractDepInfo(original, code);

  let html = original;
  html = ensureSafeMetaDescription(html);
  html = normalizeFAQYear(html);
  html = replaceFAQJsonLdPercentAnswers(html);

  html = withArticle(html, (article) => {
    let out = article;
    out = fixHighlightsWording(out, dep);
    out = sanitizeContradictionsAndPrecisePercent(out);
    out = sanitizeSavings(out);
    out = replaceEuroFiguresKeepStructure(out);
    out = sanitizeDvfAndPrices(out);
    return out;
  });

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    return true;
  }
  return false;
}

function main() {
  const files = listHtml(DEPT_DIR);
  let changed = 0;
  for (const f of files) {
    if (sanitizeOne(f)) changed++;
  }
  console.log(JSON.stringify({ files: files.length, changed }, null, 2));
}

main();
