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

function removeFixed200kExamples(html) {
  let out = html;
  out = out.replace(
    /"text":\s*"Pour un bien de 200\s*000\s*€[^"]*"/gi,
    `"text": "L’écart entre ancien et neuf dépend du type de bien et des formalités. Utilisez le calculateur pour un montant exact et à jour."`
  );
  out = out.replace(/\(exemple\s*200[\s\u202f\u00a0]*000\s*€\)/gi, "");
  out = out.replace(/200[\s\u202f\u00a0]*000\s*€/gi, "un prix donné");
  out = out.replace(
    /<li><strong>Combien pour 200[\s\S]*?<\/li>\s*/gi,
    ""
  );
  out = out.replace(
    /Ancien\s*:\s*≈[\s\S]*?€\s*pour[\s\u202f\u00a0]*200[\s\u202f\u00a0]*000[\s\S]*?\)\s*•\s*Neuf\s*:\s*≈[\s\S]*?€\s*pour[\s\u202f\u00a0]*200[\s\u202f\u00a0]*000[\s\S]*?\)\.?/gi,
    "Ancien : ≈ 7–8 % • Neuf (VEFA) : ≈ 2–3 %."
  );
  out = out.replace(
    /Ancien\s*:\s*≈[\s\S]*?€\s*pour\s*un\s+prix\s+donné[\s\S]*?\)\s*•\s*Neuf\s*:\s*≈[\s\S]*?€\s*pour\s*un\s+prix\s+donné[\s\S]*?\)\.?/gi,
    "Ancien : ≈ 7–8 % • Neuf (VEFA) : ≈ 2–3 %."
  );
  out = out.replace(
    /peut dépasser\s+[0-9\s\u202f\u00a0 ]+€[\s\S]*?(?=<\/p>)/gi,
    "peut être significative selon le type de bien et les formalités"
  );
  return out;
}

function removeLocalRepereEuro(html) {
  return html.replace(
    /<div class="bg-white border-2 border-blue-100 rounded-lg p-5 mb-8">[\s\S]*?Repères locaux[\s\S]*?<\/div>/gi,
    `<div class="bg-white border-2 border-blue-100 rounded-lg p-5 mb-8"><h3 class="text-xl font-bold text-gray-900 mb-2">Repères locaux</h3><p class="text-sm text-gray-700">Les frais de notaire varient selon le type de bien et les formalités. Pour un montant exact et à jour, utilisez le calculateur.</p></div>`
  );
}

function replaceHighlights(html, dep) {
  const newBlock =
    `<div class="mt-6 mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 sm:p-5 rounded-r" id="dept-highlights">` +
    `<p class="text-sm sm:text-base text-gray-800 leading-relaxed">` +
    `<strong>💰 Frais de notaire 2026 en ${dep.nom} (${dep.code})</strong><br/>` +
    `Pour un achat immobilier en France en 2026, les frais de notaire dépendent du type de bien et du département.<br/>` +
    `À ${dep.nom} (${dep.code}), ils représentent généralement : ` +
    `– <strong>bien ancien</strong> : environ <strong>7 à 8 %</strong> ` +
    `– <strong>bien neuf (VEFA)</strong> : environ <strong>2 à 3 %</strong>, selon la nature du bien et les formalités.` +
    `<br/><span class="text-xs sm:text-sm text-gray-600">Pour un montant exact et à jour, utilisez le calculateur.</span>` +
    `</p>` +
    `</div>`;

  const re = /<div[^>]*class="[^"]*bg-yellow-50[^"]*"[^>]*>[\s\S]*?<\/div>\s*/i;
  if (re.test(html)) return html.replace(re, newBlock + "\n");

  const anchor = html.match(/<!-- CTA BLOCK END -->/i);
  if (anchor) return html.replace(anchor[0], anchor[0] + "\n" + newBlock);

  const h1 = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/i);
  if (h1) return html.replace(h1[0], h1[0] + "\n" + newBlock);

  return html;
}

