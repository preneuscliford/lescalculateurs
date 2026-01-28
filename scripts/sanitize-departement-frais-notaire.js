import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const DEPT_DIR = path.join(ROOT, "src", "pages", "blog", "departements");

function normalizeDepartementCode(code) {
  const c = String(code || "").trim().toUpperCase();
  if (!c) return null;
  if (/^\d{1,2}$/.test(c)) return c.padStart(2, "0");
  if (/^\d{3}$/.test(c)) return c;
  if (c === "2A" || c === "2B") return c;
  return null;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let dept = null;
  let file = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--dept=")) dept = a.slice("--dept=".length);
    else if (a.startsWith("--departement="))
      dept = a.slice("--departement=".length);
    else if (a === "--dept" || a === "--departement" || a === "-d")
      dept = args[i + 1];
    else if (a.startsWith("--file=")) file = a.slice("--file=".length);
    else if (a === "--file" || a === "-f") file = args[i + 1];
  }
  const deptCode = normalizeDepartementCode(dept);
  const filePath = file ? path.resolve(ROOT, file) : null;
  return { deptCode, filePath };
}

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

const PROBLEM_PATTERNS = [
  /�/,
  /Ã./,
  /\?\?/,
  /\bEn Paris\b/i,
  /\bEn Hauts-de-Seine\b/i,
  /\bDans\s+(?:du|de\s+la|de\s+l[’']|de)\b/i,
  /\bDans\s+(?:la|le|les|de|du|des)\s+l[’']/i,
  /\bDans\s+l[’'][A-ZÉÈÀÂÊÎÔÛÄËÏÖÜÇ]/i,
  /\bSource:/i,
  /\bSources:/i,
  /\bbarèmes:/i,
  /\b7\s*à\s*8\s*%/i,
  /%%/,
  /%\s*%/,
  /l['’]écart peut représenter l['’]écart/i,
  /é{2,}conomie/i,
  /l'é{2,}conomie/i,
  /[A-Za-zÀ-ÿ][ \t\u00a0\u202f]{2,}[A-Za-zÀ-ÿ]/,
  /\bdpartemental\b/i,
  /\bdpartement\b/i,
  /\bdpartements\b/i,
  /\bprserv/i,
  /\bspcificit/i,
  /\bmatriser\b/i,
  /\bcot\b/i,
  /\blannuaire\b/i,
  /<\/\/h3>/i,
  /montant calculé selon votre situation/i,
  /\b6,6\s*%/i,
  /\b4\s*%/i,
  /200\s*000\s*€/i,
  /7[\s\u202f\u00a0]*600\s*€/i,
  /≈\s*6,6\s*%/i,
  /≈\s*4\s*%/i,
  /≈ 3\s*030\s*€\/mois/i,
  /9\s*788,15\s*€/i,
];

function hasProblems(html) {
  return PROBLEM_PATTERNS.some((re) => re.test(html));
}

function getArticleDefini(depNom) {
  if (depNom === "Paris") return "Paris";

  const pluriels = [
    "Alpes-de-Haute-Provence",
    "Hautes-Alpes",
    "Alpes-Maritimes",
    "Ardennes",
    "Bouches-du-Rhône",
    "Côtes-d'Armor",
    "Hauts-de-Seine",
    "Landes",
    "Pyrénées-Atlantiques",
    "Hautes-Pyrénées",
    "Pyrénées-Orientales",
    "Deux-Sèvres",
    "Vosges",
    "Yvelines",
  ];
  if (pluriels.includes(depNom)) return "les ";

  const masculinsSinguliers = [
    "Bas-Rhin",
    "Haut-Rhin",
    "Calvados",
    "Cantal",
    "Cher",
    "Doubs",
    "Finistère",
    "Gard",
    "Gers",
    "Jura",
    "Loir-et-Cher",
    "Loiret",
    "Lot",
    "Lot-et-Garonne",
    "Maine-et-Loire",
    "Morbihan",
    "Nord",
    "Pas-de-Calais",
    "Puy-de-Dôme",
    "Rhône",
    "Tarn",
    "Tarn-et-Garonne",
    "Territoire de Belfort",
    "Val-d'Oise",
    "Val-de-Marne",
    "Var",
    "Vaucluse",
  ];
  if (masculinsSinguliers.includes(depNom)) return "le ";

  const masculinsVoyelle = ["Hérault"];
  if (masculinsVoyelle.includes(depNom)) return "l'";

  const voyelles = ["A", "E", "I", "O", "U", "H", "Y", "Î", "É", "È", "Ê", "À"];
  if (voyelles.includes(depNom.charAt(0))) return "l'";

  return "la ";
}

function normalizeNameForArticle(s) {
  let out = String(s || "").trim();
  out = out.replace(/^l[’']/i, "");
  out = out.replace(/^(le|la|les)\s+/i, "");
  return out.trim();
}

function cleanTextNodes(html) {
  const parts = html.split(/(<[^>]+>)/g);
  let inScriptOrStyle = false;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p) continue;
    if (p.startsWith("<") && p.endsWith(">")) {
      if (/^<script\b/i.test(p) || /^<style\b/i.test(p)) inScriptOrStyle = true;
      else if (/^<\/script\b/i.test(p) || /^<\/style\b/i.test(p))
        inScriptOrStyle = false;
      continue;
    }
    if (inScriptOrStyle) continue;
    let t = p;

    t = t.replace(/%%/g, "%");
    t = t.replace(/%\s*%/g, "%");
    t = t.replace(/(\d)\s*%/g, "$1 %");
    t = t.replace(/%\s*à\s*/g, "% à ");

    t = t.replace(/\bEn Paris\b/g, "À Paris");
    t = t.replace(/\bEn Hauts-de-Seine\b/g, "Dans les Hauts-de-Seine");
    t = t.replace(/é{2,}conomie/g, "économie");

    t = t.replace(
      /\bDans\s+(du|de\s+la|de\s+l[’']|de)\s+([^,.;:!?\n]+)(?=[,.;:!?\n])/g,
      (m, _bad, name) => {
        const n = normalizeNameForArticle(name);
        if (!n) return m;
        if (n === "Paris") return "À Paris";
        if (n === "Mayotte") return "À Mayotte";
        if (n === "La Réunion") return "À La Réunion";
        const a = getArticleDefini(n);
        if (a === "le ") return `Dans le ${n}`;
        if (a === "la ") return `Dans la ${n}`;
        if (a === "les ") return `Dans les ${n}`;
        if (a === "l'") return `Dans l’${n}`;
        return `Dans ${n}`;
      }
    );

    t = t.replace(
      /\bDans\s+(?:la|le|les|de|du|des)\s+l[’']([^,.;:!?\n]+)(?=[,.;:!?\n])/g,
      (m, name) => {
        const n = normalizeNameForArticle(name);
        if (!n) return m;
        if (n === "Paris") return "À Paris";
        if (n === "Mayotte") return "À Mayotte";
        if (n === "La Réunion") return "À La Réunion";
        const a = getArticleDefini(n);
        if (a === "le ") return `Dans le ${n}`;
        if (a === "la ") return `Dans la ${n}`;
        if (a === "les ") return `Dans les ${n}`;
        if (a === "l'") return `Dans l’${n}`;
        return `Dans ${n}`;
      }
    );

    t = t.replace(
      /\bDans\s+l[’']([^,.;:!?\n]+)(?=[,.;:!?\n])/g,
      (m, name) => {
        const n = normalizeNameForArticle(name);
        if (!n) return m;
        if (n === "Paris") return "À Paris";
        if (n === "Mayotte") return "À Mayotte";
        if (n === "La Réunion") return "À La Réunion";
        const a = getArticleDefini(n);
        if (a === "le ") return `Dans le ${n}`;
        if (a === "la ") return `Dans la ${n}`;
        if (a === "les ") return `Dans les ${n}`;
        if (a === "l'") return `Dans l’${n}`;
        return `Dans ${n}`;
      }
    );

    t = t.replace(/l['’]écart peut représenter l['’]écart/gi, "L’écart peut représenter");

    t = t.replace(/([A-Za-zÀ-ÿ0-9])\s*:(?=\s|$)/g, "$1 :");
    t = t.replace(/\b7\s*à\s*8\s*%/g, "7 à 9 %");

    t = t.replace(/[ \t\u00a0\u202f]{2,}/g, " ");
    t = t.replace(/[ \t\u00a0\u202f]+([,.;!?])/g, "$1");
    t = t.replace(/([,.;:!?])[ \t\u00a0\u202f]{2,}/g, "$1 ");

    t = t.replace(
      /\b(de|du|des|la|le|les|à|en|dans|sur|et|ou|pour)[ \t\u00a0\u202f]+\1\b/gi,
      "$1"
    );

    parts[i] = t;
  }
  return parts.join("");
}

function sanitizeGlobal(html) {
  let out = html;

  out = out.replace(/montant calculé selon votre situation/gi, "estimer via le calculateur");

  out = out.replace(/\bEn Paris\b/gi, "À Paris");
  out = out.replace(/%%/g, "%");
  out = out.replace(/%\s*%/g, "%");
  out = out.replace(
    /l['’]écart peut représenter l['’]écart/gi,
    "L’écart peut représenter"
  );

  out = out.replace(/é{2,}conomie/gi, "économie");
  out = out.replace(/l'é{2,}conomie/gi, "l'économie");

  out = out.replace(/\bdpartemental\b/gi, "départemental");
  out = out.replace(/\bdpartement\b/gi, "département");
  out = out.replace(/\bdpartements\b/gi, "départements");
  out = out.replace(/\bprserv/gi, "préserv");
  out = out.replace(/\bspcificit/gi, "spécificité");
  out = out.replace(/\bmatriser\b/gi, "maîtriser");
  out = out.replace(/\bcot\b/gi, "coût");
  out = out.replace(/\bconomie\b/gi, "économie");
  out = out.replace(/\bconomique\b/gi, "économique");
  out = out.replace(/\blannuaire\b/gi, "l'annuaire");

  out = out.replace(/<\/\/h3>/gi, "</h3>");

  out = out.replace(
    /En 2025, les frais de notaire représentent environ 6,6\s*% du prix d'achat dans l'ancien et 4\s*% dans le neuf\./gi,
    "Ancien : environ 7 à 9 % • Neuf (VEFA) : environ 2 à 3 % du prix d'achat. Utilisez le simulateur pour une estimation personnalisée."
  );

  out = out.replace(
    /il applique le barème officiel 2025/gi,
    "il applique le barème officiel en vigueur"
  );

  out = out.replace(
    /Pour un bien de 200\s*000\s*€, l'économie peut atteindre 7\s*600\s*€ en choisissant le neuf \(VEFA\)\./gi,
    "Le neuf (VEFA) a généralement des frais plus faibles que l'ancien. Utilisez le simulateur pour comparer selon votre prix et votre dossier."
  );

  out = out.replace(
    /entre\s*<strong>\s*4%\s*et\s*6,6%\s*du prix d'achat\s*<\/strong>\s*selon que vous acquériez/gi,
    'généralement environ <strong>7 à 8 % (ancien)</strong> et <strong>2 à 3 % (neuf/VEFA)</strong> du prix d\'achat selon que vous acquériez'
  );

  out = out.replace(/≈\s*6,6\s*%/gi, "environ 7 à 9 %");
  out = out.replace(/≈\s*4\s*%/gi, "environ 2 à 3 %");

  out = out.replace(
    /Entre\s*<strong>\s*4%\s*<\/strong>\s*\(neuf\)\s*et\s*<strong>\s*6,6%\s*<\/strong>\s*\(ancien\)\s*du prix d'achat/gi,
    "Neuf (VEFA) : <strong>environ 2 à 3 %</strong> • Ancien : <strong>environ 7 à 9 %</strong> du prix d'achat"
  );

  out = out.replace(
    /Le\s*<strong>\s*neuf\s*<\/strong>\s*≈\s*4%\s*et l'<strong>\s*ancien\s*<\/strong>\s*≈\s*6,6%\.?/gi,
    "Le <strong>neuf</strong> se situe généralement autour de <strong>2 à 3 %</strong> et l'<strong>ancien</strong> autour de <strong>7 à 9 %</strong>."
  );

  out = out.replace(
    /jusqu'à\s*<strong>\s*7[\s\u202f\u00a0]*600\s*€ d'économie\s*<\/strong>\s*pour un bien à\s*200[\s\u202f\u00a0]*000\s*€\./gi,
    "l'écart peut représenter une économie notable selon le prix et le dossier."
  );

  out = out.replace(
    /Pour un bien (?:à|de)\s*200[\s\u202f\u00a0]*000\s*€[\s\S]*?7[\s\u202f\u00a0]*600\s*€/gi,
    "Le neuf (VEFA) a généralement des frais plus faibles que l'ancien. Utilisez le simulateur pour comparer."
  );
  out = out.replace(/200[\s\u202f\u00a0]*000\s*€/gi, "un exemple de prix");
  out = out.replace(/7[\s\u202f\u00a0]*600\s*€/gi, "une économie notable");

  out = out.replace(
    /(<tr[^>]*>[\s\S]*?Ancien[\s\S]*?<\/td>\s*<td[^>]*text-gray-700[^>]*>)([\s\S]*?)(<\/td>)/gi,
    "$1environ 7 à 9 %$3"
  );
  out = out.replace(
    /(<tr[^>]*>[\s\S]*?(?:Neuf|VEFA)[\s\S]*?<\/td>\s*<td[^>]*text-gray-700[^>]*>)([\s\S]*?)(<\/td>)/gi,
    "$1environ 2 à 3 %$3"
  );

  out = cleanTextNodes(out);

  return out;
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
    "estimer via le calculateur"
  );

  return out;
}

function sanitizeOne(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  if (!hasProblems(original)) return false;
  let html = sanitizeGlobal(original);

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
  const { deptCode, filePath } = parseArgs();
  let files = listHtml(DEPT_DIR);
  if (filePath) files = files.filter((f) => path.resolve(f) === filePath);
  if (deptCode)
    files = files.filter(
      (f) => path.basename(f).toLowerCase() === `frais-notaire-${deptCode.toLowerCase()}.html`
    );
  let changed = 0;
  for (const f of files) {
    if (sanitizeOne(f)) changed++;
  }
  console.log(JSON.stringify({ files: files.length, changed }, null, 2));
}

main();
