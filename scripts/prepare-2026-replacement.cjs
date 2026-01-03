#!/usr/bin/env node
/**
 * Script de remplacement automatique 2025 → 2026 (pages/SEO)
 * À LANCER EN JANVIER 2026 UNIQUEMENT
 * ATTENTION: Ce script modifie les fichiers de PRODUCTION
 * Usage:
 *   node scripts/prepare-2026-replacement.cjs           # DRY RUN
 *   node scripts/prepare-2026-replacement.cjs --apply   # Applique les remplacements
 */

const fs = require("fs");
const path = require("path");

// Patterns à remplacer - SEULEMENT contextes SEO et visibles, PAS les données officielles
const replacements = [
  // SEO Meta Tags
  { old: 'content="Frais de notaire 2025', new: 'content="Frais de notaire 2026' },
  { old: 'content="frais notaire 2025', new: 'content="frais notaire 2026' },
  { old: '"headline": "Frais de notaire 2025', new: '"headline": "Frais de notaire 2026' },
  { old: '"description": "Frais de notaire par département en 2025', new: '"description": "Frais de notaire par département en 2026' },
  { old: '"description": "Outil de calcul des frais de notaire selon les barèmes officiels 2025', new: '"description": "Outil de calcul des frais de notaire selon les barèmes officiels 2026' },
  { old: '"description": "Calculez les frais de notaire en France pour un achat immobilier en 2025', new: '"description": "Calculez les frais de notaire en France pour un achat immobilier en 2026' },

  // Titles
  { old: '<title>Frais de Notaire 2025', new: '<title>Frais de Notaire 2026' },
  { old: '<title>Sources Officielles & Barèmes 2025', new: '<title>Sources Officielles & Barèmes 2026' },
  { old: '<title>🏠 Frais de Notaire 2025', new: '<title>🏠 Frais de Notaire 2026' },

  // OG Tags
  { old: 'content="Sources Officielles & Barèmes 2025', new: 'content="Sources Officielles & Barèmes 2026' },

  // Contenu visible
  { old: '>Frais de notaire 2025</a>', new: '>Frais de notaire 2026</a>' },
  { old: '>Frais de Notaire 2025<', new: '>Frais de Notaire 2026<' },
  { old: '<span class="text-xs text-gray-500">Barèmes 2025', new: '<span class="text-xs text-gray-500">Barèmes 2026' },
  { old: '<li><strong>Source:</strong> Chambre des Notaires France 2025</li>', new: '<li><strong>Source:</strong> Chambre des Notaires France 2026</li>' },
  { old: '>Découvrez les frais de notaire 2025 département', new: '>Découvrez les frais de notaire 2026 département' },
  { old: '<p>&copy; 2025 LesCalculateurs.fr', new: '<p>&copy; 2026 LesCalculateurs.fr' },

  // Blog headers
  { old: '>🏠 Frais de Notaire 2025 par Département', new: '>🏠 Frais de Notaire 2026 par Département' },

  // Calculateur headers
  { old: '>Calculateur de frais de notaire 2025', new: '>Calculateur de frais de notaire 2026' },

  // Article dates (CSS)
  { old: '<time datetime="2025-', new: '<time datetime="2026-' },
];

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith(".html")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const pagesDir = path.resolve(process.cwd(), "src/pages");
const indexFile = path.resolve(process.cwd(), "src/index.html");
const htmlFiles = getAllHtmlFiles(pagesDir);
if (fs.existsSync(indexFile)) htmlFiles.push(indexFile);

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🔧 REPLACEMENT AUTOMATIQUE 2025 → 2026                        ║
║  ⚠️  PRODUCTION MODE - ${new Date().toLocaleDateString("fr-FR")}           ║
╚════════════════════════════════════════════════════════════════╝
`);

console.log(`\n📋 Configuration:`);
console.log(`   Fichiers HTML trouvés: ${htmlFiles.length}`);
console.log(`   Patterns de remplacement: ${replacements.length}`);
console.log(`\n`);

// Garde-fous: mots-clés qui indiquent données officielles ou sources
const OFFICIAL_GUARDS = [
  "barème", "barèmes", "officiel", "officiels",
  "BOFiP", "impots.gouv.fr", "bofip.impots.gouv.fr",
  "legifrance.gouv.fr", "service-public.fr",
  "indemnités kilométriques", "barème kilométrique"
];

// DRY RUN - Compter les occurrences (en excluant contexts protégés)
let totalReplacements = 0;
const fileChanges = [];

htmlFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  let fileReplacements = 0;

  replacements.forEach((pattern) => {
    const regex = new RegExp(pattern.old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    let match;
    const guardedRegex = new RegExp(`(.{0,120})${regex.source}(.{0,120})`, "g");
    while ((match = guardedRegex.exec(content)) !== null) {
      const left = match[1] || "";
      const right = match[2] || "";
      const neighborhood = (left + right).toLowerCase();
      const isOfficialContext = OFFICIAL_GUARDS.some((kw) => neighborhood.includes(kw.toLowerCase()));
      if (!isOfficialContext) {
        fileReplacements++;
        totalReplacements++;
      }
    }
  });

  if (fileReplacements > 0) {
    fileChanges.push({
      path: path.relative(process.cwd(), filePath),
      changes: fileReplacements,
    });
  }
});

fileChanges.sort((a, b) => b.changes - a.changes);

console.log(`🔍 DRY RUN - Occurrences à remplacer:\n`);
fileChanges.forEach((file) => {
  console.log(`   ${file.path.padEnd(50)} : ${file.changes} replacements`);
});

console.log(`\n${"─".repeat(70)}`);
console.log(`\nTotal occurrences trouvées: ${totalReplacements}`);
console.log(`Fichiers affectés: ${fileChanges.length}\n`);

console.log(`
${"═".repeat(70)}

