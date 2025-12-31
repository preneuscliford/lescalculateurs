#!/usr/bin/env node
/**
 * Script de remplacement GLOBAL 2025 → 2026
 * ✓ index.html
 * ✓ Tous les .html dans src/pages
 * ✓ Tous les .ts/.tsx (composants) dans src
 * ✗ EXCLU: données officielles (2024-2025, CSN 2025, etc)
 */

const fs = require("fs");
const path = require("path");

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🔧 REMPLACEMENT GLOBAL 2025 → 2026                            ║
║  ✓ index.html + pages + composants                             ║
║  ✓ Contextes: SEO + visible + code                             ║
║  ✗ Exclu: données officielles                                   ║
╚════════════════════════════════════════════════════════════════╝
`);

// Patterns à remplacer - EXHAUSTIF
const replacements = [
  // Titres
  { from: '<title>Frais de Notaire 2025', to: '<title>Frais de Notaire 2026' },
  { from: '<title>Impôt sur le Revenu 2025', to: '<title>Impôt sur le Revenu 2026' },
  { from: '<title>Salaire Brut/Net 2025', to: '<title>Salaire Brut/Net 2026' },
  { from: '<title>Taxe Foncière 2025', to: '<title>Taxe Foncière 2026' },
  { from: '<title>Indemnités Kilométriques 2025', to: '<title>Indemnités Kilométriques 2026' },
  { from: '<title>Temps de travail 2025', to: '<title>Temps de travail 2026' },
  { from: '<title>Ponts 2025', to: '<title>Ponts 2026' },
  { from: '<title>Sources Officielles & Barèmes 2025', to: '<title>Sources Officielles & Barèmes 2026' },
  
  // Meta tags
  { from: 'content="Frais de Notaire 2025', to: 'content="Frais de Notaire 2026' },
  { from: 'content="Frais de notaire 2025', to: 'content="Frais de notaire 2026' },
  { from: 'content="frais notaire 2025', to: 'content="frais notaire 2026' },
  { from: 'content="Impôt sur le Revenu 2025', to: 'content="Impôt sur le Revenu 2026' },
  { from: 'content="Salaire Brut/Net 2025', to: 'content="Salaire Brut/Net 2026' },
  { from: 'content="Taxe Foncière 2025', to: 'content="Taxe Foncière 2026' },
  { from: 'content="Indemnités Kilométriques 2025', to: 'content="Indemnités Kilométriques 2026' },
  { from: 'content="Temps de travail 2025', to: 'content="Temps de travail 2026' },
  { from: 'content="Ponts 2025', to: 'content="Ponts 2026' },
  { from: 'content="Sources Officielles & Barèmes 2025', to: 'content="Sources Officielles & Barèmes 2026' },
  
  // Contenu visible
  { from: '>Frais de Notaire 2025', to: '>Frais de Notaire 2026' },
  { from: '>Frais de notaire 2025', to: '>Frais de notaire 2026' },
  { from: '>Impôt sur le Revenu 2025', to: '>Impôt sur le Revenu 2026' },
  { from: '>Salaire Brut/Net 2025', to: '>Salaire Brut/Net 2026' },
  { from: '>Taxe Foncière 2025', to: '>Taxe Foncière 2026' },
  { from: '>Indemnités Kilométriques 2025', to: '>Indemnités Kilométriques 2026' },
  { from: '>Temps de travail 2025', to: '>Temps de travail 2026' },
  { from: '>Ponts 2025', to: '>Ponts 2026' },
  
  // Schema.org
  { from: '"headline": "Frais de notaire 2025', to: '"headline": "Frais de notaire 2026' },
  { from: '"name": "Calculateur Frais de Notaire 2025', to: '"name": "Calculateur Frais de Notaire 2026' },
  { from: '"description": "Outil de calcul des frais de notaire selon les barèmes officiels 2025', to: '"description": "Outil de calcul des frais de notaire selon les barèmes officiels 2026' },
  { from: '"description": "Calculez les frais de notaire en France pour un achat immobilier en 2025', to: '"description": "Calculez les frais de notaire en France pour un achat immobilier en 2026' },
  
  // Code TypeScript
  { from: 'title: "Calculateur de frais de notaire 2025', to: 'title: "Calculateur de frais de notaire 2026' },
  { from: 'title: "Simulateur de prêt immobilier 2025', to: 'title: "Simulateur de prêt immobilier 2026' },
  { from: 'title: "Simulateur de taxe foncière 2025', to: 'title: "Simulateur de taxe foncière 2026' },
  
  // Barèmes visibles
  { from: '<span class="text-xs text-gray-500">Barèmes 2025</span>', to: '<span class="text-xs text-gray-500">Barèmes 2026</span>' },
  { from: 'Barèmes 2025', to: 'Barèmes 2026' },
  
  // Footer
  { from: '<p>&copy; 2025 Les Calculateurs', to: '<p>&copy; 2026 Les Calculateurs' },
  { from: '<p>&copy; 2025 LesCalculateurs', to: '<p>&copy; 2026 LesCalculateurs' },
  
  // Dates/filenames
  { from: 'filename: "frais_notaire_2025', to: 'filename: "frais_notaire_2026' },
  { from: '<time datetime="2025-', to: '<time datetime="2026-' },
  
  // Mises à jour
  { from: 'mise à jour janvier 2025', to: 'mise à jour janvier 2026' },
  { from: 'Mise à jour automatique: <strong>janvier 2025', to: 'Mise à jour automatique: <strong>janvier 2026' },
  { from: '<strong>Dernière mise à jour:</strong> janvier 2025', to: '<strong>Dernière mise à jour:</strong> janvier 2026' },
  
  // Questions FAQ
  { from: '❓ Comment calculer les frais de notaire en France en 2025', to: '❓ Comment calculer les frais de notaire en France en 2026' },
  { from: '<strong>Source:</strong> Chambre des Notaires France 2025', to: '<strong>Source:</strong> Chambre des Notaires France 2026' },
];

// Patterns à EXCLURE
const excludePatterns = [
  '2024-2025',
  'CSN 2025',
  'DGFIP 2025',
  'URSSAF 2025',
  '// Barème',
];

function shouldExclude(line) {
  return excludePatterns.some(pattern => line.includes(pattern));
}

function findAllFiles(dir, extensions = ['.html', '.ts', '.tsx'], fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    
    try {
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        findAllFiles(fullPath, extensions, fileList);
      } else if (extensions.some(ext => file.endsWith(ext))) {
        fileList.push(fullPath);
      }
    } catch (e) {
      // Ignorer les fichiers inaccessibles
    }
  });
  
  return fileList;
}

// Chercher les fichiers
const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const indexFile = path.join(rootDir, 'src', 'index.html');

let allFiles = [];

// Ajouter index.html si existe
if (fs.existsSync(indexFile)) {
  allFiles.push(indexFile);
}

// Ajouter tous les fichiers src
if (fs.existsSync(srcDir)) {
  allFiles = allFiles.concat(findAllFiles(srcDir, ['.html', '.ts', '.tsx']));
}

// Déduplication
allFiles = [...new Set(allFiles)];

let totalReplacements = 0;
let filesModified = 0;
const results = [];

console.log(`\n📄 Fichiers trouvés: ${allFiles.length}\n`);

allFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let fileReplacements = 0;

  replacements.forEach((pattern) => {
    const lines = content.split('\n');
    const newLines = lines.map((line) => {
      if (!shouldExclude(line) && line.includes(pattern.from)) {
        return line.replace(new RegExp(pattern.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), pattern.to);
      }
      return line;
    });

    const newContent = newLines.join('\n');
    if (newContent !== content) {
      const countBefore = content.split(pattern.from).length - 1;
      const countAfter = newContent.split(pattern.from).length - 1;
      const changes = countBefore - countAfter;
      fileReplacements += changes;
      totalReplacements += changes;
      content = newContent;
    }
  });

  if (fileReplacements > 0 && content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    filesModified++;
    const relativePath = path.relative(process.cwd(), filePath);
    results.push({
      path: relativePath,
      changes: fileReplacements,
    });
    const icon = filePath.endsWith('.ts') || filePath.endsWith('.tsx') ? '🔧' : '📄';
    console.log(`✅ ${icon} ${relativePath.padEnd(60)} → ${fileReplacements} changes`);
  }
});

results.sort((a, b) => b.changes - a.changes);

console.log(`
${"═".repeat(70)}

📊 RÉSUMÉ FINAL:

   ✅ Fichiers modifiés: ${filesModified}/${allFiles.length}
   ✅ Total remplacements: ${totalReplacements}
   ✅ Portée: index.html + pages + composants
   ✅ Contextes: SEO + Visible + Code
   ✅ Données officielles: PRÉSERVÉES ✓

Top fichiers modifiés:
${results.slice(0, 20).map(r => `   • ${r.path.padEnd(50)} (${r.changes})`).join('\n')}

${"═".repeat(70)}

✨ Migration 2025 → 2026 COMPLÈTE!

Prochaines étapes:
   1. npm run build
   2. git add -A
   3. git commit -m "SEO: Migration 2025 → 2026 (global)"
   4. Vérifier: npm run dev

${"═".repeat(70)}
`);
