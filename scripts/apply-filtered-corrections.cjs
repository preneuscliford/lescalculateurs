#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configuration
const ERRORS_FILE = process.argv.includes('--priority') 
  ? path.join(__dirname, '..', 'french-errors-priority.json')
  : path.join(__dirname, '..', 'french-errors-filtered.json');
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_EXT = '.bak';

// Couleurs pour le terminal
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
  section: (msg) => console.log(`\n${colors.blue}━━ ${msg} ━━${colors.reset}`),
  detail: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`)
};

// Statistiques
const stats = {
  filesProcessed: 0,
  correctionsApplied: 0,
  correctionsFailed: 0,
  filesWithErrors: 0
};

/**
 * Groupe les erreurs par fichier
 */
function groupErrorsByFile(errors) {
  return errors.reduce((acc, error) => {
    const file = error.file;
    if (!acc[file]) {
      acc[file] = [];
    }
    acc[file].push(error);
    return acc;
  }, {});
}

/**
 * Sauvegarde le fichier original
 */
function backupFile(filePath) {
  const backupPath = filePath + BACKUP_EXT;
  if (!fs.existsSync(backupPath)) {
    try {
      fs.copyFileSync(filePath, backupPath);
      log.detail(`Sauvegarde créée: ${path.basename(backupPath)}`);
      return true;
    } catch (err) {
      log.error(`Impossible de créer sauvegarde: ${err.message}`);
      return false;
    }
  }
  return true;
}

/**
 * Applique une correction à un nœud de texte
 * Cherche le texte exact avec l'erreur et le remplace par la suggestion
 */
function fixTextNode(text, error) {
  // Stratégie 1: Cherche l'erreur exact dans le texte
  const errorIndex = text.indexOf(error.error);
  
  if (errorIndex !== -1) {
    // Remplacer juste cette occurrence
    return (
      text.substring(0, errorIndex) +
      error.suggestions[0] +
      text.substring(errorIndex + error.error.length)
    );
  }
  
  // Stratégie 2: Chercher le contexte complet normalisé (ignorer les espaces multiples)
  const errorNormalized = error.error.trim();
  const textNormalized = text.replace(/\s+/g, ' ');
  
  if (textNormalized.includes(errorNormalized)) {
    // Remplacer la première occurrence en ignorant les espaces multiples
    return text.replace(new RegExp(errorNormalized.replace(/\s+/g, '\\s+')), error.suggestions[0]);
  }
  
  // Stratégie 3: Utiliser le contexte pour trouver et remplacer
  // (pour les cas où l'erreur est fragmentée)
  if (error.context && error.context.length > error.error.length) {
    const contextNormalized = error.context.replace(/\s+/g, ' ');
    const suggestionNormalized = error.suggestions[0].replace(/\s+/g, ' ');
    
    if (text.includes(error.context) || textNormalized.includes(contextNormalized)) {
      // Chercher et remplacer le mot clé dans le contexte
      const words = contextNormalized.split(' ').filter(w => w);
      
      // Chercher un mot du contexte qui est aussi dans le texte
      for (const word of words) {
        if (text.includes(word) && word.length > 2) {
          // Essayer de faire la substitution autour de ce mot
          const regex = new RegExp(word.replace(/\s+/g, '\\s+'));
          if (regex.test(text)) {
            return text.replace(regex, word);
          }
        }
      }
    }
  }
  
  return null;
}

/**
 * Applique les corrections à un fichier HTML
 */
function processFile(filePath, errors) {
  try {
    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      log.error(`Fichier non trouvé: ${filePath}`);
      return { applied: 0, failed: errors.length };
    }

    // Créer une sauvegarde
    if (!DRY_RUN && !backupFile(filePath)) {
      return { applied: 0, failed: errors.length };
    }

    // Charger le HTML
    let html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);

    let applied = 0;
    let failed = 0;

    // Résumé des corrections pour ce fichier
    const fileCorrections = [];

    for (const error of errors) {
      try {
        // Variables pour trouver et remplacer le texte
        let found = false;
        let replacement = error.suggestions[0];

        // Parcourir tous les nœuds de texte
        $('*').contents().each(function() {
          if (this.type === 'text' && !found) {
            const originalText = this.data;
            
            // Vérifier si l'erreur est dans ce nœud
            if (originalText.includes(error.error)) {
              // Appliquer la correction
              const newText = fixTextNode(originalText, error);
              
              if (newText !== null) {
                this.data = newText;
                found = true;
                fileCorrections.push({
                  error: error.error,
                  correction: replacement,
                  rule: error.rule
                });
              }
            }
          }
        });

        if (found) {
          applied++;
        } else {
          failed++;
          log.detail(`  ⚠️  ${error.error} → ${replacement} (NOT FOUND)`);
        }
      } catch (err) {
        failed++;
        log.detail(`  ❌ ${error.error}: ${err.message}`);
      }
    }

    // Écrire le fichier modifié (sauf en dry-run)
    if (!DRY_RUN) {
      try {
        const newHtml = $.html();
        
        // Validation basique: vérifier que le HTML n'est pas vide
        if (newHtml.length < 100) {
          log.error(`HTML corrompu (trop court): ${filePath}`);
          // Restaurer depuis la sauvegarde
          const backupPath = filePath + BACKUP_EXT;
          if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, filePath);
            log.detail(`Fichier restauré depuis sauvegarde`);
          }
          return { applied: 0, failed: errors.length };
        }

        fs.writeFileSync(filePath, newHtml, 'utf-8');
      } catch (err) {
        log.error(`Impossible d'écrire le fichier: ${err.message}`);
        return { applied: 0, failed: errors.length };
      }
    }

    return { applied, failed, corrections: fileCorrections };
  } catch (err) {
    log.error(`Erreur lors du traitement: ${err.message}`);
    return { applied: 0, failed: errors.length };
  }
}

