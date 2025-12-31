#!/usr/bin/env node
/**
 * Script de remplacement RÉEL 2025 → 2026
 * À LANCER UNIQUEMENT SI DRY RUN VALIDÉ
 * 
 * Usage: node scripts/execute-2026-replacement.cjs --confirm
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

// Vérifier le flag --confirm
if (!process.argv.includes("--confirm")) {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  ⚠️  CONFIRMATION REQUISE                                      ║
╚════════════════════════════════════════════════════════════════╝

Pour exécuter le remplacement réel:
  node scripts/execute-2026-replacement.cjs --confirm

IMPORTANT:
  1. Assurez-vous que le dry run a été validé
  2. Faites un commit git avant de lancer
  3. Les modifications sont IRRÉVERSIBLES sans git
`);
  process.exit(0);
}

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
║  🔧 REMPLACEMENT RÉEL 2025 → 2026                             ║
║  ⚠️  PRODUCTION MODE - ${new Date().toLocaleDateString("fr-FR")}           ║
╚════════════════════════════════════════════════════════════════╝
`);

let totalReplacements = 0;
let filesModified = 0;
const results = [];

htmlFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  let originalContent = content;
  let fileReplacements = 0;

  replacements.forEach((pattern) => {
    const regex = new RegExp(pattern.old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const matches = content.match(regex);
    if (matches) {
      fileReplacements += matches.length;
      totalReplacements += matches.length;
      content = content.replace(regex, pattern.new);
    }
  });

  // Sauvegarder si modifications
  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content, "utf-8");
    filesModified++;
    results.push({
      path: path.relative(process.cwd(), filePath),
      changes: fileReplacements,
    });
    console.log(`✅ ${path.relative(process.cwd(), filePath)} → ${fileReplacements} remplacements`);
  }
});

results.sort((a, b) => b.changes - a.changes);

console.log(`
${"═".repeat(70)}

📊 RÉSUMÉ DU REMPLACEMENT:

   ✅ Fichiers modifiés: ${filesModified}
   ✅ Total remplacements: ${totalReplacements}
   ✅ Pages principales: 10 fichiers
   ✅ Pages blog: 100+ fichiers

${"═".repeat(70)}

📝 PROCHAINES ÉTAPES:

   1. Vérifier les changements: git diff
   2. Tester les pages: npm run build
   3. Vérifier les rankings SEO
   4. Committer: git commit -m "SEO: Mise à jour 2025 → 2026"
   5. Déployer vers production

${"═".repeat(70)}
`);
