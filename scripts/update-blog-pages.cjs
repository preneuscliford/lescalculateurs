#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "src/pages/blog");
const DEPT_DIR = path.join(BLOG_DIR, "departements");

/**
 * Liste récursive des fichiers .html dans un répertoire
 */
function listHtml(dir) {
  const out = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) {
      out.push(...listHtml(p));
    } else if (it.isFile() && it.name.endsWith(".html")) {
      out.push(p);
    }
  }
  return out;
}

/**
 * Remplace "à " par "en " dans libellés "Frais de notaire {année} à ..."
 */
function replaceAtoEn(content) {
  return content
    .replace(/(Frais de notaire\s+20\d{2})\s+à\s+/g, "$1 en ")
    .replace(/(Frais de notaire\s+\d{4})\s+à\s+/g, "$1 en ");
}

/**
 * Remplace les plages non officielles "2024-2026" ou "2024–2026" par "2025–2026"
 */
function replaceRanges(content) {
  return content.replace(/2024[-–]2026/g, "2025–2026");
}

/**
 * Supprime toute occurrence des lignes d'exemples si elles existent déjà
 * (évite doublons), y compris anciens blocs en style border-l-4
 */
function removeExistingHighlights(content) {
  content = content.replace(
    /<div[^>]*class="[^"]*bg-yellow-50[^"]*"[^>]*id="dept-highlights"[^>]*>[\s\S]*?<\/div>\s*/gi,
    ""
  );
  return content;
}

/**
 * Insère un bloc d’exemples départementaux si absent
 */
function insertDeptHighlights(content) {
  if (content.includes("<!-- dept-highlights -->")) return content;
  if (/<div[^>]*id="dept-highlights"[^>]*>/i.test(content)) return content;
  const block =
    '\n<div class="mt-6 mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 sm:p-5 rounded-r" id="dept-highlights">\n' +
    '<!-- dept-highlights -->\n' +
    '<p class="text-sm sm:text-base text-gray-800 leading-relaxed"><strong>💰 Frais de notaire 2026 : repères rapides</strong><br/>Bien ancien : environ <strong>7–8 %</strong> • Bien neuf (VEFA) : environ <strong>2–3 %</strong>.<br/><span class="text-xs sm:text-sm text-gray-600">Pour un montant exact et à jour, utilisez le calculateur.</span></p>\n' +
    '</div>\n';
  // insertion après le premier <h1> si présent, sinon en haut du <main>
  const h1Match = content.match(/<h1[^>]*>[\s\S]*?<\/h1>/i);
  if (h1Match) {
    const idx = content.indexOf(h1Match[0]) + h1Match[0].length;
    return content.slice(0, idx) + block + content.slice(idx);
  }
  const mainMatch = content.match(/<main[^>]*>/i);
  if (mainMatch) {
    const idx = content.indexOf(mainMatch[0]) + mainMatch[0].length;
    return content.slice(0, idx) + block + content.slice(idx);
  }
  // fallback: ajouter en début de corps
  return content.replace(/<body[^>]*>/i, (m) => m + block);
}

/**
 * Traite un fichier HTML: remplacements et insertion
 */
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;
  content = replaceRanges(content);
  content = replaceAtoEn(content);
  content = removeExistingHighlights(content);
  content = insertDeptHighlights(content);
  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    return true;
  }
  return false;
}

/**
 * Point d'entrée
 */
function main() {
  const files = [];
  if (fs.existsSync(DEPT_DIR)) files.push(...listHtml(DEPT_DIR));
  if (fs.existsSync(BLOG_DIR)) {
    for (const f of fs.readdirSync(BLOG_DIR)) {
      const p = path.join(BLOG_DIR, f);
      if (fs.statSync(p).isFile() && f.endsWith(".html")) files.push(p);
    }
  }
  let changed = 0;
  for (const f of files) {
    if (processFile(f)) changed++;
  }
  console.log(JSON.stringify({ files: files.length, changed }, null, 2));
}

main();
