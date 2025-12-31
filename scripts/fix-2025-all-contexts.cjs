#!/usr/bin/env node
/**
 * Script de remplacement RÉEL 2025 → 2026 - VERSION CORRIGÉE
 * Remplace TOUS les contextes: SEO, visible, contenu, partout
 */

const fs = require("fs");
const path = require("path");

// Patterns à remplacer - TOUS les contextes
const replacements = [
  // Titles HTML
  { old: '<title>Frais de Notaire 2025', new: '<title>Frais de Notaire 2026' },
  { old: '<title>Sources Officielles & Barèmes 2025', new: '<title>Sources Officielles & Barèmes 2026' },
  
  // Meta description
  { old: 'content="Comparez les frais de notaire entre plusieurs villes en 10 secondes. Barème officiel 2025', new: 'content="Comparez les frais de notaire entre plusieurs villes en 10 secondes. Barème officiel 2026' },
  { old: 'content="Économisez des milliers d\'euros sur vos frais de notaire 2025', new: 'content="Économisez des milliers d\'euros sur vos frais de notaire 2026' },
  
  // Keywords
  { old: 'content="frais notaire 2025,', new: 'content="frais notaire 2026,' },
  { old: 'content="frais notaire 2025 ', new: 'content="frais notaire 2026 ' },
  
  // OG Tags
  { old: 'content="Frais de Notaire 2025', new: 'content="Frais de Notaire 2026' },
  { old: 'content="Frais de notaire 2025', new: 'content="Frais de notaire 2026' },
  { old: 'content="Sources Officielles & Barèmes 2025', new: 'content="Sources Officielles & Barèmes 2026' },
  
  // Schema.org
  { old: '"headline": "Frais de notaire 2025', new: '"headline": "Frais de notaire 2026' },
  { old: '"description": "Outil de calcul des frais de notaire selon les barèmes officiels 2025', new: '"description": "Outil de calcul des frais de notaire selon les barèmes officiels 2026' },
  { old: '"description": "Calculez les frais de notaire en France pour un achat immobilier en 2025', new: '"description": "Calculez les frais de notaire en France pour un achat immobilier en 2026' },
  { old: '"name": "Calculateur Frais de Notaire 2025', new: '"name": "Calculateur Frais de Notaire 2026' },
  
  // Contenu visible - Titres
  { old: '>Frais de Notaire 2025</h1>', new: '>Frais de Notaire 2026</h1>' },
  { old: '>Frais de Notaire 2025<', new: '>Frais de Notaire 2026<' },
  { old: '>Frais de notaire 2025</a>', new: '>Frais de notaire 2026</a>' },
  { old: '>Frais de notaire 2025<', new: '>Frais de notaire 2026<' },
  
  // Contenu visible - Textes
  { old: '<span class="text-xs text-gray-500">Barèmes 2025</span>', new: '<span class="text-xs text-gray-500">Barèmes 2026</span>' },
  { old: '<li><strong>Source:</strong> Chambre des Notaires France 2025</li>', new: '<li><strong>Source:</strong> Chambre des Notaires France 2026</li>' },
  { old: '>Découvrez les frais de notaire 2025 département', new: '>Découvrez les frais de notaire 2026 département' },
  { old: '>Calculateur de frais de notaire 2025', new: '>Calculateur de frais de notaire 2026' },
  
  // Footer
  { old: '<p>&copy; 2025 Les Calculateurs', new: '<p>&copy; 2026 Les Calculateurs' },
  { old: '<p>&copy; 2025 LesCalculateurs.fr', new: '<p>&copy; 2026 LesCalculateurs.fr' },
  
  // Blog headers
  { old: '>🏠 Frais de Notaire 2025 par Département', new: '>🏠 Frais de Notaire 2026 par Département' },
  
  // Article dates
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
║  🔧 REMPLACEMENT RÉEL 2025 → 2026 (VERSION CORRIGÉE)           ║
║  ⚠️  TOUS LES CONTEXTES - SEO + VISIBLE                         ║
╚════════════════════════════════════════════════════════════════╝
`);

let totalReplacements = 0;
let filesModified = 0;
const results = [];

htmlFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  let fileReplacements = 0;

  replacements.forEach((pattern) => {
    while (content.includes(pattern.old)) {
      content = content.replace(pattern.old, pattern.new);
      fileReplacements++;
      totalReplacements++;
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

📊 RÉSUMÉ:

   ✅ Fichiers modifiés: ${filesModified}
   ✅ Total remplacements: ${totalReplacements}
   ✅ Tous les contextes modifiés: SEO + visible + contenu

${"═".repeat(70)}

✨ Modifications complètes !

Fichiers à vérifier:
${results.slice(0, 15).map(r => `   • ${r.path} (${r.changes} changements)`).join('\n')}

${"═".repeat(70)}
`);