function removeTooPrecisePercentages(html) {
  let out = html;
  out = out.replace(
    /"acceptedAnswer":\s*\{\s*"@type":\s*"Answer",\s*"text":\s*"[^"]*%[^"]*"\s*\}/g,
    `"acceptedAnswer": {"@type": "Answer", "text": "Les frais de notaire varient selon le type de bien (ancien ou neuf) et les formalités. Utilisez le calculateur pour un montant exact et à jour."}`
  );
  out = out.replace(
    /"text":\s*"En 2026, les frais de notaire représentent environ\s*[0-9\s\u202f\u00a0,.]+%\s+du prix d'achat dans l'ancien et\s*[0-9\s\u202f\u00a0,.]+%\s+dans le neuf\."/gi,
    `"text": "En 2026, les frais de notaire représentent généralement environ 7 à 8 % du prix d’achat dans l’ancien et environ 2 à 3 % dans le neuf (VEFA), selon la nature du bien et les formalités."`
  );
  out = out.replace(
    /<p class="mt-2 text-gray-700">Entre <strong>[\s\S]*?<\/strong> \(neuf\) et <strong>[\s\S]*?<\/strong> \(ancien\)[\s\S]*?<\/p>/gi,
    `<p class="mt-2 text-gray-700">En 2026, les frais de notaire varient surtout selon le type de bien (ancien ou neuf) et les formalités. Pour un montant exact et à jour, utilisez le calculateur.</p>`
  );
  out = out.replace(
    /<p class="mt-2 text-gray-700">Le <strong>neuf<\/strong>[\s\S]*?L'écart peut représenter des milliers d'euros d'économie\.<\/p>/gi,
    `<p class="mt-2 text-gray-700">Les frais de notaire représentent généralement environ <strong>2 à 3 %</strong> pour un bien <strong>neuf (VEFA)</strong> et environ <strong>7 à 8 %</strong> pour un bien <strong>ancien</strong>, selon la nature du bien et les formalités.</p>`
  );
  out = out.replace(
    /En 2026,\s*ces frais représentent\s*entre\s*<strong>\s*4%\s*et\s*[0-9\s\u202f\u00a0,.]+%\s*du prix d'achat\s*<\/strong>[\s\S]*?(?=<\/p>)/gi,
    "En 2026, les frais de notaire varient principalement selon le type de bien (ancien ou neuf) et les formalités. Ils se situent généralement dans les fourchettes nationales observées"
  );
  out = out.replace(
    /<p class="mt-2 text-gray-700">[\s\S]*?%[\s\S]*?<\/p>/gi,
    `<p class="mt-2 text-gray-700">Les frais de notaire varient selon le type de bien (ancien ou neuf) et les formalités. Utilisez le calculateur pour un montant exact et à jour.</p>`
  );
  out = out.replace(
    /<p class="text-xl text-gray-600 leading-relaxed">[\s\S]*?%[\s\S]*?<\/p>/gi,
    `<p class="text-xl text-gray-600 leading-relaxed">En 2026, les frais de notaire varient principalement selon le type de bien (ancien ou neuf) et les formalités. Pour un montant exact et à jour, utilisez le calculateur.</p>`
  );
  out = out.replace(
    /De\s*<strong>\s*4\s*[%\u00a0 ]*\s*<\/strong>\s*\(neuf[^)]*\)\s*à\s*<strong>\s*7[,\.\s]*[0-9]*\s*%\s*<\/strong>\s*\(ancien\)/gi,
    "Environ <strong>2 à 3 %</strong> (neuf/VEFA) et <strong>7 à 8 %</strong> (ancien)"
  );
  out = out.replace(
    /En 2026, les frais de notaire y oscillent entre\s*<strong>2[,\.]2%\s*<\/strong>\s*\(neuf\)\s*et\s*<strong>7[,\.]39%\s*<\/strong>\s*\(ancien\)[^<]*,/gi,
    "En 2026, les frais de notaire y représentent généralement environ <strong>2 à 3 %</strong> pour un bien <strong>neuf (VEFA)</strong> et environ <strong>7 à 8 %</strong> pour un bien <strong>ancien</strong>, selon la nature du bien et les formalités,"
  );
  out = out.replace(
    /De\s*<strong>\s*4\s*[%\u00a0 ]*\s*<\/strong>\s*\(neuf\)\s*à\s*<strong>\s*7[,\.]39%\s*<\/strong>\s*\(ancien\)/gi,
    "Environ <strong>2 à 3 %</strong> (neuf/VEFA) et <strong>7 à 8 %</strong> (ancien)"
  );
  out = out.replace(/7[,\.]39%/gi, "7 à 8 %");
  out = out.replace(/2[,\.]2%/gi, "2 à 3 %");
  out = out.replace(/2[,\.]29%/gi, "2 à 3 %");
  return out;
}

