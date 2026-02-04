#!/usr/bin/env node
/**
 * Script pour rendre les H2 uniques par page
 * Remplace les H2 génériques par des versions contextualisées
 */

const fs = require('fs');
const path = require('path');

const PAGES_DIR = './pages_YMYL_FINAL';

// Mapping des titres uniques par page
const pageTitles = {
  'aah.html': 'AAH 2026',
  'are.html': 'ARE 2026',
  'asf.html': 'ASF 2026',
  'charges.html': 'Charges 2026',
  'crypto-bourse.html': 'Crypto & Bourse',
  'financement.html': 'Financement',
  'ik.html': 'Indemnités Kilométriques',
  'impot.html': 'Impôt sur le revenu',
  'plusvalue.html': 'Plus-value immobilière',
  'pret.html': 'Prêt immobilier',
  'prime-activite.html': 'Prime d\'activité',
  'rsa.html': 'RSA 2026',
  'salaire.html': 'Salaire brut/net',
  'taxe.html': 'Taxe foncière',
  'travail.html': 'Temps de travail',
  'apl.html': 'APL',
  'apl-dom-tom.html': 'APL DOM-TOM',
  'apl-etudiant.html': 'APL Étudiant',
  'apl-zones.html': 'APL Zones',
  'notaire.html': 'Frais de notaire',
  'comment-calculer-frais-notaire.html': 'Calcul frais notaire',
  'comment-calculer-plus-value.html': 'Calcul plus-value',
  'ponts.html': 'Jours de pont',
};

function fixH2Duplicates() {
  const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.html'));
  
  for (const file of files) {
    const filePath = path.join(PAGES_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const context = pageTitles[file] || path.basename(file, '.html');
    
    let modified = false;
    
    // Remplacer les H2 génériques par des versions contextualisées
    const replacements = [
      {
        pattern: /<h2([^>]*)>\s*📌\s*Résumé rapide\s*<\/h2>/gi,
        replacement: `<h2$1>📌 Résumé rapide – ${context}</h2>`
      },
      {
        pattern: /<h2([^>]*)>\s*🧾\s*Ce que permet ce simulateur\s*<\/h2>/gi,
        replacement: `<h2$1>🧾 Ce que permet ce simulateur – ${context}</h2>`
      },
      {
        pattern: /<h2([^>]*)>\s*🧭\s*Guide rapide \(avant de calculer\)\s*<\/h2>/gi,
        replacement: `<h2$1>🧭 Guide rapide – ${context} (avant de calculer)</h2>`
      },
      {
        pattern: /<h2([^>]*)>\s*❓\s*Questions fréquentes\s*<\/h2>/gi,
        replacement: `<h2$1>❓ Questions fréquentes – ${context}</h2>`
      },
      {
        pattern: /<h2([^>]*)>\s*🔍\s*Lexique simplifié\s*<\/h2>/gi,
        replacement: `<h2$1>🔍 Lexique simplifié – ${context}</h2>`
      },
      {
        pattern: /<h2([^>]*)>\s*⚖️\s*Comparaison rapide\s*<\/h2>/gi,
        replacement: `<h2$1>⚖️ Comparaison rapide – ${context}</h2>`
      }
    ];
    
    for (const { pattern, replacement } of replacements) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${file} - H2 mis à jour`);
    }
  }
  
  console.log('\n🎉 Terminé ! Les H2 sont maintenant uniques par page.');
}

fixH2Duplicates();
