#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const DIRS = [
  path.join(__dirname, '..', 'content_SAFE'),
  path.join(__dirname, '..', 'src', 'pages')
];
const OUTPUT_FILE = path.join(__dirname, '..', 'real-missing-spaces.json');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset}  ${msg}`),
};

/**
 * Patterns pour les VRAIES erreurs d'espaces manquants
 * Cherche: petitmot+MajusculesMot (ex: "Lesapartements" "dansles")
 */
function findRealMissingSpaces(text) {
  const errors = [];

  // Pattern: mots courants (1-3 lettres) accolés à un mot majuscule
  // "Les", "des", "d", "et", "ou", "par", "aux", "sur", "pour", "avec", "dans", "ce", "de", "la", "le", "les"
  const commonWords = [
    'Les', 'les', 'Des', 'des', 'D', 'd', 'Et', 'et', 'Ou', 'ou', 'Par', 'par',
    'Aux', 'aux', 'Sur', 'sur', 'Pour', 'pour', 'Avec', 'avec', 'Dans', 'dans',
    'Ce', 'ce', 'De', 'de', 'La', 'la', 'Le', 'le', 'Ou', 'ou', 'Un', 'un',
    'Une', 'une', 'Est', 'est', 'Sont', 'sont', 'Peut', 'peut', 'Qui', 'qui',
    'Ne', 'ne', 'Pas', 'pas'
  ];

  for (const word of commonWords) {
    // Chercher: (word)([A-Z][a-z]+) ex: "Les" + "Propriétaires"
    const regex = new RegExp(`\\b${word}([A-Z][a-zàâäæçéèêëîïôùûüœ]+)`, 'g');
    let match;

    while ((match = regex.exec(text)) !== null) {
      const fullWord = word + match[1];
      const start = Math.max(0, match.index - 30);
      const end = Math.min(text.length, match.index + fullWord.length + 30);
      const context = text.substring(start, end);

      errors.push({
        error: fullWord,
        suggestion: word + ' ' + match[1],
        context: context,
        position: match.index,
        commonWord: word,
        nextWord: match[1]
      });
    }
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

    // Extraire texte visible uniquement (pas script/style)
    $('script, style, meta, noscript').remove();
    const text = $.text();
    
    const errors = findRealMissingSpaces(text);
    
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
  log.info('\n━━ DÉTECTEUR D\'ESPACES MANQUANTS (VRAIS ERREURS) ━━\n');

  // Fichiers
  let allFiles = [];
  for (const dir of DIRS) {
    const files = getFilesRecursive(dir);
    allFiles = allFiles.concat(files);
  }

  log.success(`${allFiles.length} fichiers trouvés`);

  // Traiter
  let allErrors = [];
  for (let i = 0; i < allFiles.length; i++) {
    const errors = processFile(allFiles[i]);
    allErrors = allErrors.concat(errors);
    
    if ((i + 1) % 100 === 0) {
      log.info(`Traité: ${i + 1}/${allFiles.length} (${allErrors.length} erreurs)`);
    }
  }

  // Analyser
  const byFile = {};
  for (const e of allErrors) {
    const f = e.file.split('\\').pop();
    byFile[f] = (byFile[f] || 0) + 1;
  }

  log.success(`\n${allErrors.length} vrais espaces manquants trouvés\n`);

  log.info('📄 Top fichiers affectés:');
  Object.entries(byFile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([f, c]) => {
      console.log(`   ${f}: ${c}`);
    });

  // Sauvegarder (limit 200)
  const limited = allErrors.slice(0, 200);
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(limited, null, 2), 'utf-8');
    log.success(`\n✓ real-missing-spaces.json (${limited.length} premiers)`);
  } catch (err) {
    console.error(`Erreur: ${err.message}`);
  }
}

main();
