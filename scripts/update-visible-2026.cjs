#!/usr/bin/env node
/**
 * Aligne les textes visibles non‑SEO vers 2026 (hors mentions officielles).
 * Cible: h1–h6, p, li, span, a, strong, em, small, summary.
 * Garde‑fous: ne modifie pas lorsque des mots‑clés officiels apparaissent
 * (barème, BOFiP, impots.gouv, legifrance, service‑public, notaires, officiels),
 * ni les plages “2024–2025” et “2025–2026”.
 */
const fs = require("fs");
const path = require("path");

/** Détermine si un texte appartient à un contexte officiel. */
function isOfficial(text) {
  const t = (text || "").toLowerCase();
  const OFFICIAL_GUARDS = [
    "barème", "barèmes", "officiel", "officiels",
    "bofip", "impots.gouv.fr", "bofip.impots.gouv.fr",
    "legifrance.gouv.fr", "service-public.fr", "notaires.fr", "chambre des notaires"
  ];
  return OFFICIAL_GUARDS.some((kw) => t.includes(kw));
}

/** Récupère tous les fichiers HTML récursivement. */
function getAllHtmlFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) getAllHtmlFiles(p, acc);
    else if (e.isFile() && p.endsWith(".html")) acc.push(p);
  }
  return acc;
}

/** Applique le remplacement 2025 → 2026 sur textes visibles hors contexte officiel. */
function updateVisibleTexts(content) {
  const tagPatterns = [
    { label: "h1", regex: /<h1[^>]*>([\s\S]*?)<\/h1>/gi },
    { label: "h2", regex: /<h2[^>]*>([\s\S]*?)<\/h2>/gi },
    { label: "h3", regex: /<h3[^>]*>([\s\S]*?)<\/h3>/gi },
    { label: "h4", regex: /<h4[^>]*>([\s\S]*?)<\/h4>/gi },
    { label: "h5", regex: /<h5[^>]*>([\s\S]*?)<\/h5>/gi },
    { label: "h6", regex: /<h6[^>]*>([\s\S]*?)<\/h6>/gi },
    { label: "p", regex: /<p[^>]*>([\s\S]*?)<\/p>/gi },
    { label: "li", regex: /<li[^>]*>([\s\S]*?)<\/li>/gi },
    { label: "span", regex: /<span[^>]*>([\s\S]*?)<\/span>/gi },
    { label: "a", regex: /<a[^>]*>([\s\S]*?)<\/a>/gi },
    { label: "strong", regex: /<strong[^>]*>([\s\S]*?)<\/strong>/gi },
    { label: "em", regex: /<em[^>]*>([\s\S]*?)<\/em>/gi },
    { label: "small", regex: /<small[^>]*>([\s\S]*?)<\/small>/gi },
    { label: "summary", regex: /<summary[^>]*>([\s\S]*?)<\/summary>/gi },
  ];
  let applied = 0;
  tagPatterns.forEach(({ label, regex }) => {
    content = content.replace(regex, (whole, inner, offset) => {
      if (typeof inner !== "string" || !inner.includes("2025")) return whole;
      const innerHasOfficialRange = /2024[-–]2025|2025[-–]2026/.test(inner);
      if (innerHasOfficialRange || isOfficial(inner)) return whole;
      const start = Math.max(0, (offset || 0) - 120);
      const end = Math.min(content.length, (offset || 0) + whole.length + 120);
      const neighborhood = content.slice(start, end).toLowerCase();
      if (isOfficial(neighborhood)) return whole;
      const replacedInner = inner.replace(/2025/g, "2026");
      if (replacedInner !== inner) {
        applied++;
        return whole.replace(inner, replacedInner);
      }
      return whole;
    });
  });
  return { content, applied };
}

const pagesDir = path.resolve(process.cwd(), "src/pages");
const indexFile = path.resolve(process.cwd(), "src/index.html");
const files = fs.existsSync(pagesDir) ? getAllHtmlFiles(pagesDir) : [];
if (fs.existsSync(indexFile)) files.push(indexFile);

let filesTouched = 0;
let totalApplied = 0;
files.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  const before = content;
  const res = updateVisibleTexts(content);
  content = res.content;
  totalApplied += res.applied;
  if (content !== before) {
    fs.writeFileSync(filePath, content, "utf-8");
    filesTouched++;
    console.log(`✔ ${path.relative(process.cwd(), filePath)} (visible:${res.applied})`);
  }
});

console.log(`\n✅ Alignement des textes visibles terminé`);
console.log(`   Fichiers modifiés: ${filesTouched}`);
console.log(`   Remplacements visibles: ${totalApplied}`);

