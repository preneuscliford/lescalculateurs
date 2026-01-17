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

// -----------------------------------------------------------------------------
// 1. AVERTISSEMENT JURIDIQUE VISIBLE
// -----------------------------------------------------------------------------
const WARNING_HTML = `
    <div class="mb-8 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
      <p class="text-sm text-orange-800 m-0">
        <strong>⚠️ Avertissement :</strong> Les montants et pourcentages indiqués sur cette page sont fournis à titre purement informatif, sur la base des barèmes notariaux en vigueur. Ils ne constituent ni un devis, ni un conseil juridique. Seul un notaire est habilité à établir le montant définitif des frais lors de la signature de l’acte authentique.
      </p>
    </div>
`;

function injectWarning(articleHtml) {
  if (articleHtml.includes("⚠️ Avertissement")) return articleHtml;
  
  const h2Regex = /<h2[^>]*>/i;
  const match = articleHtml.match(h2Regex);
  if (match) {
    return articleHtml.replace(match[0], `${WARNING_HTML}\n${match[0]}`);
  }
  return WARNING_HTML + articleHtml;
}

// -----------------------------------------------------------------------------
// 2. SUPPRESSION MONTANTS EXACTS -> OPTION A (SAFE)
// -----------------------------------------------------------------------------
function sanitizeAmountsOptionA(articleHtml) {
  let out = articleHtml;

  // 1. Montants en € dans les cellules de tableaux
  out = out.replace(
    /<td[^>]*class="[^"]*font-bold[^"]*text-(?:orange|blue)-600[^"]*"[^>]*>\s*(?:≈\s*)?[\d\s \u00a0]+(?:,\d+)?€\s*<\/td>/gi,
    '<td class="px-6 py-4 font-bold text-blue-600">à estimer via le calculateur</td>'
  );

  // 2. Montants en € dans les textes
  // On cible les montants > 100 € isolés
  out = out.replace(
    /\b(?:≈\s*)?(\d{1,3}(?:[\s ]\d{3})+)[\s ]*€\b/gi,
    "montant calculé selon votre situation"
  );
  out = out.replace(/\b\d{1,3}\s+\d{3}\s*€\b/gi, "montant calculé selon votre situation");
  // Cas avec décimales (ex: 9 788,15 €)
  out = out.replace(/\b\d{1,3}(?:[\s ]\d{3})*(?:,\d{1,2})?\s*€\b/gi, "montant calculé selon votre situation");
  
  // 3. Montants spécifiques résiduels
  out = out.replace(
    /<strong>\s*[\d\s ]+(?:,\d+)?€\s*<\/strong>/gi,
    "<strong>montant calculé selon votre situation</strong>"
  );
  // Cas spécifique Paris : ≈ 330 €
  out = out.replace(/≈\s*330\s*€/gi, "montant calculé selon votre situation");
  out = out.replace(/≈\s*220\s*€/gi, "montant calculé selon votre situation");
  
  // Cas spécifique 39 809 € (dans un span text-orange-600)
  out = out.replace(
    /<span class="font-bold text-orange-600">[\d\s ]+(?:,\d+)?€<\/span>/gi,
    '<span class="font-bold text-orange-600">à estimer via le calculateur</span>'
  );

  // Nettoyage économies chiffrées
  out = out.replace(
    /Économie potentielle\s*:\s*<strong>[\d\s\u202f\u00a0-]+€<\/strong>/gi,
    "Économie potentielle : <strong>variable selon le mobilier</strong>"
  );

  // Nettoyage placeholders
  out = out.replace(/montant variable/gi, "montant calculé selon votre situation");
  out = out.replace(/un taux variable/gi, "taux réglementé");

  return out;
}

