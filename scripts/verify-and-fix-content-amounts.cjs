#!/usr/bin/env node
/**
 * Script de vérification et correction des montants dans les contenus HTML
 * Vérifie que les montants affichés sont bien dans les fourchettes 2026
 */

const fs = require('fs');
const path = require('path');

// Barèmes officiels 2026 avec fourchettes acceptables
const BAREMES_2026 = {
  // RSA
  rsa: {
    seul: { min: 640, max: 650, correct: 646.52 },
    couple: { min: 960, max: 975, correct: 969.78 },
    parentIsole1enf: { min: 1100, max: 1115, correct: 1106.94 },
    parentIsole2enf: { min: 1375, max: 1390, correct: 1383.68 },
    parentIsole3enf: { min: 1655, max: 1665, correct: 1660.41 },
    majorationEnfant: { min: 255, max: 262, correct: 258.61 },
  },
  // AAH
  aah: {
    tauxPlein: { min: 1028, max: 1038, correct: 1033.32 },
  },
  // SMIC (2025 - en attente 2026)
  smic: {
    horaire: { min: 11.80, max: 12.10, correct: 11.88 },
    mensuel: { min: 1795, max: 1830, correct: 1801.80 },
  },
  // ASF
  asf: {
    parEnfant: { min: 174, max: 179, correct: 176.50 },
  },
  // ARE (à vérifier)
  are: {
    minJournalier: { min: 30, max: 33, correct: 31.45 },
    maxJournalier: { min: 185, max: 190, correct: 186.92 },
  },
};

// Patterns de recherche
const MONTANT_PATTERNS = [
  // Format: 123,45 € ou 123.45 € ou 1 234,56 €
  /(\d{1,3}(?:[\s.]?\d{3})*[.,]\d{2})\s*€/g,
  // Format: € 123,45
  /€\s*(\d{1,3}(?:[\s.]?\d{3})*[.,]\d{2})/g,
];

function extractAmounts(text) {
  const amounts = [];
  for (const pattern of MONTANT_PATTERNS) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      // Normaliser le nombre (remplacer espace/espace insécable et virgule française)
      const normalized = match[1]
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
      amounts.push({
        original: match[0],
        value: parseFloat(normalized),
        index: match.index,
      });
    }
  }
  return amounts;
}

function checkAmountInRange(amount, category, subcategory) {
  const config = BAREMES_2026[category]?.[subcategory];
  if (!config) return null;
  
  const inRange = amount >= config.min && amount <= config.max;
  return {
    inRange,
    expected: config.correct,
    tolerance: { min: config.min, max: config.max },
  };
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const amounts = extractAmounts(content);
  const issues = [];
  
  for (const amount of amounts) {
    let checked = false;
    
    // Vérifier RSA
    if (content.substring(Math.max(0, amount.index - 200), amount.index + 50)
        .toLowerCase().includes('rsa')) {
      // Vérifier selon le contexte
      const context = content.substring(Math.max(0, amount.index - 300), amount.index + 100).toLowerCase();
      
      if (context.includes('couple')) {
        const check = checkAmountInRange(amount.value, 'rsa', 'couple');
        if (check && !check.inRange) {
          issues.push({ ...amount, category: 'RSA couple', check, context: 'couple' });
        }
        checked = true;
      } else if (context.includes('parent') || context.includes('isole')) {
        // Parent isolé
        if (amount.value > 1000) {
          const check = checkAmountInRange(amount.value, 'rsa', 'parentIsole1enf');
          if (check && !check.inRange) {
            issues.push({ ...amount, category: 'RSA parent isolé', check, context: 'parent isolé' });
          }
        }
        checked = true;
      } else if (amount.value > 600 && amount.value < 700) {
        // Personne seule
        const check = checkAmountInRange(amount.value, 'rsa', 'seul');
        if (check && !check.inRange) {
          issues.push({ ...amount, category: 'RSA seul', check, context: 'seul' });
        }
        checked = true;
      }
    }
    
    // Vérifier AAH
    if (content.substring(Math.max(0, amount.index - 200), amount.index + 50)
        .toLowerCase().includes('aah')) {
      if (amount.value > 900 && amount.value < 1100) {
        const check = checkAmountInRange(amount.value, 'aah', 'tauxPlein');
        if (check && !check.inRange) {
          issues.push({ ...amount, category: 'AAH', check, context: 'taux plein' });
        }
        checked = true;
      }
    }
    
    // Vérifier SMIC
    if (content.substring(Math.max(0, amount.index - 200), amount.index + 50)
        .toLowerCase().includes('smic')) {
      if (amount.value > 10 && amount.value < 15) {
        // Horaire
        const check = checkAmountInRange(amount.value, 'smic', 'horaire');
        if (check && !check.inRange) {
          issues.push({ ...amount, category: 'SMIC horaire', check, context: 'horaire' });
        }
      } else if (amount.value > 1700 && amount.value < 1900) {
        // Mensuel
        const check = checkAmountInRange(amount.value, 'smic', 'mensuel');
        if (check && !check.inRange) {
          issues.push({ ...amount, category: 'SMIC mensuel', check, context: 'mensuel' });
        }
      }
      checked = true;
    }
    
    // Vérifier ASF
    if (content.substring(Math.max(0, amount.index - 200), amount.index + 50)
        .toLowerCase().includes('asf')) {
      if (amount.value > 170 && amount.value < 180) {
        const check = checkAmountInRange(amount.value, 'asf', 'parEnfant');
        if (check && !check.inRange) {
          issues.push({ ...amount, category: 'ASF', check, context: 'par enfant' });
        }
      }
      checked = true;
    }
  }
  
  return { filePath, amounts: amounts.length, issues };
}

