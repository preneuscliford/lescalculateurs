#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REPORT_FILE = path.join(__dirname, '..', 'french-errors-report.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'french-errors-priority.json');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset}  ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset}  ${msg}`),
};

// Pages À TRAFIC - à corriger en PRIORITÉ
const HIGH_PRIORITY_PAGES = new Set([
  'apl.html', 'are.html', 'asf.html', 'aah.html',
  'rsa.html', 'salaire.html', 'pret.html', 'notaire.html',
  'impot.html', 'taxe.html', 'charges.html', 'financement.html',
  'ik.html', 'prime-activite.html', 'ponts.html', 'sources.html',
  'simulateurs.html', 'travail.html', 'blog.html', 'a-propos.html',
  'methodologie.html', 'contact.html'
]);

// Règles sûres
const SAFE_RULES = new Set([
  'A_ACCENT', 'APOS_M', 'ACCORD_SUJET_VERBE', 
  'AGREEMENT_POSTPONED_ADJ', 'PLACE_ADJ'
]);

function filterPriority(errors) {
  let filtered = [];
  
  for (const error of errors) {
    // Garder SEULEMENT les règles sûres
    if (!SAFE_RULES.has(error.rule)) {
      continue;
    }

    // Garder SEULEMENT les pages prioritaires
    const filename = error.file.split('\\').pop();
    if (!HIGH_PRIORITY_PAGES.has(filename)) {
      continue;
    }

    // Ignorer contextes HTML
    if (/href=|src=|class=|id=|<script|<style|gtag/.test(error.context || '')) {
      continue;
    }

    // Ignorer sans suggestions
    if (!error.suggestions || error.suggestions.length === 0) {
      continue;
    }

    filtered.push(error);
  }

  return filtered;
}

function main() {
  log.info('\n━━ ERREURS PRIORITAIRES (PAGES À TRAFIC) ━━\n');

  // Charger
  log.info('Chargement...');
  let errors = [];
  try {
    const data = fs.readFileSync(REPORT_FILE, 'utf-8');
    errors = JSON.parse(data);
  } catch (err) {
    console.error(`Erreur: ${err.message}`);
    process.exit(1);
  }

  log.success(`${errors.length} erreurs brutes`);

  // Filtrer
  log.info('Filtrage prioritaires...');
  const filtered = filterPriority(errors);

  log.success(`${filtered.length} erreurs prioritaires\n`);

  // Analyser
  const byRule = {};
  const byFile = {};

  for (const e of filtered) {
    byRule[e.rule] = (byRule[e.rule] || 0) + 1;
    const f = e.file.split('\\').pop();
    byFile[f] = (byFile[f] || 0) + 1;
  }

  log.info('📊 Par règle:');
  Object.entries(byRule)
    .sort((a, b) => b[1] - a[1])
    .forEach(([r, c]) => {
      console.log(`   ${r}: ${c}`);
    });

  log.info('\n📄 Pages affectées:');
  Object.entries(byFile)
    .sort((a, b) => b[1] - a[1])
    .forEach(([f, c]) => {
      console.log(`   ${f}: ${c}`);
    });

  // Sauvegarder
  log.info('\n💾 Sauvegarde...');
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    log.success(`✓ french-errors-priority.json`);
  } catch (err) {
    console.error(`Erreur: ${err.message}`);
    process.exit(1);
  }
}

main();