// -----------------------------------------------------------------------------
// 3. NEUTRALISATION EXEMPLES CHIFFRÉS (OPTION A)
// -----------------------------------------------------------------------------
function sanitizeExamplesOptionA(articleHtml) {
  let out = articleHtml;

  // Remplace les blocs de détails chiffrés
  out = out.replace(
    /<span class="font-bold">\s*[\d\s ]+(?:,\d+)?€\s*<\/span>/gi,
    '<span class="font-bold">à estimer via le calculateur</span>'
  );
  
  // Mensualité (avec ou sans ≈)
  out = out.replace(
    /<span class="text-3xl font-bold text-blue-700">\s*(?:≈\s*)?[\d\s ]+(?:,\d+)?€\/mois\s*<\/span>/gi,
    '<span class="text-3xl font-bold text-blue-700">variable selon taux</span>'
  );

  // Taux précis
  out = out.replace(
    /<span class="font-bold">\s*\d+[,\.]\d+\s*%\s*<\/span>/gi,
    '<span class="font-bold">taux du marché</span>'
  );

  // Titre "Exemple chiffré" -> "Exemple pédagogique"
  out = out.replace(
    /📝 Exemple chiffré pour/gi,
    "📝 Exemple de simulation pour"
  );
  
  // Intro de l'exemple
  out = out.replace(
    /avec les caractéristiques suivantes\s*:/gi,
    "pour comprendre les postes de dépenses :"
  );

  return out;
}

// -----------------------------------------------------------------------------
// 4. HARMONISATION ET NETTOYAGE TEXTUEL
// -----------------------------------------------------------------------------
function normalizeTextAndPlaceholders(articleHtml) {
  let out = articleHtml;

  // Supprime les "≈" restants devant du texte
  out = out.replace(/≈\s*à estimer/gi, "à estimer");
  out = out.replace(/≈\s*montant/gi, "montant");

  // Remplacement des pourcentages précis par fourchettes dans les textes
  out = out.replace(/\b7[,.]\d+\s*%/gi, "environ 7 à 8 %");
  out = out.replace(/\b2[,.]\d+\s*%/gi, "environ 2 à 3 %");
  
  // Cas Paris (8,22 etc)
  out = out.replace(/\b8[,.]22\b/gi, "environ 7 à 8 %");
  out = out.replace(/\b6[,.]3185\s*%/gi, "taux réglementé");
  out = out.replace(/≈\s*6,3185\s*%/gi, "taux réglementé"); // spécifique Paris
  out = out.replace(/≈\s*2,61\s*%/gi, "environ 2 à 3 %"); // spécifique Paris

  // Nettoyage placeholders visibles
  out = out.replace(/une activité variable/gi, "variable selon la période");
  out = out.replace(/activité variable/gi, "variable selon la période");
  out = out.replace(/médiane : variable/gi, "prix du marché");
  
  // Nettoyage résidus
  out = out.replace(
    /soit une économie de <strong>montant calculé selon votre situation<\/strong>/gi,
    "soit une économie significative selon le prix du bien"
  );
  out = out.replace(
    /peut dépasser montant calculé selon votre situation pour un bien de 200 000 €/gi,
    "peut être significative selon le prix du bien"
  );
  
  // Nettoyage résidu "montant calculé... d'écart"
  out = out.replace(
    /<strong>montant calculé selon votre situation<\/strong> d’écart/gi,
    "<strong>un écart significatif</strong>"
  );

  // Tableaux : Taux des frais
  out = out.replace(/<td[^>]*>\s*≈\s*7,87\s*<\/td>/gi, '<td class="px-6 py-4 text-gray-700">environ 7 à 8 %</td>');
  out = out.replace(/<td[^>]*>\s*≈\s*2,29\s*<\/td>/gi, '<td class="px-6 py-4 text-gray-700">environ 2 à 3 %</td>');
  out = out.replace(/<td[^>]*>\s*≈\s*2,61\s*<\/td>/gi, '<td class="px-6 py-4 text-gray-700">environ 2 à 3 %</td>');

  return out;
}

function ensureSafeMetaDescription(html) {
  return html.replace(
    /Tableau comparatif ancien\/neuf,\s*exemples concrets et simulateur officiel gratuit\./gi,
    "Estimation indicative et simulateur gratuit."
  );
}

function sanitizeOne(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  
  let html = original;
  html = ensureSafeMetaDescription(html);

  html = withArticle(html, (article) => {
    let out = article;
    out = injectWarning(out);
    out = sanitizeAmountsOptionA(out);
    out = sanitizeExamplesOptionA(out);
    out = normalizeTextAndPlaceholders(out);
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