function removeTarifsOfficielsBlock(html) {
  let out = html;
  out = out.replace(
    /<!--\s*Tarifs Officiels[\s\S]*?-->\s*<div[\s\S]*?<\/div>\s*(?=<!--\s*Hypothèses)/gi,
    `<!-- Tarifs Officiels 2025-2026 -->\n<div class="mt-12 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6"><h3 class="font-bold text-blue-900 mb-4">💼 Tarifs officiels</h3><p class="text-sm text-blue-900 m-0">Les barèmes (droits, émoluments, CSI, formalités) sont réglementés et peuvent évoluer. Pour un montant exact et à jour selon votre dossier, utilisez le calculateur et/ou consultez les sources officielles (notaires.fr, service-public.fr, impots.gouv.fr).</p></div>\n\n`
  );
  out = out.replace(
    /(<!--\s*Hypothèses et Avertissements\s*-->[\s\r\n]*){2,}/gi,
    "<!-- Hypothèses et Avertissements -->\n"
  );
  out = out.replace(
    /Droits réduits VEFA\s*\([\s\S]*?%\s*pour acquisitions de biens neufs\)\.[^<]*<\/p>/gi,
    ""
  );
  out = out.replace(
    /<p class="text-xs sm:text-sm text-gray-600 mb-4">[\s\S]*?0,715%[\s\S]*?<\/p>/gi,
    ""
  );
  return out;
}

function replaceLocalBusinessJsonLd(html, dep) {
  const safe =
    `<!-- LocalBusiness Schema for Notaires -->\n` +
    `<script type="application/ld+json">\n` +
    `{\n` +
    `  "@context": "https://schema.org",\n` +
    `  "@type": "LocalBusiness",\n` +
    `  "name": "Notaires ${dep.nom} (${dep.code})",\n` +
    `  "areaServed": {\n` +
    `    "@type": "AdministrativeArea",\n` +
    `    "name": "${dep.nom}",\n` +
    `    "alternateName": "Département ${dep.code}"\n` +
    `  },\n` +
    `  "url": "https://www.notaires.fr",\n` +
    `  "sameAs": "https://www.notaires.fr",\n` +
    `  "priceRange": "Ancien: 7–8 % / Neuf (VEFA): 2–3 %"\n` +
    `}\n` +
    `</script>`;

  return html.replace(
    /<!--\s*LocalBusiness Schema for Notaires\s*-->[\s\S]*?<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
    safe
  );
}

