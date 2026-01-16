/**
 * Script de mise à jour globale des pages frais de notaire
 * - Corrige les références 2025 → 2026 (sauf impôts qui restent en 2025)
 * - Corrige les anciens taux DMTO (3,80%, 6,45%, 5,81%) → nouveaux taux 2026
 * - Met à jour les sources vers impots.gouv.fr
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pages à mettre à jour pour les frais de notaire
const notairePages = [
  'src/pages/comment-calculer-frais-notaire.html',
  'src/pages/methodologie.html',
  'src/pages/sources.html',
  'src/pages/blog/frais-notaire-departements.html',
  'src/pages/blog/frais-notaire-ancien-neuf-2025.html',
];

// Pages de départements
const deptPagesPattern = 'src/pages/blog/departements/frais-notaire-*.html';

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Fichier non trouvé: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // ========================================
  // 1. Corrections des taux DMTO obsolètes
  // ========================================
  
  // Ancien taux réduit incorrect
  content = content.replace(/3,80\s*%\s*\(56,?\s*57,?\s*67,?\s*68\)/g, '5,09% (36 Indre, 976 Mayotte)');
  content = content.replace(/≈\s*3,80\s*%/g, '5,09%');
  content = content.replace(/3,80%/g, '5,09%');
  
  // Ancien taux majoré incorrect (IDF)
  content = content.replace(/6,45\s*%\s*\(92,?\s*93,?\s*94\)/g, '6,32% (taux majoré)');
  content = content.replace(/≈\s*6,45\s*%/g, '6,32%');
  content = content.replace(/6,45%/g, '6,32%');
  
  // Paris ancien taux
  content = content.replace(/5,81\s*%\s*\(Paris\)/g, '6,32% (Paris, taux majoré)');
  content = content.replace(/Paris.*5,81\s*%/g, 'Paris 6,32%');
  content = content.replace(/≈\s*5,81\s*%/g, '6,32%');
  
  // ========================================
  // 2. Mise à jour années (frais notaire uniquement)
  // ========================================
  
  // Frais de notaire 2025 → 2026
  content = content.replace(/frais de notaire 2025/gi, 'frais de notaire 2026');
  content = content.replace(/Frais de notaire 2025/g, 'Frais de notaire 2026');
  content = content.replace(/frais notaire 2025/gi, 'frais notaire 2026');
  
  // Barème notaire 2025 → 2026
  content = content.replace(/barème notaire 2025/gi, 'barème notaire 2026');
  content = content.replace(/barèmes notaire 2025/gi, 'barèmes notaire 2026');
  content = content.replace(/Barème notaire 2025/g, 'Barème notaire 2026');
  
  // Barèmes officiels 2024-2025 → 2026
  content = content.replace(/Barèmes officiels 2024-2025/g, 'Barèmes officiels 2026');
  content = content.replace(/barèmes officiels 2024-2025/g, 'barèmes officiels 2026');
  content = content.replace(/Barème officiel 2024-2025/g, 'Barème officiel 2026');
  content = content.replace(/barème officiel 2024-2025/g, 'barème officiel 2026');
  
  // Émoluments 2025 → 2026
  content = content.replace(/émoluments notariaux 2025/gi, 'émoluments notariaux 2026');
  content = content.replace(/Barème des émoluments notariaux 2025/g, 'Barème des émoluments notariaux 2026');
  
  // ========================================
  // 3. Corrections termes juridiques
  // ========================================
  
  // exactitude → précision (sécurité juridique)
  content = content.replace(/avec exactitude/g, 'avec précision');
  
  // ========================================
  // 4. Mise à jour sources
  // ========================================
  
  // BOFiP → impots.gouv.fr
  content = content.replace(
    /https:\/\/bofip\.impots\.gouv\.fr\/bofip\/4739-PGP\.html/g,
    'https://www.impots.gouv.fr/droits-denregistrement'
  );
  content = content.replace(/BOFiP — Taux DMTO/g, 'impots.gouv.fr — Taux DMTO');
  
  // Vérifier si modifié
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// Exécution
console.log('🔧 Mise à jour des pages frais de notaire...\n');

let updatedCount = 0;

// Pages principales
for (const page of notairePages) {
  const fullPath = path.join(__dirname, '..', page);
  if (updateFile(fullPath)) {
    console.log(`✅ ${page}`);
    updatedCount++;
  } else {
    console.log(`⏭️ ${page} (pas de changement ou non trouvé)`);
  }
}

// Pages départements
const deptPages = glob.sync(path.join(__dirname, '..', deptPagesPattern));
console.log(`\n📁 ${deptPages.length} pages de départements trouvées`);

let deptUpdated = 0;
for (const fullPath of deptPages) {
  if (updateFile(fullPath)) {
    deptUpdated++;
  }
}
console.log(`✅ ${deptUpdated} pages de départements mises à jour`);

updatedCount += deptUpdated;

console.log(`\n🎯 Total: ${updatedCount} fichiers mis à jour`);
console.log('\n⚠️ Note: Les pages impôt/IR gardent "barème 2025" car c\'est correct (revenus 2024)');
