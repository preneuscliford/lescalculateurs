#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset}  ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset}  ${msg}`),
  detail: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`)
};

// VRAIS mots français qui collent souvent (pas "LesCalculateurs")
const COMMON_FRENCH_WORDS = [
  'des', 'd', 'et', 'ou', 'par', 'aux', 'sur', 'pour', 'avec', 
  'dans', 'ce', 'de', 'la', 'le', 'un', 'une', 'est', 'sont',
  'peut', 'qui', 'ne', 'pas', 'qu', 'l', 'à', 'à'
];

// EXCLURE ces marques/noms propres
const IGNORE_PATTERNS = [
  /LesCalculateurs/,      // Marque
  /JavaScript/,           // Langage
  /TypeScript/,           // Langage
  /D[a-z]+[A-Z]/,        // Pattern: D + lettre + Majuscule (d'Accord → normal)
];

/**
 * Teste si on doit ignorer cette détection
 */
function shouldIgnore(error) {
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.test(error)) {
      return true;
    }
  }
  return false;
}

/**
 * Trouve les vrais espaces manquants
 */
function findRealSpacingErrors(htmlContent) {
  const errors = [];
  
  // Pattern 1: mot français suivi immédiatement d'une majuscule (ex: "dansles", "pardes")
  for (const word of COMMON_FRENCH_WORDS) {
    // word + capitale + minuscules
    const regex = new RegExp(`\\b${word}([A-Z][a-zàâäæçéèêëîïôùûüœ]+)`, 'g');
    let match;
    
    while ((match = regex.exec(htmlContent)) !== null) {
      const fullMatch = match[0];
      const suggestion = `${word} ${match[1]}`;
      
      // Exclure les faux positifs
      if (!shouldIgnore(fullMatch)) {
        errors.push({
          error: fullMatch,
          suggestion: suggestion,
          word: word,
          capital: match[1]
        });
      }
    }
  }

  // Pattern 2: ponctuation suivi immédiatement d'une lettre (ex: ".Les")
  const punctPattern = /([.!?,;:])([A-Z][a-zàâäæçéèêëîïôùûüœ]+)/g;
  let match;
  while ((match = punctPattern.exec(htmlContent)) !== null) {
    const fullMatch = match[0];
    const suggestion = `${match[1]} ${match[2]}`;
    
    if (!shouldIgnore(fullMatch)) {
      errors.push({
        error: fullMatch,
        suggestion: suggestion,
        type: 'punctuation'
      });
    }
  }

  return errors;
}

/**
 * Traite un fichier
 */
function processFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const html = fs.readFileSync(filePath, 'utf-8');
    const errors = findRealSpacingErrors(html);
    
    return errors.map(err => ({
      ...err,
      file: filePath
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Récurse dans les dossiers
 */
function findFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      if (!item.startsWith('.') && !item.includes('node_modules')) {
        files = files.concat(findFiles(itemPath));
      }
    } else if (item.endsWith('.html')) {
      files.push(itemPath);
    }
  }
  
  return files;
}

/**
 * Main
 */
function main() {
  log.info('\n━━ DÉTECTEUR D\'ESPACES MANQUANTS v2 ━━\n');

  const dirs = [
    path.join(__dirname, '..', 'content_SAFE'),
    path.join(__dirname, '..', 'src', 'pages')
  ];

  let allErrors = [];
  let processedCount = 0;

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    
    log.info(`Scan: ${path.basename(dir)}`);
    const files = findFiles(dir);
    
    for (const file of files) {
      const errors = processFile(file);
      allErrors = allErrors.concat(errors);
      processedCount++;
      
      if (processedCount % 100 === 0) {
        log.detail(`Traité: ${processedCount} fichiers (${allErrors.length} erreurs)`);
      }
    }
  }

  log.success(`${processedCount} fichiers trouvés`);
  
  // Dédupliquer par contenu
  const uniqueErrors = [];
  const seen = new Set();
  
  for (const err of allErrors) {
    const key = `${err.error}|${err.suggestion}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueErrors.push(err);
    }
  }

  log.success(`${uniqueErrors.length} erreurs uniques trouvées`);

  // Grouper par fichier
  const byFile = {};
  for (const err of uniqueErrors) {
    if (!byFile[err.file]) {
      byFile[err.file] = [];
    }
    byFile[err.file].push(err);
  }

  // Top fichiers
  const topFiles = Object.entries(byFile)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20);

  log.info('\n📄 Top fichiers affectés:');
  for (const [file, errors] of topFiles) {
    const filename = path.relative(path.join(__dirname, '..'), file);
    log.detail(`  ${filename}: ${errors.length}`);
  }

  // Sauver
  const outputFile = path.join(__dirname, '..', 'real-spaces-v2.json');
  fs.writeFileSync(outputFile, JSON.stringify(uniqueErrors.slice(0, 500), null, 2));
  log.success(`\n✓ ${outputFile} (premiers 500)`);
}

main();