✅ PRÊT POUR LE REMPLACEMENT

   Pour exécuter le remplacement réel:
   node scripts/prepare-2026-replacement.cjs --apply

   SAUVEGARDER LES FICHIERS D'ABORD:
   git commit -m "Backup avant migration 2025->2026"

${"═".repeat(70)}
`);

if (process.argv.includes("--apply")) {
  console.log("\n🚀 Application des remplacements en cours…\n");
  htmlFiles.forEach((filePath) => {
    let content = fs.readFileSync(filePath, "utf-8");
    let applied = 0;
    replacements.forEach((pattern) => {
      const regex = new RegExp(pattern.old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      content = content.replace(regex, (m, offset) => {
        const start = Math.max(0, offset - 120);
        const end = Math.min(content.length, offset + m.length + 120);
        const neighborhood = content.slice(start, end).toLowerCase();
        const isOfficialContext = OFFICIAL_GUARDS.some((kw) => neighborhood.includes(kw.toLowerCase()));
        if (isOfficialContext) {
          return m; // ne pas modifier
        }
        applied++;
        return m.replace(pattern.old, pattern.new);
      });
    });
    if (applied > 0) {
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`   ✔ ${path.relative(process.cwd(), filePath)} : ${applied} remplacements`);
    }
    // Passe générique: balises SEO courantes avec "2025" → "2026" si non contexte officiel
    const tagPatterns = [
      { label: "title", regex: /<title>([\s\S]*?)<\/title>/gi },
      { label: "meta-desc", regex: /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
      { label: "meta-keywords", regex: /<meta[^>]+name=["']keywords["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
      { label: "og-title", regex: /<meta[^>]+property=["']og:title["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
      { label: "og-desc", regex: /<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
      { label: "tw-title", regex: /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
      { label: "tw-desc", regex: /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
      { label: "h1", regex: /<h1[^>]*>([\s\S]*?)<\/h1>/gi },
      { label: "h2", regex: /<h2[^>]*>([\s\S]*?)<\/h2>/gi },
      { label: "h3", regex: /<h3[^>]*>([\s\S]*?)<\/h3>/gi },
      { label: "p", regex: /<p[^>]*>([\s\S]*?)<\/p>/gi },
      { label: "li", regex: /<li[^>]*>([\s\S]*?)<\/li>/gi },
      { label: "span", regex: /<span[^>]*>([\s\S]*?)<\/span>/gi },
      { label: "a", regex: /<a[^>]*>([\s\S]*?)<\/a>/gi },
    ];
    let genericApplied = 0;
    tagPatterns.forEach(({ label, regex }) => {
      content = content.replace(regex, (whole, inner, offset) => {
        if (typeof inner !== "string") return whole;
        if (!inner.includes("2025")) return whole;
        const start = Math.max(0, offset - 150);
        const end = Math.min(content.length, offset + whole.length + 150);
        const neighborhood = content.slice(start, end).toLowerCase();
        const isOfficialContext = OFFICIAL_GUARDS.some((kw) => neighborhood.includes(kw.toLowerCase()));
        const FORCE_REPLACE_LABELS = new Set(["title", "og-title", "tw-title", "h1", "h2", "h3"]);
        const innerLower = inner.toLowerCase();
        const innerOfficial = OFFICIAL_GUARDS.some((kw) => innerLower.includes(kw.toLowerCase()));
        const innerHasOfficialRange = /2024[-–]2025|2025[-–]2026/.test(inner);
        if (label === "meta-keywords") {
          const segments = inner.split(",").map((s) => s.trim());
          const updatedSegments = segments.map((seg) => {
            const segLower = seg.toLowerCase();
            const segOfficial = OFFICIAL_GUARDS.some((kw) => segLower.includes(kw.toLowerCase()));
            if (segOfficial) return seg;
            return seg.replace(/2025/g, "2026");
          });
          const newInner = updatedSegments.join(", ");
          if (newInner !== inner) {
            genericApplied++;
            return whole.replace(inner, newInner);
          }
          return whole;
        } else {
          // For visible titles, avoid replacing if the inner text itself is official or a 2025–2026 range.
          if (FORCE_REPLACE_LABELS.has(label) && (innerOfficial || innerHasOfficialRange)) return whole;
          if (!FORCE_REPLACE_LABELS.has(label) && isOfficialContext) return whole;
          const replacedInner = inner.replace(/2025/g, "2026");
          if (replacedInner !== inner) {
            genericApplied++;
            return whole.replace(inner, replacedInner);
          }
          return whole;
        }
      });
    });
    if (genericApplied > 0) {
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`   ✔ ${path.relative(process.cwd(), filePath)} : ${genericApplied} remplacements génériques`);
    }
  });
  console.log("\n✅ Remplacements appliqués avec garde‑fous. Vérifiez les pages modifiées.");
}
