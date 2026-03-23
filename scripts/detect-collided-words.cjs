#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset}  ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset}  ${msg}`),
  detail: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`)
};

// Mots français courts (2-6 lettres) qui se collent souvent
const SHORT_WORDS = [
  'Les', 'les', 'Des', 'des', 'Les', 'occupants',
  'et', 'ou', 'par', 'aux', 'sur', 'une', 'un',
  'ne', 'pas', 'qu', 'que', 'qui', 'est', 'sont',
  'dans', 'pour', 'avec', 'dont', 'dès'
];

/**
 * Cherche DEUX mots entiers collés (pas des patterns moches)
 */
function findTwoWordsCollided(text) {
  const errors = [];
  
  // Pattern: mot court + mot entier
  // Ex: "Lespropriétaires" = "Les" + "propriétaires"
  //     "occupantsne" = "occupants" + "ne"
  
  for (const word of SHORT_WORDS) {
    // word + au moins 4 lettres (word entier après)
    // Cherche: \bword + 4+ lettres consécutives
    const regex = new RegExp(`\\b${word}([a-zàâäæçéèêëîïôùûüœ]{4,})`, 'gi');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0];
      const nextWord = match[1];
      
      // Exclure "LesCalculateurs" (nom de marque)
      if (fullMatch.toLowerCase() === 'lescalculateurs') continue;
      
      // Exclure les mots dérivés d'un seul mot (dessus, dessous, dès_que)
      // Check: si le mot d'après commence par voyelle après la consonne du mot court
      // Exemples à EXCLURE:
      // - "dessus" = des + sus (OK donc PAS exclure)
      // - "détermine" = d + etermine (OK exclure car "d" seul)
      
      // MAIS: seulement si word fait au moins 2-3 lettres et est dans FRENCH
      if (word.length >= 2) {
        errors.push({
          error: fullMatch,
          suggestion: `${word} ${nextWord}`,
          word: word,
          next: nextWord
        });
      }
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
    const $ = cheerio.load(html);
    const text = $('body').text() || html;
    
    const errors = findTwoWordsCollided(text);
    
    return errors.map(err => ({
      ...err,
      file: filePath
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Récurse
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
  log.info('\n━━ DÉTECTEUR DEUX-MOTS-COLLÉS ━━\n');

  const dirs = [
    path.join(__dirname, '..', 'content_SAFE'),
    path.join(__dirname, '..', 'src', 'pages')
  ];

  let allErrors = [];
  let processedCount = 0;

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    
    const files = findFiles(dir);
    
    for (const file of files) {
      const errors = processFile(file);
      allErrors = allErrors.concat(errors);
      processedCount++;
      
      if (processedCount % 100 === 0) {
        log.detail(`Traité: ${processedCount}/502 (${allErrors.length} erreurs)`);
      }
    }
  }

  log.success(`${processedCount} fichiers traités`);
  
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

  log.success(`${uniqueErrors.length} erreurs trouvées`);

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

  if (topFiles.length > 0) {
    log.info('\n📄 Top fichiers affectés:');
    for (const [file, errors] of topFiles) {
      const filename = path.relative(path.join(__dirname, '..'), file);
      log.detail(`  ${filename}: ${errors.length}`);
      
      // Exemples (max 3)
      errors.slice(0, 3).forEach(err => {
        log.detail(`    • "${err.error}" → "${err.suggestion}"`);
      });
    }
  }

  // Sauver
  const outputFile = path.join(__dirname, '..', 'spacing-real-errors.json');
  fs.writeFileSync(outputFile, JSON.stringify(uniqueErrors, null, 2));
  log.success(`\n✓ ${outputFile} (${uniqueErrors.length} erreurs)`);
}

main();
