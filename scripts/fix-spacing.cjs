#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Patterns exacts à chercher (peuvent contenir du HTML)
const PATTERNS = [
  // Les + propriétaires (avec possible <strong> ou autre tag)
  { find: /Les<(\w+[^>]*)>propriétaires\s*occupants<\/\1>ne/g, replace: 'Les<$1>propriétaires occupants</$1> ne' },
  
  // Lespropriétaires (simple)
  { find: /\bLespropriétaires\b/g, replace: 'Les propriétaires' },
  { find: /\blespropriétaires\b/g, replace: 'les propriétaires' },
  
  // Caractéristiques
  { find: /\blescaractéristiques\b/g, replace: 'les caractéristiques' },
  { find: /\bLescaractéristiques\b/g, replace: 'Les caractéristiques' },
  
  // Votre + situation / ressources
  { find: /\bvotresituation\b/g, replace: 'votre situation' },
  { find: /\bVotresituation\b/g, replace: 'Votre situation' },
  { find: /\bvosressources\b/g, replace: 'vos ressources' },
  { find: /\bVosressources\b/g, replace: 'Vos ressources' },
  
  // Des ressources
  { find: /\bdesressources\b/g, replace: 'des ressources' },
  { find: /\bDesressources\b/g, replace: 'Des ressources' },
  { find: /\bdesressourcestransmises\b/g, replace: 'des ressources transmises' },
  { find: /\bDesressourcestransmises\b/g, replace: 'Des ressources transmises' },
  
  // Autres variations
  { find: /\bleshauts\b/g, replace: 'les hauts' },
  { find: /\bLeshauts\b/g, replace: 'Les hauts' },
  { find: /\blestranches\b/g, replace: 'les tranches' },
  { find: /\bLestranches\b/g, replace: 'Les tranches' },
  { find: /\blesréductions\b/g, replace: 'les réductions' },
  { find: /\bLesréductions\b/g, replace: 'Les réductions' },
  { find: /\bLesimulateur\b/g, replace: 'Les imulateur' },
  { find: /\blesimulateur\b/g, replace: 'les imulateur' },
  { find: /\bunesimulation\b/g, replace: 'une simulation' },
  { find: /\blesmontants\b/g, replace: 'les montants' },
  { find: /\bLesmontants\b/g, replace: 'Les montants' },
  { find: /\blesaides\b/g, replace: 'les aides' },
  { find: /\bLesaides\b/g, replace: 'Les aides' },
  { find: /\bLestravaux\b/g, replace: 'Les travaux' },
  { find: /\blestravaux\b/g, replace: 'les travaux' },
  { find: /\blestravailleurs\b/g, replace: 'les travailleurs' },
  { find: /\bLestravailleurs\b/g, replace: 'Les travailleurs' },
  { find: /\buneestimation\b/g, replace: 'une estimation' },
  { find: /\bunehausse\b/g, replace: 'une hausse' },
  { find: /\blescotisations\b/g, replace: 'les cotisations' },
  { find: /\bLescotisations\b/g, replace: 'Les cotisations' },
  { find: /\bLescadrescotisent\b/g, replace: 'Les cadrescotisent' },
  { find: /\blescadrescotisent\b/g, replace: 'les cadrescotisent' },
];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[36m',
};

/**
 * Traite un fichier HTML
 */
function processFile(filePath, dryRun) {
  try {
    if (!fs.existsSync(filePath)) return { applied: 0 };

    let html = fs.readFileSync(filePath, 'utf-8');
    const originalHtml = html;
    let totalMatches = 0;

    // Appliquer tous les patterns
    for (const { find, replace } of PATTERNS) {
      const matches = html.match(find);
      if (matches) {
        totalMatches += matches.length;
        html = html.replace(find, replace);
      }
    }

    if (totalMatches > 0 && !dryRun) {
      // Créer backup
      const backupPath = filePath + '.bak';
      if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, originalHtml, 'utf-8');
      }
      // Écrire le fichier
      fs.writeFileSync(filePath, html, 'utf-8');
    }

    return { applied: totalMatches };
  } catch (err) {
    return { applied: 0 };
  }
}

/**
 * Main
 */
function main() {
  const DRY_RUN = process.argv.includes('--dry-run');

  console.log(`\n${colors.blue}ℹ️${colors.reset}  ━━ CORRECTION ESPACES MANQUANTS ━━\n`);
  if (DRY_RUN) {
    console.log(`${colors.blue}ℹ️${colors.reset}  Mode DRY-RUN (pas de modifications)\n`);
  }

  const dirs = [
    path.join(__dirname, '..', 'content_SAFE'),
    path.join(__dirname, '..', 'src', 'pages')
  ];

  const correctedFiles = {};
  let totalApplied = 0;

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
        const result = processFile(itemPath, DRY_RUN);
        if (result.applied > 0) {
          correctedFiles[itemPath] = result.applied;
          totalApplied += result.applied;
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
  if (Object.keys(correctedFiles).length === 0) {
    console.log(`${colors.blue}ℹ️${colors.reset}  Aucune erreur trouvée\n`);
    return;
  }

  console.log(`${colors.green}✅${colors.reset} ${Object.keys(correctedFiles).length} fichiers, ${totalApplied} corrections\n`);

  console.log(`${colors.blue}ℹ️${colors.reset}  Fichiers corrigés:`);
  for (const [file, count] of Object.entries(correctedFiles).sort((a, b) => b[1] - a[1])) {
    const filename = path.relative(path.join(__dirname, '..'), file);
    console.log(`  ${filename}: ${count}`);
  }

  console.log();
}

main();