function removeEuroSavings(html) {
  let out = html;
  out = out.replace(
    /jusqu['’]à\s*<strong>[\s\S]*?€\s*d['’]économie<\/strong>[\s\S]*?(?=<\/p>)/gi,
    "une économie significative selon le prix du bien et les formalités applicables"
  );
  out = out.replace(
    /peut atteindre\s*[0-9\s\u202f\u00a0 ]+€[\s\S]*?(en faveur du neuf|d['’]économie)/gi,
    "peut représenter une économie significative selon le prix du bien et les formalités"
  );
  out = out.replace(
    /<strong>[\s\S]*?€\s*d['’]économie<\/strong>/gi,
    "<strong>une économie significative</strong>"
  );
  out = out.replace(
    /Économie potentielle\s*:\s*<strong>[\s\S]*?€[\s\S]*?<\/strong>/gi,
    "Économie potentielle : <strong>variable selon le dossier</strong>"
  );
  out = out.replace(
    /Économie potentielle\s*:\s*<strong>variable selon le dossier<\/strong>\.?(\s*<span class="text-xs text-gray-500">[\s\S]*?<\/span>)?/gi,
    "Acheter certains meubles hors acte notarié peut réduire l’assiette des droits d’enregistrement, dans les limites prévues par la réglementation."
  );
  out = out.replace(
    /des milliers d['’]euros d['’]économie/gi,
    "une économie significative"
  );
  return out;
}

function neutralizeDvfAndMarketNumbers(html) {
  let out = html;
  out = out.replace(/[0-9][0-9\s\u202f\u00a0 ]*[,\.]?[0-9]*\s*M€/gi, "des montants variables");
  out = out.replace(/[0-9][0-9\s\u202f\u00a0 ]*[,\.]?[0-9]*\s*k€/gi, "des montants variables");
  out = out.replace(/[0-9][0-9\s\u202f\u00a0 ]*\s*€\s*\/\s*m²/gi, "des prix variables");
  out = out.replace(/[0-9][0-9\s\u202f\u00a0 ]*\s*€\/m²/gi, "des prix variables");
  out = out.replace(/[0-9][0-9\s\u202f\u00a0 ]*&nbsp;\/m²/gi, "des prix variables");
  out = out.replace(/[0-9][0-9\s\u202f\u00a0 ]*\/m²/gi, "des prix variables");
  out = out.replace(/[0-9][0-9\s\u202f\u00a0 ]*\s*€/g, "des montants variables");
  out = out.replace(/\b\d+\s*(mutations|ventes)\/mois\b/gi, "une activité variable");
  out = out.replace(/\bmédiane\s*:\s*[0-9\s\u202f\u00a0 ]+/gi, "médiane : variable");
  return out;
}

function ensureLegalWarning(html) {
  if (html.includes("Simulation indicative, sans valeur contractuelle.")) return html;
  const block =
    `<div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">` +
    `<p class="text-sm text-gray-700 m-0">` +
    `⚠️ Avertissement : cette page fournit une information générale basée sur les barèmes en vigueur. ` +
    `Elle ne constitue ni un devis, ni un conseil juridique. ` +
    `Seul un notaire est habilité à établir le montant définitif lors de la signature de l’acte authentique. ` +
    `Simulation indicative, sans valeur contractuelle.` +
    `</p>` +
    `</div>`;
  const re = /<div class="prose prose-lg max-w-none">/i;
  if (re.test(html)) return html.replace(re, (m) => m + "\n" + block + "\n");
  return html;
}

function replaceComparatifTable(html) {
  const table =
    `<div class="overflow-x-auto mb-8">` +
    `<table class="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">` +
    `<thead class="bg-gradient-to-r from-blue-600 to-blue-700 text-white">` +
    `<tr>` +
    `<th class="px-6 py-4 text-left font-semibold">Type de bien</th>` +
    `<th class="px-6 py-4 text-left font-semibold">Part des frais</th>` +
    `</tr>` +
    `</thead>` +
    `<tbody>` +
    `<tr class="border-b border-gray-200 hover:bg-orange-50">` +
    `<td class="px-6 py-4 font-medium text-gray-900">🏡 Bien ancien</td>` +
    `<td class="px-6 py-4 text-gray-700">≈ 7–8 %</td>` +
    `</tr>` +
    `<tr class="hover:bg-blue-50">` +
    `<td class="px-6 py-4 font-medium text-gray-900">🏢 Bien neuf (VEFA)</td>` +
    `<td class="px-6 py-4 text-gray-700">≈ 2–3 %</td>` +
    `</tr>` +
    `</tbody>` +
    `</table>` +
    `</div>`;
  return html.replace(
    /<div class="overflow-x-auto mb-8">[\s\S]*?<\/div>/gi,
    (block) => {
      if (!block.includes("<table")) return block;
      if (!block.includes("€")) return block;
      if (!/Type/i.test(block)) return block;
      return table;
    }
  );
}

function removeBonASavoirEuro(html) {
  return html.replace(
    /<div[^>]*class="[^"]*bg-blue-50[^"]*border-l-4[^"]*border-blue-500[^"]*p-6[^"]*rounded-r-lg"[^>]*>[\s\S]*?<strong>💡 Bon à savoir :<\/strong>[\s\S]*?200\s*000\s*€[\s\S]*?<\/div>/gi,
    `<div class="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg"><p class="text-lg text-gray-800 mb-0"><strong>💡 Bon à savoir :</strong> les frais varient selon le type de bien, le prix et les formalités. Utilisez le calculateur pour un montant exact et à jour.</p></div>`
  );
}

function replaceSection2(html, dep) {
  const re = /<!--\s*Section 2[\s\S]*?-->[\s\S]*?(<!--\s*Section 3[\s\S]*?-->)/i;
  if (!re.test(html)) return html;
  const marker3 = html.match(re)?.[1] ?? "<!-- Section 3 -->";
  const section =
    `<!-- Section 2 -->` +
    `<h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">📊 Exemple pédagogique en ${dep.nom}</h2>` +
    `<p class="text-gray-700 leading-relaxed mb-6">` +
    `Pour un achat immobilier en ${dep.nom}, les frais représentent généralement <strong>≈ 7 % à 8 %</strong> du prix en <strong>ancien</strong> et <strong>≈ 2 % à 3 %</strong> en <strong>neuf (VEFA)</strong>. ` +
    `Ces pourcentages varient selon la nature du bien et les formalités. ` +
    `Pour un montant exact et à jour, utilisez le calculateur.` +
    `</p>` +
    marker3;
  return html.replace(re, section);
}

function removeYellowEuroBlocks(html) {
  return html.replace(
    /<div[^>]*class="[^"]*bg-yellow-50[^"]*"[^>]*>[\s\S]*?€[\s\S]*?<\/div>/gi,
    (block) => {
      if (block.includes('id="dept-highlights"')) return block;
      return `<div class="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8 rounded-r-lg"><p class="text-lg text-gray-800 mb-0"><strong>🔎 À retenir :</strong> l’écart entre ancien et neuf dépend du type de bien et des formalités. Utilisez le calculateur pour un montant exact et à jour.</p></div>`;
    }
  );
}

function removeDeboursIndicatifs(html) {
  let out = html.replace(
    /<div class="bg-white border border-gray-200 rounded-lg p-4 mb-8">[\s\S]*?<strong>Débours indicatifs[\s\S]*?<\/div>/gi,
    `<div class="bg-white border border-gray-200 rounded-lg p-4 mb-8"><p class="text-sm text-gray-700">Les débours et frais de formalités varient selon le dossier (cadastre, copies, formalités). Ils sont précisés par le notaire.</p></div>`
  );
  out = out.replace(
    /<strong>[^<]*Débours indicatifs[\s\S]*?<\/strong>[\s\S]*?cadastre[\s\S]*?<strong>[\s\S]*?€<\/strong>[\s\S]*?conservation[\s\S]*?<strong>[\s\S]*?€<\/strong>\.?/gi,
    `Les débours et frais de formalités varient selon le dossier (cadastre, copies, formalités). Ils sont précisés par le notaire.`
  );
  out = out.replace(
    /<p[^>]*>[\s\S]*?\bdébours\b[\s\S]*?€[\s\S]*?<\/p>/gi,
    `<p class="text-sm text-gray-700">Les débours et frais de formalités varient selon le dossier (cadastre, copies, formalités). Ils sont précisés par le notaire.</p>`
  );
  return out;
}

function rewriteConcreteExampleSections(html, dep) {
  const safeBlock =
    `<h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">📊 Exemple pédagogique en ${dep.nom}</h2>` +
    `<p class="text-gray-700 leading-relaxed mb-6">` +
    `En pratique, les frais dépendent du type de bien (ancien/neuf), du prix et des formalités. ` +
    `En repère, comptez généralement <strong>≈ 7 % à 8 %</strong> en <strong>ancien</strong> et <strong>≈ 2 % à 3 %</strong> en <strong>neuf (VEFA)</strong>. ` +
    `Pour un montant exact et à jour, utilisez le calculateur.` +
    `</p>`;

  let out = html.replace(
    /<h2[^>]*>[\s\S]*?(?:Exemple\s+concret|Cas\s+pratique|Simulation)[\s\S]*?<\/h2>[\s\S]*?(<!--\s*Section 4[\s\S]*?-->)/gi,
    (_m, section4) => safeBlock + "\n" + section4
  );

  out = out.replace(
    /<h2[^>]*>[\s\S]*?(?:Exemple\s+concret|Cas\s+pratique|Simulation)[\s\S]*?<\/h2>[\s\S]*?(<h2[^>]*>)/gi,
    (_m, nextH2) => safeBlock + "\n" + nextH2
  );

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
  html = removeFixed200kExamples(html);
  html = removeTooPrecisePercentages(html);
  html = removeEuroSavings(html);
  html = neutralizeDvfAndMarketNumbers(html);
  html = replaceLocalBusinessJsonLd(html, dep);
  html = removeTarifsOfficielsBlock(html);
  html = removeLocalRepereEuro(html);
  html = replaceHighlights(html, dep);
  html = ensureLegalWarning(html);
  html = replaceComparatifTable(html);
  html = removeDeboursIndicatifs(html);
  html = removeYellowEuroBlocks(html);
  html = removeBonASavoirEuro(html);
  html = replaceSection2(html, dep);
  html = rewriteConcreteExampleSections(html, dep);
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
