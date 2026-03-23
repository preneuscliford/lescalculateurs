#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REPORT_FILE = path.join(__dirname, '..', 'french-errors-report.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'french-errors-smart-filtered.json');

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

// Règles TROP BRUYANTES à ignorer complètement
const IGNORED_RULES = new Set([
  'WHITESPACE_RULE',           // Trop de faux positifs sur les espaces
  'FR_SPELLING_RULE',           // Détecte mal les mots français
  'FRENCH_WORD_REPEAT_RULE',    // Trop agressif
  'UPPERCASE_SENTENCE_START',   // Manque contexte HTML
  'TYPO_RULE',                  // Trop bruyant
  'MISSING_SPACE_BEFORE_PUNCTUATION'  // Faux positifs dans HTML
]);

// Contextes à ignorer (HTML, Scripts, JSON-LD, etc.)
const IGNORED_CONTEXTS = [
  /<script/i,
  /<style/i,
  /<meta/i,
  /\{["\']@/,  // JSON-LD
  /gtag\(/i,    // Google Analytics
  /href=/i,     // HTML attributes
  /src=/i,      // HTML attributes
  /class=/i,    // HTML attributes
  /id=/i,       // HTML attributes
  /data-/i,     // Data attributes
  /<img/i,      // Image tags
  /<a /i,       // Link tags
  /<button/i,   // Button tags
  /&[a-z]+;/i   // HTML entities
];

// Termes métier à ignorer (trop sensibles au contexte)
const BLACKLIST_TERMS = new Set([
  'APL', 'RSA', 'SMIC', 'CAF', 'MDPH',              // Allocations
  'IMPOT', 'REVENU', 'ALLOCATION', 'AIDE',          // Fiscalité
  'TAUX', 'MONTANT', 'CALCUL', 'SIMULATION',        // Calculs
  'SALAIRE', 'CHARGES', 'NOTAIRE', 'FRAIS',        // Métier
  'CREDIT', 'PRET', 'HYPOTHEQUE', 'ASSURANCE',      // Finance
  'ACHAT', 'VENTE', 'IMMOBILIER', 'BIEN',           // Immobilier
  '2024', '2025', '2026'                             // Années
]);

/**
 * Filtre les erreurs avec règles intelligentes
 */
function filterErrors(errors) {
  let filtered = [];

  for (const error of errors) {
    // ✓ Ignorer les règles trop bruyantes
    if (IGNORED_RULES.has(error.rule)) {
      continue;
    }

    // ✓ Ignorer les contextes HTML/Scripts
    if (IGNORED_CONTEXTS.some(regex => regex.test(error.context))) {
      continue;
    }

    // ✓ Ignorer si l'erreur est un mot métier sensible
    if (BLACKLIST_TERMS.has(error.error?.toUpperCase())) {
      continue;
    }

    // ✓ Ignorer si l'erreur est TROP longue (probablement un artefact)
    if (error.error && error.error.length > 80) {
      continue;
    }

    // ✓ Ignorer les erreurs sans suggestions
    if (!error.suggestions || error.suggestions.length === 0) {
      continue;
    }

    // ✓ Ignorer si le contexte contient des caractères bizarres
    if (error.context && /[Ã|â|ç|ñ|ü]/g.test(error.context)) {
      // Caractères d'un encodage corrompu
      continue;
    }

    // ✓ GARDER les erreurs valides!
    filtered.push(error);
  }

  return filtered;
}

/**
 * Analyse les résultats filtrés
 */
function analyzeFiltered(errors) {
  const byRule = {};
  const byFile = {};

  for (const error of errors) {
    // Compter par règle
    byRule[error.rule] = (byRule[error.rule] || 0) + 1;

    // Compter par fichier
    const filename = error.file.split('\\').pop();
    byFile[filename] = (byFile[filename] || 0) + 1;
  }

  return { byRule, byFile };
}

/**
 * Point d'entrée
 */
async function main() {
  log.info('\n━━ FILTRE INTELLIGENT D\'ERREURS FRANÇAISES ━━\n');

  // Charger les erreurs brutes
  log.info('Chargement du rapport complet...');
  let errors = [];
  try {
    const data = fs.readFileSync(REPORT_FILE, 'utf-8');
    errors = JSON.parse(data);
  } catch (err) {
    log.error(`Impossible de charger: ${err.message}`);
    process.exit(1);
  }

  log.success(`${errors.length} erreurs dans le rapport brut`);

  // Filtrer
  log.info('\nApplication du filtre intelligent...');
  const filtered = filterErrors(errors);

  log.success(`${filtered.length} erreurs conservées après filtrage\n`);

  // Analyser
  const { byRule, byFile } = analyzeFiltered(filtered);

  log.info('📈 Erreurs par règle:');
  Object.entries(byRule)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([rule, count]) => {
      log.detail(`  ${rule}: ${count}`);
    });

  log.info('\n📄 Top fichiers affectés:');
  Object.entries(byFile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([file, count]) => {
      log.detail(`  ${file}: ${count}`);
    });

  // Sauvegarder
  log.info('\n✨ Sauvegarde du résultat...');
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    log.success(`Rapport sauvegardé: ${OUTPUT_FILE}`);
  } catch (err) {
    log.error(`Impossible de sauvegarder: ${err.message}`);
    process.exit(1);
  }

  log.info(`\n📊 Résumé:
  ✓ Entrée: ${errors.length} erreurs
  ✓ Sortie: ${filtered.length} erreurs
  ✓ Filtrage: ${(100 - (filtered.length / errors.length * 100)).toFixed(1)}% éliminé
  `);
}

main().catch(err => {
  log.error(`Erreur: ${err.message}`);
  process.exit(1);
});
