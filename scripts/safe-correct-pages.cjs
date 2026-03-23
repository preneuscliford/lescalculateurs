#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

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

// Dictionnaire de CORRECTIONS SÛRES (Sans dépendre du rapport corrompu)
// Format: { rechercher: remplacer }
const SAFE_CORRECTIONS = {
  // Accents sur 'à' (A_ACCENT)
  "Jusqu'a": "Jusqu'à",
  "jusqu'a": "jusqu'à",
  "jusqu'A": "jusqu'à",
  "Jusqu'A": "Jusqu'à",
  "d'a": "d'à",
  
  // Accords sujet-verbe (ACCORD_SUJET_VERBE)
  "plafonnes": "plafonnés",
  "salaries": "salariés",
  "observes": "observés",
  
  // Accord adjectif (AGREEMENT_POSTPONED_ADJ)
  "net/brut": "nets/bruts",
  "un prêt": "une prêtes",
  
  // Autres accents
  "a cote": "à côté",
  "a": "à"  // RISQUÉ - seulement en contexte
};

// Pages prioritaires à corriger
const PRIORITY_FILES = [
  'content_SAFE/apl.html',
  'content_SAFE/pret.html',
  'content_SAFE/impot.html',
  'content_SAFE/prime-activite.html',
  'content_SAFE/rsa.html'
];

const stats = {
  filesProcessed: 0,
  correctionsApplied: 0,
  filesFailed: 0
};

/**
 * Sauvegarde le fichier
 */
function backupFile(filePath) {
  const backupPath = filePath + BACKUP_EXT;
  if (!fs.existsSync(backupPath)) {
    try {
      fs.copyFileSync(filePath, backupPath);
      log.detail(`✓ Sauvegarde: ${path.basename(backupPath)}`);
      return true;
    } catch (err) {
      log.error(`Sauvegarde échouée: ${err.message}`);
      return false;
    }
  }
  return true;
}

/**
 * Applique les corrections à un fichier
 */
function correctFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      log.error(`Fichier non trouvé: ${filePath}`);
      return { applied: 0, failed: 0 };
    }

    // Créer sauvegarde
    if (!DRY_RUN && !backupFile(filePath)) {
      return { applied: 0, failed: 0 };
    }

    // Lire
    let html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);

    let applied = 0;
    const corrections = [];

    // Appliquer corrections SÛRES uniquement
    for (const [search, replace] of Object.entries(SAFE_CORRECTIONS)) {
      // Vérifier que nous ne remplac pas accidentellement dans les attributs HTML
      const regex = new RegExp(`\\b${search}\\b`, 'g');
      
      if (html.includes(search)) {
        // Vérifier que ce n'est pas dans href/src/class/id
        const htmlWithoutAttrs = html.replace(/\s(href|src|class|id|data-\w+)="[^"]*"/g, '');
        
        if (htmlWithoutAttrs.includes(search)) {
          html = htmlWithoutAttrs.replace(regex, replace) + 
                  html.match(/\s(href|src|class|id|data-\w+)="[^"]*"/g)?.join('') || '';
          applied++;
          corrections.push(`${search} → ${replace}`);
        }
      }
    }

    // Écrire fichier (sans dry-run)
    if (!DRY_RUN && applied > 0) {
      try {
        fs.writeFileSync(filePath, html, 'utf-8');
      } catch (err) {
        log.error(`Écriture échouée: ${err.message}`);
        return { applied: 0, failed: 1 };
      }
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
  log.info('\n━━ CORRECTEUR FRANÇAIS - CORRECTIONS SÛRES ━━\n');

  if (DRY_RUN) {
    log.warn('Mode DRY-RUN: aucune modification');
  }

  log.info(`Corrections disponibles: ${Object.keys(SAFE_CORRECTIONS).length}`);
  log.info(`Pages à corriger: ${PRIORITY_FILES.length}\n`);

  // Corriger chaque page
  for (const filePath of PRIORITY_FILES) {
    const filename = path.basename(filePath);
    log.info(`► ${filename}`);

    const result = correctFile(filePath);

    if (result.applied > 0) {
      log.success(`  ${result.applied} correction(s)`);
      if (result.corrections) {
        result.corrections.forEach(c => log.detail(`    • ${c}`));
      }
      stats.correctionsApplied += result.applied;
    } else if (result.failed > 0) {
      log.error(`  Échec`);
      stats.filesFailed++;
    } else {
      log.info(`  Aucune correction nécessaire`);
    }

    stats.filesProcessed++;
  }

  // Résumé
  log.info(`\
━━ RÉSUMÉ ━━
📊 Fichiers traités: ${stats.filesProcessed}
✅ Corrections appliquées: ${stats.correctionsApplied}
❌ Fichiers échoués: ${stats.filesFailed}
${DRY_RUN ? '🔍 Mode: DRY-RUN' : '✏️  Mode: APPLY'}
  `);
}

main();