/**
 * Charge les erreurs filtrées
 */
function loadErrors() {
  try {
    const data = fs.readFileSync(ERRORS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    log.error(`Impossible de charger l'erreur rapport: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Affiche un résumé des corrections
 */
function printSummary() {
  log.section('RÉSUMÉ');
  console.log(`
  📊 Fichiers traités: ${stats.filesProcessed}
  ✅ Corrections appliquées: ${stats.correctionsApplied}
  ❌ Corrections échouées: ${stats.correctionsFailed}
  📁 Fichiers avec erreurs: ${stats.filesWithErrors}
  
  Mode: ${DRY_RUN ? '🔍 DRY-RUN (aucune modification)' : '✏️  APPLY (fichiers modifiés)'}
  ${DRY_RUN ? '\n  💡 Exécutez sans --dry-run pour appliquer réellement les corrections' : '\n  ✨ Tous les fichiers ont été modifiés avec sauvegardes .bak'}
  `);
}

/**
 * Point d'entrée principal
 */
async function main() {
  log.section('CORRECTEUR DE GRAMMAIRE FRANÇAISE - PHASE APPLICATION');
  
  if (DRY_RUN) {
    log.warn('Mode DRY-RUN: aucun fichier ne sera modifié');
  }

  // Charger les erreurs
  const errors = loadErrors();
  if (errors.length === 0) {
    log.error('Aucune erreur à traiter');
    process.exit(1);
  }

  log.info(`\n${errors.length} erreurs à traiter`);

  // Grouper par fichier
  const errorsByFile = groupErrorsByFile(errors);
  stats.filesWithErrors = Object.keys(errorsByFile).length;

  log.info(`${stats.filesWithErrors} fichiers à corriger\n`);

  // Traiter chaque fichier
  for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
    stats.filesProcessed++;
    
    const shortPath = filePath.replace(/\\/g, '/').split('/').slice(-3).join('/');
    log.info(`[${stats.filesProcessed}/${stats.filesWithError}] ${shortPath} (${fileErrors.length} erreurs)`);

    const result = processFile(filePath, fileErrors);
    
    if (result.applied > 0) {
      log.success(`  ${result.applied} correction(s) appliquée(s)`);
      if (result.corrections) {
        result.corrections.forEach((c) => {
          log.detail(`    • ${c.error} → ${c.correction} [${c.rule}]`);
        });
      }
    }
    
    if (result.failed > 0) {
      log.warn(`  ${result.failed} correction(s) échouée(s)`);
    }

    stats.correctionsApplied += result.applied;
    stats.correctionsFailed += result.failed;
  }

  // Afficher le résumé
  printSummary();

  // Code de sortie
  if (stats.correctionsFailed === 0 && stats.correctionsApplied > 0) {
    process.exit(0);
  } else if (stats.correctionsApplied === 0) {
    process.exit(1);
  }
}

// Lancer le script
main().catch((err) => {
  log.error(`Erreur fatale: ${err.message}`);
  process.exit(1);
});
