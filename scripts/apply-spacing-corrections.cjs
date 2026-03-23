#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Erreurs manquelles trouvées et CONFIRMÉES (pas dans le JSON)
const CONFIRMED_ERRORS = [
  { error: 'Lespropriétaires', suggestion: 'Les propriétaires' },
  { error: 'lespropriétaires', suggestion: 'les propriétaires' },
  { error: 'lescaractéristiques', suggestion: 'les caractéristiques' },
  { error: 'Lescaractéristiques', suggestion: 'Les caractéristiques' },
  { error: 'leshauts', suggestion: 'les hauts' },
  { error: 'Leshauts', suggestion: 'Les hauts' },
  { error: 'lestranches', suggestion: 'les tranches' },
  { error: 'Lestranches', suggestion: 'Les tranches' },
  { error: 'lesréductions', suggestion: 'les réductions' },
  { error: 'Lesréductions', suggestion: 'Les réductions' },
  { error: 'Lesimulateur', suggestion: 'Les imulateur' },
  { error: 'lesimulateur', suggestion: 'les imulateur' },
  { error: 'unesimulation', suggestion: 'une simulation' },
  { error: 'lesmontants', suggestion: 'les montants' },
  { error: 'Lesmontants', suggestion: 'Les montants' },
  { error: 'lesaides', suggestion: 'les aides' },
  { error: 'Lesaides', suggestion: 'Les aides' },
  { error: 'Lestravaux', suggestion: 'Les travaux' },
  { error: 'lestravaux', suggestion: 'les travaux' },
  { error: 'lestravailleurs', suggestion: 'les travailleurs' },
  { error: 'Lestravailleurs', suggestion: 'Les travailleurs' },
  { error: 'desressources', suggestion: 'des ressources' },
  { error: 'Desressources', suggestion: 'Des ressources' },
  { error: 'uneestimation', suggestion: 'une estimation' },
  { error: 'unehausse', suggestion: 'une hausse' }
];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset}  ${msg}`),
};

/**
 * Applique les corrections
 */
function applyCorrections() {
  const DRY_RUN = process.argv.includes('--dry-run');
  
  log.info(`\n━━ CORRECTION D'ESPACES (mode: ${DRY_RUN ? 'DRY-RUN' : 'APPLY'}) ━━\n`);

  const dirs = [
    path.join(__dirname, '..', 'content_SAFE'),
    path.join(__dirname, '..', 'src', 'pages')
  ];

  const correctedFiles = {};
  
  function processFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) return [];

      let html = fs.readFileSync(filePath, 'utf-8');
      const originalHtml = html;
      let applied = 0;

      // Appliquer chaque correction
      for (const { error, suggestion } of CONFIRMED_ERRORS) {
        const regex = new RegExp(`\\b${error}\\b`, 'g');
        if (html.includes(error)) {
          const before = html;
          html = html.replace(regex, suggestion);
          if (html !== before) {
            applied++;
          }
        }
      }

      if (applied > 0) {
        if (!DRY_RUN) {
          // Créer backup
          const backupPath = filePath + '.bak';
          if (!fs.existsSync(backupPath)) {
            fs.writeFileSync(backupPath, originalHtml, 'utf-8');
          }
          // Écrire le fichier
          fs.writeFileSync(filePath, html, 'utf-8');
        }
        return applied;
      }

      return 0;
    } catch (err) {
      return 0;
    }
  }

  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const itemPath = path.join(dir, file);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        if (!file.startsWith('.') && !file.includes('node_modules')) {
          scanDir(itemPath);
        }
      } else if (file.endsWith('.html')) {
        const applied = processFile(itemPath);
        if (applied > 0) {
          correctedFiles[itemPath] = applied;
        }
      }
    }
  }

  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      scanDir(dir);
    }
  }

  // Résumé
  const totalApplied = Object.values(correctedFiles).reduce((a, b) => a + b, 0);
  log.success(`${Object.keys(correctedFiles).length} fichiers modifiés, ${totalApplied} corrections`);

  if (Object.keys(correctedFiles).length > 0) {
    log.info('\n📄 Fichiers corrigés:');
    for (const [file, count] of Object.entries(correctedFiles)) {
      const filename = path.relative(path.join(__dirname, '..'), file);
      console.log(`  ${filename}: ${count}`);
    }
  }
}

applyCorrections();
