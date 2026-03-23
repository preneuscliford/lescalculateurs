#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ERRORS_FILE = path.join(__dirname, '..', 'real-missing-spaces.json');
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_EXT = '.bak';

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

// Mots-clés à IGNORER (noms de marques, variables, etc)
const IGNORE_ERRORS = new Set([
  'LesCalculateurs',  // Marque
  'JavaScript',       // Langage
  'TypeScript',       // Langage
]);

const stats = { processed: 0, applied: 0, skipped: 0, failed: 0 };

/**
 * Sauvegarde le fichier
 */
function backupFile(filePath) {
  const backupPath = filePath + BACKUP_EXT;
  if (!fs.existsSync(backupPath)) {
    try {
      fs.copyFileSync(filePath, backupPath);
      log.detail(`✓ Sauvegarde créée`);
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Groupe les erreurs par fichier
 */
function groupByFile(errors) {
  const groups = {};
  for (const error of errors) {
    // Ignorer les erreurs à exclure
    if (IGNORE_ERRORS.has(error.error)) {
      continue;
    }
    
    if (!groups[error.file]) {
      groups[error.file] = [];
    }
    groups[error.file].push(error);
  }
  return groups;
}

/**
 * Applique les corrections à un fichier
 */
function correctFile(filePath, errors) {
  try {
    if (!fs.existsSync(filePath)) {
      log.error(`Fichier non trouvé`);
      return { applied: 0, failed: 0 };
    }

    if (!DRY_RUN && !backupFile(filePath)) {
      log.error(`Sauvegarde impossible`);
      return { applied: 0, failed: 0 };
    }

    let html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);

    let applied = 0;
    const corrections = [];

    // Appliquer chaque correction
    for (const error of errors) {
      const regex = new RegExp(`\\b${error.error}\\b`, 'g');
      
      if (html.includes(error.error)) {
        const newHtml = html.replace(regex, error.suggestion);
        if (newHtml !== html) {
          html = newHtml;
          applied++;
          corrections.push(`${error.error} → ${error.suggestion}`);
        }
      }
    }

    // Écrire le fichier
    if (!DRY_RUN && applied > 0) {
      fs.writeFileSync(filePath, html, 'utf-8');
    }

    return { applied, corrections };
  } catch (err) {
    log.error(`Erreur: ${err.message}`);
    return { applied: 0, failed: 1 };
  }
}

/**
 * Main
 */
function main() {
  log.info('\n━━ CORRECTEUR D\'ESPACES MANQUANTS ━━\n');

  if (DRY_RUN) {
    log.warn('Mode DRY-RUN: aucune modification');
  }

  // Charger les erreurs
  let errors = [];
  try {
    const data = fs.readFileSync(ERRORS_FILE, 'utf-8');
    errors = JSON.parse(data);
  } catch (err) {
    log.error(`Impossible de charger: ${err.message}`);
    process.exit(1);
  }

  log.success(`${errors.length} erreurs chargées`);

  // Grouper par fichier
  const byFile = groupByFile(errors);
  log.success(`${Object.keys(byFile).length} fichiers à corriger\n`);

  // Corriger
  for (const [filePath, fileErrors] of Object.entries(byFile)) {
    const filename = path.basename(filePath);
    log.info(`► ${filename} (${fileErrors.length} erreurs)`);

    const result = correctFile(filePath, fileErrors);

    if (result.applied > 0) {
      log.success(`  ${result.applied} correction(s)`);
      if (result.corrections && result.corrections.length <= 5) {
        result.corrections.forEach(c => log.detail(`    • ${c}`));
      }
      stats.applied += result.applied;
    } else {
      stats.skipped++;
    }

    stats.processed++;
  }

  log.info(`\
━━ RÉSUMÉ ━━
  Fichiers: ${stats.processed}
  ✅ Corrigés: ${stats.applied}
  ⏭️  Sautés: ${stats.skipped}
  ${DRY_RUN ? '🔍 Mode: DRY-RUN' : '✏️  Mode: APPLY'}
  `);
}

main();
