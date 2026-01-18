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
// HARMONISATION FINALE (PARIS 75) - Nettoyage résiduel
// -----------------------------------------------------------------------------
function harmonizeParis(articleHtml) {
  let out = articleHtml;

  // Remplace "à estimer via le calculateur" dans les cellules de montant déjà "bold text-orange-600"
  // pour éviter les doublons ou incohérences de style
  
  // Correction spécifique : ≈ 3 030 €/mois (Paris 75)
  out = out.replace(
    /≈ 3\s*030\s*€\/mois/gi,
    "variable selon taux"
  );
  
  // Correction spécifique : 9 788,15 €
  out = out.replace(
    /9\s*788,15\s*€/gi,
    "montant calculé selon votre situation"
  );

  return out;
}

function sanitizeOne(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  let html = original;

  html = withArticle(html, (article) => {
    let out = article;
    out = harmonizeParis(out);
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
