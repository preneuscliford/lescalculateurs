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

// Mots français courants (+ variations)
const FRENCH_WORDS = [
  'Les', 'les', 'Des', 'des', 'd', 'D',
  'et', 'ou', 'par', 'aux', 'sur', 'pour', 'avec', 
  'dans', 'ce', 'de', 'la', 'le', 'un', 'une', 'est', 'sont',
  'peut', 'qui', 'ne', 'pas', 'qu', 'l', 'à', 'que',
  'occupants', 'propriétaires', 'locataires', 'bénéficiaires'
];

/**
 * Cherche des mots collés
 */
function findCollidedWords(htmlContent) {
  const errors = [];
  
  // Pattern: mot français + lettre (maj/min) + suite de lettres
  for (const word of FRENCH_WORDS) {
    // Cas 1: mot + lettre minuscule (ex: "Lespropriétaires")
    const regex1 = new RegExp(`\\b${word}([a-zàâäæçéèêëîïôùûüœ]+)`, 'g');
    let match;
    
    while ((match = regex1.exec(htmlContent)) !== null) {
      const fullMatch = match[0];
      const nextWord = match[1];
      
      // Exclure si c'est "LesCalculateurs" 
      if (fullMatch === 'LesCalculateurs') continue;
      
      // Exclure les mots très courts (1-2 lettres)
      if (nextWord.length < 3) continue;
      
      errors.push({
        error: fullMatch,
        suggestion: `${word} ${nextWord}`,
        type: 'minuscule',
        french: word,
        next: nextWord
      });
    }

    // Cas 2: mot + majuscule (ex: "lesProprietaires")
    const regex2 = new RegExp(`\\b${word}([A-Z][a-zàâäæçéèêëîïôùûüœ]+)`, 'g');
    
    while ((match = regex2.exec(htmlContent)) !== null) {
      const fullMatch = match[0];
      const nextWord = match[1];
      
      // Exclure "LesCalculateurs"
      if (fullMatch === 'LesCalculateurs') continue;
      
      errors.push({
        error: fullMatch,
        suggestion: `${word} ${nextWord}`,
        type: 'majuscule',
        french: word,
        next: nextWord
      });
    }
  }

  // Pattern 3: ponctuation + mot français sans espace
  const punctPattern = /([.!?,;:]\s*)([A-Za-z]+)/g;
  while ((match = punctPattern.exec(htmlContent)) !== null) {
    const word = match[2];
    if (FRENCH_WORDS.includes(word)) {
      const fullMatch = match[1] + word;
      errors.push({
        error: fullMatch.trim(),
        suggestion: `${match[1].trim()} ${word}`,
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
    // Strip HTML tags pour chercher dans le texte pur
    const $ = cheerio.load(html);
    const text = $('body').text() || html;
    
    const errors = findCollidedWords(text);
    
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
  log.info('\n━━ DÉTECTEUR ESPACES - MODE AGRESSIF ━━\n');

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
  
  // Dédupliquer
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
    .slice(0, 30);

  log.info('\n📄 Top fichiers:');
  for (const [file, errors] of topFiles) {
    const filename = path.relative(path.join(__dirname, '..'), file);
    log.detail(`  ${filename}: ${errors.length}`);
    
    // Exemples
    errors.slice(0, 3).forEach(err => {
      log.detail(`    • "${err.error}" → "${err.suggestion}"`);
    });
  }

  // Sauver
  const outputFile = path.join(__dirname, '..', 'spacing-errors-all.json');
  fs.writeFileSync(outputFile, JSON.stringify(uniqueErrors, null, 2));
  log.success(`\n✓ ${outputFile}`);
}

main();
