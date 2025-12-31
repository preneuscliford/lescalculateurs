#!/usr/bin/env node
/**
 * Script de remplacement automatique 2025 → 2026
 * À LANCER EN JANVIER 2026 UNIQUEMENT
 * 
 * ATTENTION: Ce script modifie les fichiers de PRODUCTION
 */

const fs = require("fs");
const path = require("path");

// Patterns à remplacer - SEULEMENT les contextes SEO et visibles, PAS les données
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
const htmlFiles = getAllHtmlFiles(pagesDir);

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

// DRY RUN - Compter les occurrences
let totalReplacements = 0;
const fileChanges = [];

htmlFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  let fileReplacements = 0;

  replacements.forEach((pattern) => {
    const regex = new RegExp(pattern.old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const matches = content.match(regex);
    if (matches) {
      fileReplacements += matches.length;
      totalReplacements += matches.length;
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
   node scripts/execute-2026-replacement.cjs --confirm

   SAUVEGARDER LES FICHIERS D'ABORD:
   git commit -m "Backup avant migration 2025->2026"

${"═".repeat(70)}
`);
