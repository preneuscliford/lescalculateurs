#!/usr/bin/env node
/**
 * Corrige les en-têtes officiels accidentellement modifiés:
 * "Tarifs Officiels 2026-2026" → "Tarifs Officiels 2025-2026"
 * S'applique sur toutes les pages HTML du dossier src/pages/blog.
 */
const fs = require("fs");
const path = require("path");

function getAllHtmlFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) getAllHtmlFiles(p, acc);
    else if (e.isFile() && p.endsWith(".html")) acc.push(p);
  }
  return acc;
}

const root = path.resolve(process.cwd(), "src/pages/blog");
const files = fs.existsSync(root) ? getAllHtmlFiles(root) : [];
let fixed = 0;

files.forEach((file) => {
  const content = fs.readFileSync(file, "utf-8");
  const updated = content.replace(/Tarifs Officiels 2026-2026/g, "Tarifs Officiels 2025-2026");
  if (updated !== content) {
    fs.writeFileSync(file, updated, "utf-8");
    fixed++;
    console.log(`✔ Corrigé: ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`\n✅ Corrections appliquées: ${fixed}`);

