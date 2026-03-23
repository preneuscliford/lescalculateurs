#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const DIRS = [
  path.join(__dirname, '..', 'content_SAFE'),
  path.join(__dirname, '..', 'src', 'pages')
];
const OUTPUT_FILE = path.join(__dirname, '..', 'missing-spaces-report.json');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset}  ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset}  ${msg}`),
};

/**
 * Patterns pour identifier les espaces manquants
 */
function findMissingSpaces(text) {
  const errors = [];

  // Pattern 1: Mot minuscule accolé à mot avec capitale (LeMot → Le Mot)
  const pattern1 = /([a-zàâäæçéèêëîïôùûüœ])([A-ZÀÂÄÆÇÉÈÊËÎÏÔÙÛÜŒ])/g;
  let match;
  while ((match = pattern1.exec(text)) !== null) {
    const pos = match.index + 1;
    const before = text.substring(Math.max(0, pos - 20), pos);
    const after = text.substring(pos, Math.min(text.length, pos + 20));
    
    // Éviter les acronymes et les mots spéciaux
    const word = text.substring(match.index, match.index + 30);
    if (!/^[a-z]{1,3}[A-Z]/.test(word) || /[0-9]/.test(word)) {
      continue;
    }

    errors.push({
      type: 'missing_space_capitals',
      position: match.index,
      found: match[0],
      context: before + '[' + match[0] + ']' + after,
      suggestion: match[1] + ' ' + match[2]
    });
  }

  // Pattern 2: Espaces multiples (problème d'encodage)
  const pattern2 = /\s{3,}/g;
  while ((match = pattern2.exec(text)) !== null) {
    const context = text.substring(match.index - 15, match.index + 15);
    errors.push({
      type: 'multiple_spaces',
      position: match.index,
      found: match[0],
      context: context,
      length: match[0].length
    });
  }

  // Pattern 3: Mots collés à la ponctuation (mot,mot → mot, mot)
  const pattern3 = /([a-zàâäæçéèêëîïôùûüœ]+)([,;:!?])([a-zàâäæçéèêëîïôùûüœ])/g;
  while ((match = pattern3.exec(text)) !== null) {
    errors.push({
      type: 'missing_space_punctuation',
      position: match.index,
      found: match[0],
      context: text.substring(match.index - 10, match.index + 30),
      suggestion: match[1] + match[2] + ' ' + match[3]
    });
  }

  return errors;
}

/**
 * Récupère tous les fichiers
 */
function getFilesRecursive(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getFilesRecursive(fullPath));
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Traite un fichier
 */
function processFile(filePath) {
  try {
    const html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);

    // Extraire texte visible
    const text = $('body').text();
    
    const errors = findMissingSpaces(text);
    
    return errors.map(e => ({
      ...e,
      file: filePath
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Main
 */
function main() {
  log.info('\n━━ DÉTECTEUR D\'ESPACES MANQUANTS ━━\n');

  // Collecter fichiers
  let allFiles = [];
  for (const dir of DIRS) {
    const files = getFilesRecursive(dir);
    allFiles = allFiles.concat(files);
  }

  log.success(`${allFiles.length} fichiers trouvés`);
  log.info('Scanning...\n');

  // Traiter
  let allErrors = [];
  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i];
    const errors = processFile(file);
    allErrors = allErrors.concat(errors);
    
    if ((i + 1) % 50 === 0) {
      log.info(`Traité: ${i + 1}/${allFiles.length}`);
    }
  }

  // Analyser
  const byType = {};
  const byFile = {};

  for (const e of allErrors) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    const f = e.file.split('\\').pop();
    byFile[f] = (byFile[f] || 0) + 1;
  }

  log.success(`\n${allErrors.length} erreurs d'espaces trouvées\n`);

  log.info('📊 Par type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  log.info('\n📄 Top 20 fichiers:');
  Object.entries(byFile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([f, c]) => {
      console.log(`   ${f}: ${c}`);
    });

  // Sauvegarder
  log.info('\n💾 Sauvegarde...');
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allErrors.slice(0, 500), null, 2), 'utf-8');
    log.success(`✓ missing-spaces-report.json (premiers 500)`);
  } catch (err) {
    log.error(`Erreur: ${err.message}`);
  }
}

main();
