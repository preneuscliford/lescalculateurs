#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

/**
 * Retourne le chemin racine du projet (cwd)
 */
function getRoot() {
  return process.cwd();
}

/**
 * Liste tous les fichiers HTML des pages départements
 */
function listDeptFiles(root) {
  const dir = path.join(root, "src", "pages", "blog", "departements");
  return fs.readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => path.join(dir, f));
}

/**
 * Extrait le code du département à partir du nom de fichier
 */
function getDeptCode(filePath) {
  const base = path.basename(filePath, ".html");
  const m = base.match(/frais-notaire-(.+)$/);
  return m ? m[1] : "";
}

/**
 * Applique les remplacements textuels standard (priceRange, ≈ 4%, ≈ 7.3%)
 */
function applyStandardReplacements(content) {
  let updated = content;
  // Harmoniser priceRange JSON-LD
  updated = updated.replace(/"priceRange"\s*:\s*"[^"]+"/g, '"priceRange": "2–3% (neuf) / 7–8% (ancien)"');
  // Remplacer ≈ 4% par ≈ 2–3%
  updated = updated.replace(/≈\s*4%/g, "≈ 2–3%");
  // Remplacer ≈ 7.3% par ≈ 7–8%
  updated = updated.replace(/≈\s*7[\.,]3%/g, "≈ 7–8%");
  // Remplacer mentions simples 7.3% par 7–8% (limité aux pourcentages)
  updated = updated.replace(/\b7[\.,]3%\b/g, "7–8%");
  // Remplacer mentions simples 4% par 2–3% (limité aux pourcentages)
  updated = updated.replace(/\b4%\b/g, "2–3%");
  return updated;
}

/**
 * Pour les départements à droits réduits, corrige toute mention 5,8%/5,9%
 */
function applyReducedDeptReplacements(content, deptCode) {
  const reduced = ["36", "38", "56", "976"]; // Indre, Isère, Morbihan, Mayotte
  if (!reduced.includes(deptCode)) return content;
  let updated = content;
  updated = updated.replace(/5[\.,]8%/g, "3,8%");
  updated = updated.replace(/5[\.,]9%/g, "3,8%");
  return updated;
}

/**
 * Assure que le mini-calculateur charge bien baremes.json (détection simple)
 */
function ensureBaremesJsonLoaded(content) {
  if (content.includes("baremes.json")) return content;
  // Injecter un fetch au début du premier <script type="module"> inline
  return content.replace(/(<script\s+type="module">\s*)/, (m, p1) => {
    return `${p1}const baremes = await (await fetch("../../../data/baremes.json")).json();\n`;
  });
}

/**
 * Traite un fichier et écrit les modifications si nécessaires
 */
function processFile(fp) {
  const dept = getDeptCode(fp);
  const original = fs.readFileSync(fp, "utf8");
  let updated = original;
  updated = applyStandardReplacements(updated);
  updated = applyReducedDeptReplacements(updated, dept);
  updated = ensureBaremesJsonLoaded(updated);
  if (updated !== original) {
    fs.writeFileSync(fp, updated, "utf8");
    return true;
  }
  return false;
}

/**
 * Point d'entrée: corrige toutes les pages département en lot
 */
function main() {
  const root = getRoot();
  const files = listDeptFiles(root);
  let changed = 0;
  for (const fp of files) {
    if (processFile(fp)) changed++;
  }
  console.log(`Corrections appliquées: ${changed} fichiers modifiés sur ${files.length}`);
}

main();
