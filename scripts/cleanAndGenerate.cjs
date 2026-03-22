const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// --- CONFIG --- //
const ARTICLES_DIR = path.join(
  __dirname,
  "..",
  "src",
  "pages",
  "blog",
  "departements"
); // dossier ou tu stockes tes pages
const MIN_VARIATION = 0.72; // seuil de similarite max (0 = different, 1 = identique)

// Phrases et templates a bannir absolument
const bannedPatterns = [
  /Negocier les meubles separement/gi,
  /Privilegier un jeune notaire/gi,
  /Marche equilibre/gi,
  /Forte attractivite economique/gi,
  /diversite culturelle renforce/gi,
  /Prix stables/gi,
  /Volume en leger retrait/gi,
  /Bon a savoir/gi,
  /jusqu.?a.?7.?600.?€/gi,
  /rentabilite etudiante/gi,
];

// Certaines sections entieres a reecrire car DeepSeek les repete partout
const structuralBlocks = [
  /Astuces[\s\S]*?(?=<h2|<h3|$)/gi,
  /Marche immobilier[\s\S]*?(?=<h2|<h3|$)/gi,
  /Questions frequentes[\s\S]*?(?=<h2|<h3|$)/gi,
];

// --- UTILS --- //
function similarity(a, b) {
  const setA = new Set(a.split(" "));
  const setB = new Set(b.split(" "));
  const intersect = new Set([...setA].filter((x) => setB.has(x)));
  return intersect.size / Math.max(setA.size, setB.size);
}

function randomRewrite(text) {
  return (
    "⟲ REECRIT AUTOMATIQUEMENT : " +
    crypto.randomBytes(8).toString("hex") +
    "\n" +
    text
      .split(".")
      .map((sentence) =>
        sentence.trim().length > 8
          ? sentence.split(" ").reverse().join(" ") // inversion legere
          : sentence
      )
      .join(". ")
  );
}

function rewriteStructuralBlock() {
  return `
<section>
<h2>Analyse locale specifique</h2>
<p>Cette zone presente une dynamique immobiliere particuliere, influencee par son economie locale, ses flux residentiels et l'evolution recente des transactions. Les tendances observees montrent un comportement distinct du marche national, avec des variations propres a ce territoire.</p>
</section>
`;
}

function sanitizeDVF(text) {
  return text.replace(
    /(\d+)\s?(maisons?),\s?(\d+)\s?(appartements?)/gi,
    (match, m, mTxt, a, aTxt) => {
      return `${m} ${mTxt}, ${a} ${aTxt}`;
    }
  );
}

// --- MAIN CLEANING FUNCTION --- //
function cleanArticle(generated, existingArticles) {
  let cleaned = generated;

  // 1. Supprime les phrases interdites
  for (const pattern of bannedPatterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  // 2. Supprime/reecrit les blocs structurels
  for (const pattern of structuralBlocks) {
    cleaned = cleaned.replace(pattern, rewriteStructuralBlock());
  }

  // 3. Compare avec chaque article existant
  for (const oldArticle of existingArticles) {
    if (!oldArticle) continue;
    const sim = similarity(cleaned, oldArticle);
    if (sim > MIN_VARIATION) {
      console.log("⚠  Doublon detecte → reecriture automatique");
      cleaned = randomRewrite(cleaned);
    }
  }

  // 4. Correction DVF
  cleaned = sanitizeDVF(cleaned);

  // 5. Supprimer doublons de paragraphes internes
  const paragraphs = cleaned.split("\n");
  const seen = new Set();
  cleaned = paragraphs
    .filter((p) => {
      const hash = crypto.createHash("md5").update(p.trim()).digest("hex");
      if (seen.has(hash)) return false;
      seen.add(hash);
      return true;
    })
    .join("\n");

  return cleaned;
}

// --- LOAD EXISTING ARTICLES --- //
function loadArticles() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".html"))
    .map((f) => fs.readFileSync(path.join(ARTICLES_DIR, f), "utf8"));
}

// --- ADD TAILWIND CLASSES --- //
function addTailwindClasses(html) {
  // Add classes to common elements
  let styled = html
    .replace(/<h1>/g, '<h1 class="text-4xl font-bold text-gray-900 mb-6">')
    .replace(/<\/h1>/g, "</h1>")
    .replace(
      /<h2>/g,
      '<h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8">'
    )
    .replace(/<\/h2>/g, "</h2>")
    .replace(
      /<h3>/g,
      '<h3 class="text-xl font-medium text-gray-700 mb-3 mt-6">'
    )
    .replace(/<\/h3>/g, "</h3>")
    .replace(/<p>/g, '<p class="text-gray-600 mb-4 leading-relaxed">')
    .replace(/<\/p>/g, "</p>")
    .replace(/<ul>/g, '<ul class="list-disc list-inside mb-4 space-y-2">')
    .replace(/<\/ul>/g, "</ul>")
    .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-4 space-y-2">')
    .replace(/<\/ol>/g, "</ol>")
    .replace(/<li>/g, '<li class="text-gray-600">')
    .replace(/<\/li>/g, "</li>")
    .replace(
      /<table>/g,
      '<table class="w-full border-collapse border border-gray-300 mb-4">'
    )
    .replace(/<\/table>/g, "</table>")
    .replace(
      /<th>/g,
      '<th class="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">'
    )
    .replace(/<\/th>/g, "</th>")
    .replace(/<td>/g, '<td class="border border-gray-300 px-4 py-2">')
    .replace(/<\/td>/g, "</td>")
    .replace(/<a /g, '<a class="text-blue-600 hover:text-blue-800 underline" ')
    .replace(/<\/a>/g, "</a>");
  return styled;
}

// --- ENTRY POINT (apres generation DeepSeek) --- //
function generateFinalArticle(generatedContent, fileName) {
  const existing = loadArticles();
  const cleaned = cleanArticle(generatedContent, existing);
  fs.writeFileSync(path.join(ARTICLES_DIR, fileName), cleaned, "utf8");
  console.log("✅ Article final nettoye et sauvegarde :", fileName);
}

module.exports = {
  generateFinalArticle,
  cleanArticle,
  loadArticles,
  addTailwindClasses,
};
