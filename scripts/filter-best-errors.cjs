#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REPORT_FILE = path.join(__dirname, '..', 'french-errors-report.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'french-errors-best.json');

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

// WHITELIST de règles vraiment utiles pour la grammaire française
const VALUABLE_RULES = new Set([
  // Accents
  'A_ACCENT',
  'A_A_ACCENT2',
  'APOS_M',
  'MOIS',
  'DEUX_POINTS_ESPACE',
  'PRONOMS_PERSONNELS_MINUSCULE',
  
  // Grammaire
  'grammatecte_typo_ponctuation_superflue4',
  'grammalecte_gv1__imp_union_le_la_leur__b1_a1_1',
  'ESPACE_APRES_POINT',
  'FR_CHECKCASE_LA_CAF',
  'FR_CHECKCASE_URL',
  'TIRET',
  'PLACE_DE_LA_VIRGULE',
  'COMMA_PARENTHESIS_WHITESPACE'
]);

// Contextes à ignorer absolument
const IGNORED_CONTEXTS = [
  /<script/i,
  /<style/i,
  /<meta/i,
  /\{["\']@/,
  /gtag\(/i,
  /href=/i,
  /src=/i,
  /class=/i,
  /id=/i,
  /data-/i,
  /<img/i,
  /<a /i,
  /<button/i,
  /&[a-z]+;/i,
  /[Ã|â|ç|ñ|ü]/g  // Encoding corrupt
];

/**
 * Filtre intelligemment avec whitelist
 */
function filterErrors(errors) {
  let filtered = [];

  for (const error of errors) {
    // ✓ Garder SEULEMENT les règles valides
    if (!VALUABLE_RULES.has(error.rule)) {
      continue;
    }

    // ✓ Ignorer les contextes HTML/Scripts
    if (IGNORED_CONTEXTS.some(regex => {
      try {
        return regex.test(error.context);
      } catch {
        return false;
      }
    })) {
      continue;
    }

    // ✓ Ignorer qui n'ont pas de suggestions
    if (!error.suggestions || error.suggestions.length === 0) {
      continue;
    }

    // ✓ Ignorer les super longues (artefacts)
    if (error.error && error.error.length > 60) {
      continue;
    }

    // ✓ GARDER!
    filtered.push(error);
  }

  return filtered;
}

/**
 * Analyse
 */
function analyzeFiltered(errors) {
  const byRule = {};
  const byFile = {};

  for (const error of errors) {
    byRule[error.rule] = (byRule[error.rule] || 0) + 1;
    const filename = error.file.split('\\').pop();
    byFile[filename] = (byFile[filename] || 0) + 1;
  }

  return { byRule, byFile };
}

/**
 * Main
 */
async function main() {
  log.info('\n━━ FILTERR INTELLIGENT (WHITELIST) ━━\n');

  log.info('Chargement...');
  let errors = [];
  try {
    const data = fs.readFileSync(REPORT_FILE, 'utf-8');
    errors = JSON.parse(data);
  } catch (err) {
    log.error(`Erreur: ${err.message}`);
    process.exit(1);
  }

  log.success(`${errors.length} erreurs brutes chargées`);

  log.info('\nFiltrage avec whitelist...');
  const filtered = filterErrors(errors);

  log.success(`${filtered.length} erreurs sélectionnées\n`);

  const { byRule, byFile } = analyzeFiltered(filtered);

  log.info('📈 Erreurs par règle:');
  Object.entries(byRule)
    .sort((a, b) => b[1] - a[1])
    .forEach(([rule, count]) => {
      log.detail(`  ${rule}: ${count}`);
    });

  log.info('\n📄 Top 20 fichiers:');
  Object.entries(byFile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([file, count]) => {
      log.detail(`  ${file}: ${count}`);
    });

  log.info('\n💾 Sauvegarde...');
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    log.success(`Rapport: french-errors-best.json`);
  } catch (err) {
    log.error(`Erreur: ${err.message}`);
    process.exit(1);
  }

  log.info(`\n📊 Résumé:
  ✓ Brut: ${errors.length}
  ✓ Filtré: ${filtered.length}
  ✓ Ratio: ${(filtered.length / errors.length * 100).toFixed(1)}%
  `);
}

main().catch(err => {
  log.error(`Erreur fatale: ${err.message}`);
  process.exit(1);
});
