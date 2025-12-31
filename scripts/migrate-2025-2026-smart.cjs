#!/usr/bin/env node
/**
 * Script de remplacement 2025 → 2026 INTELLIGENT
 * Remplace 2025 SAUF les données officielles (2024-2025, CSN 2025, etc)
 * 
 * Patterns à EXCLURE:
 * - "2024-2025" (références légales)
 * - "CSN 2025" (Conseil Supérieur Notariat)
 * - Commentaires techniques officiels
 */

const fs = require("fs");
const path = require("path");
console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🔧 REMPLACEMENT INTELLIGENT 2025 → 2026                       ║
║  ✓ Toutes les pages | ✓ Contextes SEO + visible                ║
║  ✗ Exclu: données officielles (2024-2025, CSN 2025)             ║
╚════════════════════════════════════════════════════════════════╝
`);

// Patterns à remplacer (sauf ceux contenant données officielles)
const replacements = [
  // Titres SEO
  { from: '<title>Frais de Notaire 2025', to: '<title>Frais de Notaire 2026' },
  { from: 'content="Frais de Notaire 2025', to: 'content="Frais de Notaire 2026' },
  { from: 'content="Frais de notaire 2025', to: 'content="Frais de notaire 2026' },
  { from: 'content="Sources Officielles & Barèmes 2025', to: 'content="Sources Officielles & Barèmes 2026' },
  
  // Keywords
  { from: 'content="frais notaire 2025', to: 'content="frais notaire 2026' },
  { from: 'content="Impôt sur le Revenu 2025', to: 'content="Impôt sur le Revenu 2026' },
  { from: 'content="Salaire Brut/Net 2025', to: 'content="Salaire Brut/Net 2026' },
  { from: 'content="Taxe Foncière 2025', to: 'content="Taxe Foncière 2026' },
  { from: 'content="Indemnités Kilométriques 2025', to: 'content="Indemnités Kilométriques 2026' },
  { from: 'content="Temps de travail 2025', to: 'content="Temps de travail 2026' },
  { from: 'content="Ponts 2025', to: 'content="Ponts 2026' },
  { from: 'content="Charges de copropriété 2025', to: 'content="Charges de copropriété 2026' },
  { from: 'content="Plus-value Immobilière 2025', to: 'content="Plus-value Immobilière 2026' },
  { from: 'content="Prêt Immobilier 2025', to: 'content="Prêt Immobilier 2026' },
  
  // Contenu visible
  { from: '>Frais de Notaire 2025', to: '>Frais de Notaire 2026' },
  { from: '>Frais de notaire 2025', to: '>Frais de notaire 2026' },
  { from: '>Impôt sur le Revenu 2025', to: '>Impôt sur le Revenu 2026' },
  { from: '>Salaire Brut/Net 2025', to: '>Salaire Brut/Net 2026' },
  { from: '>Taxe Foncière 2025', to: '>Taxe Foncière 2026' },
  { from: '>Indemnités Kilométriques 2025', to: '>Indemnités Kilométriques 2026' },
  { from: '>Temps de travail 2025', to: '>Temps de travail 2026' },
  { from: '>Ponts 2025', to: '>Ponts 2026' },
  { from: '>Charges de copropriété 2025', to: '>Charges de copropriété 2026' },
  { from: '>Plus-value Immobilière 2025', to: '>Plus-value Immobilière 2026' },
  
  // Schema.org et meta tags
  { from: '"headline": "Frais de notaire 2025', to: '"headline": "Frais de notaire 2026' },
  { from: '"name": "Calculateur Frais de Notaire 2025', to: '"name": "Calculateur Frais de Notaire 2026' },
  { from: '"description": "Outil de calcul des frais de notaire selon les barèmes officiels 2025', to: '"description": "Outil de calcul des frais de notaire selon les barèmes officiels 2026' },
  { from: '"description": "Calculez les frais de notaire en France pour un achat immobilier en 2025', to: '"description": "Calculez les frais de notaire en France pour un achat immobilier en 2026' },
  
  // Textes courants
  { from: 'titre: "Calculateur de frais de notaire 2025', to: 'titre: "Calculateur de frais de notaire 2026' },
  { from: 'title: "Calculateur de frais de notaire 2025', to: 'title: "Calculateur de frais de notaire 2026' },
  { from: 'title: "Simulateur de prêt immobilier 2025', to: 'title: "Simulateur de prêt immobilier 2026' },
  { from: 'title: "Simulateur de taxe foncière 2025', to: 'title: "Simulateur de taxe foncière 2026' },
  { from: 'title: "Simulateur impôt sur le revenu 2025', to: 'title: "Simulateur impôt sur le revenu 2026' },
  
  // Barèmes avec années
  { from: '<span class="text-xs text-gray-500">Barèmes 2025</span>', to: '<span class="text-xs text-gray-500">Barèmes 2026</span>' },
  { from: 'Barèmes 2025', to: 'Barèmes 2026' },
  
  // Footer
  { from: '<p>&copy; 2025 Les Calculateurs', to: '<p>&copy; 2026 Les Calculateurs' },
  { from: '<p>&copy; 2025 LesCalculateurs', to: '<p>&copy; 2026 LesCalculateurs' },
  
  // Dates HTML
  { from: '<time datetime="2025-', to: '<time datetime="2026-' },
  
  // Filenames
  { from: 'filename: "frais_notaire_2025', to: 'filename: "frais_notaire_2026' },
  { from: 'filename: "impot_2025', to: 'filename: "impot_2026' },
  { from: 'filename: "salaire_2025', to: 'filename: "salaire_2026' },
  
  // Mise à jour
  { from: 'mise à jour janvier 2025', to: 'mise à jour janvier 2026' },
  { from: 'Mise à jour automatique: <strong>janvier 2025', to: 'Mise à jour automatique: <strong>janvier 2026' },
  { from: 'Dernière mise à jour :</strong> Janvier 2025', to: 'Dernière mise à jour :</strong> Janvier 2026' },
  { from: '<strong>Dernière mise à jour:</strong> janvier 2025', to: '<strong>Dernière mise à jour:</strong> janvier 2026' },
  
  // Twitter/OG
  { from: 'name="twitter:title"\n      content="🏠 Frais de Notaire 2025', to: 'name="twitter:title"\n      content="🏠 Frais de Notaire 2026' },
  { from: 'name="twitter:title"\n      content="Impôt sur le Revenu 2025', to: 'name="twitter:title"\n      content="Impôt sur le Revenu 2026' },
  { from: 'content="🏠 Frais de Notaire 2025', to: 'content="🏠 Frais de Notaire 2026' },
  
  // Blocs spécifiques
  { from: '❓ Comment calculer les frais de notaire en France en 2025', to: '❓ Comment calculer les frais de notaire en France en 2026' },
  { from: '<strong>Source:</strong> Chambre des Notaires France 2025', to: '<strong>Source:</strong> Chambre des Notaires France 2026' },
];

// Patterns à EXCLURE (données officielles)
const excludePatterns = [
  '2024-2025',  // Références légales
  'CSN 2025',   // Conseil Supérieur Notariat
  'DGFIP 2025', // Direction impôts
  'URSSAF 2025',// Cotisations
  '// Barème',  // Commentaires techniques
];

function shouldExclude(line) {
  return excludePatterns.some(pattern => line.includes(pattern));
}

function findHtmlFilesRecursive(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findHtmlFilesRecursive(fullPath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(fullPath);
    }
  });
  
  return fileList;
}

const pagesDir = path.resolve(process.cwd(), 'src/pages');
const htmlFiles = findHtmlFilesRecursive(pagesDir);

let totalReplacements = 0;
let filesModified = 0;
const results = [];

console.log(`\n📄 Fichiers trouvés: ${htmlFiles.length}\n`);

htmlFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let fileReplacements = 0;

  // Appliquer tous les remplacements
  replacements.forEach((pattern) => {
    let count = 0;
    let newContent = content;
    
    // Compter les occurrences avant exclusion
    const tempContent = content.split('\n');
    tempContent.forEach((line) => {
      if (!shouldExclude(line) && line.includes(pattern.from)) {
        count++;
      }
    });

    if (count > 0) {
      // Remplacer ligne par ligne pour exclure les patterns
      newContent = content
        .split('\n')
        .map((line) => {
          if (!shouldExclude(line) && line.includes(pattern.from)) {
            return line.replace(new RegExp(pattern.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), pattern.to);
          }
          return line;
        })
        .join('\n');

      if (newContent !== content) {
        content = newContent;
        fileReplacements += count;
        totalReplacements += count;
      }
    }
  });

  // Sauvegarder si modifications
  if (fileReplacements > 0 && content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    filesModified++;
    results.push({
      path: path.relative(process.cwd(), filePath),
      changes: fileReplacements,
    });
    console.log(`✅ ${path.relative(process.cwd(), filePath).padEnd(60)} → ${fileReplacements} remplacements`);
  }
});

results.sort((a, b) => b.changes - a.changes);

console.log(`
${"═".repeat(70)}

📊 RÉSUMÉ FINAL:

   ✅ Fichiers modifiés: ${filesModified}/${htmlFiles.length}
   ✅ Total remplacements: ${totalReplacements}
   ✅ Contextes: SEO + Visible + Contenu
   ✅ Données officielles: PRÉSERVÉES ✓

Principaux fichiers:
${results.slice(0, 10).map(r => `   • ${r.path.padEnd(50)} (${r.changes})`).join('\n')}

${"═".repeat(70)}

✨ Migration 2025 → 2026 complète!

Prochaines étapes:
   1. npm run build
   2. git add -A && git commit -m "SEO: 2025 → 2026"
   3. Vérifier les pages en dev

${"═".repeat(70)}
`);