function fixAmountsInFile(filePath, dryRun = true) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  const fixes = [];
  
  // Corrections RSA
  // 607,75 € → 646,52 €
  if (content.includes('607,75') || content.includes('607.75')) {
    fixes.push({ from: '607,75', to: '646,52', category: 'RSA seul' });
    if (!dryRun) {
      content = content.replace(/607[.,]75/g, '646,52');
      modified = true;
    }
  }
  if (content.includes('607.75')) {
    fixes.push({ from: '607.75', to: '646.52', category: 'RSA seul' });
    if (!dryRun) {
      content = content.replace(/607\.75/g, '646.52');
      modified = true;
    }
  }
  
  // 911,62 € → 969,78 €
  if (content.includes('911,62') || content.includes('911.62')) {
    fixes.push({ from: '911,62', to: '969,78', category: 'RSA couple' });
    if (!dryRun) {
      content = content.replace(/911[.,]62/g, '969,78');
      modified = true;
    }
  }
  
  // 956,65 € → 1 033,32 €
  if (content.includes('956,65') || content.includes('956.65')) {
    fixes.push({ from: '956,65', to: '1 033,32', category: 'AAH' });
    if (!dryRun) {
      content = content.replace(/956[.,]65/g, '1 033,32');
      modified = true;
    }
  }
  
  // 1 016,65 € → 1 033,32 €
  if (content.includes('1 016,65') || content.includes('1016,65')) {
    fixes.push({ from: '1 016,65', to: '1 033,32', category: 'AAH' });
    if (!dryRun) {
      content = content.replace(/1?\s?016[.,]65/g, '1 033,32');
      modified = true;
    }
  }
  
  // SMIC 12,02 → 11,88
  if (content.includes('12,02') || content.includes('12.02')) {
    // Vérifier le contexte SMIC
    if (content.toLowerCase().includes('smic')) {
      fixes.push({ from: '12,02', to: '11,88', category: 'SMIC horaire' });
      if (!dryRun) {
        content = content.replace(/12[.,]02/g, '11,88');
        modified = true;
      }
    }
  }
  
  // 1 823,03 → 1 801,80
  if (content.includes('1 823,03') || content.includes('1823,03')) {
    if (content.toLowerCase().includes('smic')) {
      fixes.push({ from: '1 823,03', to: '1 801,80', category: 'SMIC mensuel' });
      if (!dryRun) {
        content = content.replace(/1?\s?823[.,]03/g, '1 801,80');
        modified = true;
      }
    }
  }
  
  if (modified && !dryRun) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  
  return { filePath, fixes, modified };
}

function main() {
  const directories = [
    'pages_YMYL_FINAL',
    'pages_SIMULATEURS_PLUS', 
    'pages_SCHEMA_FINAL',
    'content_SAFE'
  ];
  
  const allResults = [];
  const allFixes = [];
  
  console.log('🔍 Vérification des montants dans les contenus HTML...\n');
  
  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️ Dossier non trouvé: ${dir}`);
      continue;
    }
    
    function scanDir(currentPath) {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          scanDir(itemPath);
        } else if (item.endsWith('.html')) {
          // Analyser
          const result = analyzeFile(itemPath);
          if (result.issues.length > 0) {
            allResults.push(result);
          }
          
          // Vérifier corrections possibles
          const fixResult = fixAmountsInFile(itemPath, true);
          if (fixResult.fixes.length > 0) {
            allFixes.push(fixResult);
          }
        }
      }
    }
    
    scanDir(dirPath);
  }
  
  // Afficher résultats
  if (allResults.length === 0 && allFixes.length === 0) {
    console.log('✅ Aucun montant incorrect détecté dans les contenus HTML !');
  } else {
    console.log(`⚠️ ${allResults.length} fichiers avec problèmes détectés`);
    console.log(`🔧 ${allFixes.length} fichiers avec corrections possibles\n`);
    
    for (const result of allResults.slice(0, 10)) {
      console.log(`\n📄 ${result.filePath}`);
      console.log(`   Montants trouvés: ${result.amounts}`);
      for (const issue of result.issues) {
        console.log(`   ❌ ${issue.category}: ${issue.original} (attendu: ~${issue.check.expected}€)`);
      }
    }
    
    if (allFixes.length > 0) {
      console.log('\n\n🔧 Corrections possibles:');
      for (const fix of allFixes) {
        console.log(`\n📄 ${fix.filePath}`);
        for (const f of fix.fixes) {
          console.log(`   ${f.from} → ${f.to} (${f.category})`);
        }
      }
    }
  }
  
  // Option pour appliquer les corrections
  if (process.argv.includes('--fix')) {
    console.log('\n\n🔧 Application des corrections...');
    let fixedCount = 0;
    for (const fix of allFixes) {
      const result = fixAmountsInFile(fix.filePath, false);
      if (result.modified) {
        fixedCount++;
        console.log(`✅ Corrigé: ${fix.filePath}`);
      }
    }
    console.log(`\n✅ ${fixedCount} fichiers corrigés`);
  }
}

main();
