/**
 * QA Simulateurs Audit 2026
 * Script d'audit complet des simulateurs YMYL
 * Génère un rapport CSV et les patches de correction
 */

const fs = require('fs');
const path = require('path');

// Structure du rapport
const reportLines = [
  'fichier,ligne,type_erreur,gravite,description,valeur_fausse,valeur_attendue,source_officielle,action_recommandee'
];

// Compteurs
const stats = {
  critique: 0,
  majeur: 0,
  minor: 0,
  patches: 0
};

// Dossier des patches
const PATCHES_DIR = './patches';
if (!fs.existsSync(PATCHES_DIR)) {
  fs.mkdirSync(PATCHES_DIR, { recursive: true });
}

// ==========================================
// FONCTIONS D'ANALYSE
// ==========================================

function addError(file, line, type, gravite, desc, faux, attendu, source, action) {
  reportLines.push([
    file,
    line,
    type,
    gravite,
    `"${desc}"`,
    `"${faux}"`,
    `"${attendu}"`,
    `"${source}"`,
    `"${action}"`
  ].join(','));
  
  stats[gravite.toLowerCase()]++;
}

function createPatch(filename, content) {
  const patchPath = path.join(PATCHES_DIR, filename);
  fs.writeFileSync(patchPath, content, 'utf-8');
  stats.patches++;
  return patchPath;
}

// ==========================================
// AUDIT 1: Barèmes JSON
// ==========================================

function auditBaremesJSON() {
  console.log('🔍 Audit de src/data/baremes.json...');
  
  const content = fs.readFileSync('src/data/baremes.json', 'utf-8');
  const data = JSON.parse(content);
  
  // ERREUR CRITIQUE: Année impôt 2025 au lieu de 2026
  if (data.impot?.annee === 2025) {
    addError(
      'src/data/baremes.json',
      854,
      'BARME',
      'CRITIQUE',
      'Barème impôt sur le revenu en 2025 au lieu de 2026',
      '2025',
      '2026',
      'https://www.impots.gouv.fr',
      'Mettre à jour annee: 2026 et vérifier les tranches'
    );
    
    // Patch
    const patched = content.replace('"annee": 2025', '"annee": 2026');
    createPatch('baremes.json_fix.json', patched);
  }
  
  // ERREUR MAJEURE: APL version 2025
  if (data.apl?.version === "2025") {
    addError(
      'src/data/baremes.json',
      886,
      'BARME',
      'MAJEUR',
      'Version APL 2025 potentiellement obsolète',
      '"2025"',
      '"2026"',
      'https://www.caf.fr',
      'Vérifier et mettre à jour les plafonds APL 2026'
    );
  }
  
  // ERREUR MAJEURE: Indemnités kilométriques uniquement 2024
  if (data.indemnites_kilometriques?.voiture?.["2024"] && !data.indemnites_kilometriques?.voiture?.["2025"]) {
    addError(
      'src/data/baremes.json',
      659,
      'BARME',
      'MAJEUR',
      'Barème indemnités kilométriques uniquement en 2024, pas de données 2025/2026',
      'Uniquement 2024',
      '2024 + 2025 + 2026',
      'https://www.impots.gouv.fr',
      'Ajouter les barèmes IK 2025 et 2026 (généralement identiques à 2024)'
    );
  }
  
  // ERREUR MAJEURE: Incohérence taux DMTO
  const dmto73 = data.dmto?.["73"];
  if (dmto73 && dmto73 !== 6.32) {
    addError(
      'src/data/baremes.json',
      'N/A',
      'BARME',
      'MAJEUR',
      `Taux DMTO département 73 incohérent: ${dmto73}%`,
      `${dmto73}%`,
      '6.32%',
      'https://www.impots.gouv.fr',
      'Corriger le taux DMTO du département 73 à 6.32%'
    );
  }
}

// ==========================================
// AUDIT 2: Baremes Generated JSON
// ==========================================

function auditBaremesGenerated() {
  console.log('🔍 Audit de src/data/baremes.generated.json...');
  
  const content = fs.readFileSync('src/data/baremes.generated.json', 'utf-8');
  const data = JSON.parse(content);
  
  // ERREUR CRITIQUE: Taux DMTO département 73 à 4% au lieu de 6.32%
  const dept73 = data.notaire?.droits_mutation?.ancien?.par_departement?.["73"];
  if (dept73 && dept73.taux === 0.04) {
    addError(
      'src/data/baremes.generated.json',
      324,
      'CALCUL',
      'CRITIQUE',
      'Taux DMTO département 73 (Savoie) incorrect: 4% au lieu de 6.32%',
      '0.04 (4%)',
      '0.0632 (6.32%)',
      'https://www.impots.gouv.fr/sites/default/files/media/1_metier/3_partenaire/notaires/nid_11316_dmto_2026-01-01.pdf',
      'Corriger le taux à 0.0632 pour le département 73'
    );
    
    // Patch
    const patched = content.replace('"73": {\n            "taux": 0.04', '"73": {\n            "taux": 0.0632');
    createPatch('baremes.generated.json_fix.json', patched);
  }
  
  // ERREUR MAJEURE: Overrides 92, 93, 94 à 6.3% vs 5% standard
  const overrides = data.notaire?.droits_mutation?.ancien?.overrides;
  if (overrides) {
    for (const dept of ['92', '93', '94']) {
      if (overrides[dept] && overrides[dept] !== 0.05) {
        addError(
          'src/data/baremes.generated.json',
          128,
          'BARME',
          'MAJEUR',
          `Taux DMTO département ${dept} (Petite Couronne) incohérent avec barème général`,
          `${overrides[dept]}`,
          '0.05 (standard)',
          'https://www.impots.gouv.fr',
          `Vérifier si le département ${dept} doit avoir un taux spécifique ou standard`
        );
      }
    }
  }
  
  // ERREUR MAJEURE: Incohérence entre droitsMutation et droits_mutation
  const dmtoStandard = data.notaire?.droitsMutation?.standard;
  const dmtoAncien = data.notaire?.droits_mutation?.ancien?.fallback?.taux;
  
  if (dmtoStandard && dmtoAncien && Math.abs(dmtoStandard - dmtoAncien) > 0.001) {
    addError(
      'src/data/baremes.generated.json',
      'N/A',
      'BARME',
      'MAJEUR',
      'Incohérence entre droitsMutation.standard et droits_mutation.ancien.fallback',
      `droitsMutation.standard=${dmtoStandard}, droits_mutation.ancien.fallback=${dmtoAncien}`,
      'Valeurs identiques attendues',
      'N/A',
      'Unifier les deux structures de données DMTO'
    );
  }
}

// ==========================================
// AUDIT 3: Frais 2025 JSON (nom fichier)
// ==========================================

function auditFrais2025() {
  console.log('🔍 Audit de src/data/frais2025.json...');
  
  // ERREUR MAJEURE: Nom de fichier contient 2025 mais doit être 2026
  addError(
    'src/data/frais2025.json',
    'N/A',
    'SOURCE',
    'MAJEUR',
    'Nom de fichier obsolète: frais2025.json au lieu de frais2026.json',
    'frais2025.json',
    'frais2026.json',
    'N/A',
    'Renommer le fichier et mettre à jour toutes les références'
  );
  
  // Vérifier cohérence avec NOTAIRE_2026
  const content = fs.readFileSync('src/data/frais2025.json', 'utf-8');
  const data = JSON.parse(content);
  
  // Taux DMTO département 73
  const dmto73 = data.dmto?.["73"];
  if (dmto73 && dmto73 !== 6.32) {
    addError(
      'src/data/frais2025.json',
      'N/A',
      'CALCUL',
      'CRITIQUE',
      'Taux DMTO département 73 incohérent avec NOTAIRE_2026',
      `${dmto73}%`,
      '6.32%',
      'https://www.impots.gouv.fr',
      'Corriger le taux à 6.32%'
    );
  }
}

// ==========================================
// AUDIT 4: Moteurs de calcul
// ==========================================

function auditMoteursCalcul() {
  console.log('🔍 Audit des moteurs de calcul...');
  
  // Vérifier RSA
  const rsaContent = fs.readFileSync('src/utils/rsaCalculEngine.ts', 'utf-8');
  
  // Vérifier si montants RSA sont à jour 2026
  if (rsaContent.includes('607.75') && rsaContent.includes('911.625')) {
    // Ces montants semblent corrects pour 2026, mais vérifions
    console.log('  ✓ Montants RSA présents');
  }
  
  // ERREUR MINOR: Pas de validation de date pour les montants
  if (!rsaContent.includes('2026') && !rsaContent.includes('annee')) {
    addError(
      'src/utils/rsaCalculEngine.ts',
      'N/A',
      'SOURCE',
      'MINOR',
      'Moteur RSA sans référence explicite à l\'année 2026',
      'Sans référence année',
      'Commentaire ou constante avec année de référence',
      'N/A',
      'Ajouter un commentaire avec la date de validité des montants'
    );
  }
  
  // Vérifier IR
  const irContent = fs.readFileSync('src/utils/irCalculEngine.ts', 'utf-8');
  
  // Vérifier barème IR 2026
  if (irContent.includes('baremeIR2026')) {
    const match = irContent.match(/baremeIR2026[\s\S]*?plafond:\s*(\d+)/);
    if (match && match[1] === '11497') {
      console.log('  ✓ Barème IR 2026 détecté (tranche 1: 11,497€)');
    }
  }
  
  // ERREUR MAJEURE: Barème IR 2026 vs données dans baremes.json
  const baremesContent = fs.readFileSync('src/data/baremes.json', 'utf-8');
  const baremesData = JSON.parse(baremesContent);
  
  if (baremesData.impot?.tranches?.[0]?.plafond === 11294) {
    addError(
      'src/data/baremes.json',
      857,
      'BARME',
      'MAJEUR',
      'Barème IR 2026 incorrect: première tranche à 11,294€ au lieu de 11,497€',
      '11,294€',
      '11,497€',
      'https://www.impots.gouv.fr',
      'Mettre à jour les tranches IR selon barème officiel 2026'
    );
  }
}

// ==========================================
// AUDIT 5: Pages HTML
// ==========================================

function auditPagesHTML() {
  console.log('🔍 Audit des pages HTML...');
  
  const pagesDir = 'src/pages';
  const files = fs.readdirSync(pagesDir, { recursive: true });
  
  let filesWith2025 = 0;
  
  for (const file of files) {
    if (typeof file === 'string' && file.endsWith('.html')) {
      const filePath = path.join(pagesDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Compter les références à 2025
        const matches = content.match(/2025/g);
        if (matches && matches.length > 5) {
          filesWith2025++;
          
          if (filesWith2025 <= 3) { // Limiter le nombre d'erreurs rapportées
            addError(
              `src/pages/${file}`,
              'N/A',
              'AFFICHAGE',
              'MINOR',
              `Page contenant ${matches.length} références à "2025" au lieu de "2026"`,
              '2025',
              '2026',
              'N/A',
              'Remplacer les références 2025 par 2026 où applicable'
            );
          }
        }
      } catch (e) {
        // Ignorer les erreurs de lecture
      }
    }
  }
  
  if (filesWith2025 > 3) {
    addError(
      'src/pages/*.html',
      'N/A',
      'AFFICHAGE',
      'MINOR',
      `${filesWith2025} pages contiennent des références obsolètes à 2025`,
      'Multiple 2025',
      '2026',
      'N/A',
      'Lancer un replace global 2025->2026 sur les pages concernées'
    );
  }
}

// ==========================================
// AUDIT 6: Notaire Baremes 2026
// ==========================================

function auditNotaireBaremes() {
  console.log('🔍 Audit de src/data/notaire.baremes.2026.js...');
  
  const content = fs.readFileSync('src/data/notaire.baremes.2026.js', 'utf-8');
  
  // Vérifier cohérence des taux
  const checks = [
    { pattern: /reduit:\s*0\.0509/, expected: '0.0509', desc: 'Taux réduit' },
    { pattern: /standard:\s*0\.058/, expected: '0.058', desc: 'Taux standard' },
    { pattern: /majore:\s*0\.0632/, expected: '0.0632', desc: 'Taux majoré' },
    { pattern: /droits:\s*0\.00715/, expected: '0.00715', desc: 'Taux neuf' },
  ];
  
  for (const check of checks) {
    if (!check.pattern.test(content)) {
      addError(
        'src/data/notaire.baremes.2026.js',
        'N/A',
        'BARME',
        'MAJEUR',
        `Taux DMTO ${check.desc} potentiellement incorrect`,
        'Non détecté ou différent',
        check.expected,
        'https://www.impots.gouv.fr',
        'Vérifier et corriger le taux dans NOTAIRE_2026'
      );
    }
  }
}

// ==========================================
// MAIN
// ==========================================

console.log('🚀 Démarrage de l\'audit QA Simulateurs 2026...\n');

auditBaremesJSON();
auditBaremesGenerated();
auditFrais2025();
auditMoteursCalcul();
auditPagesHTML();
auditNotaireBaremes();

// Écrire le rapport
fs.writeFileSync('QA_SIMULATEURS_2026.csv', reportLines.join('\n'), 'utf-8');

// Récapitulatif
console.log('\n' + '='.repeat(70));
console.log('📊 RÉCAPITULATIF QA SIMULATEURS 2026');
console.log('='.repeat(70));
console.log(`Erreurs CRITIQUES: ${stats.critique}`);
console.log(`Erreurs MAJEURES:  ${stats.majeur}`);
console.log(`Erreurs MINEURES:  ${stats.minor}`);
console.log(`Patches générés:   ${stats.patches}`);
console.log(`\n📁 Fichiers générés:`);
console.log(`  - QA_SIMULATEURS_2026.csv`);
console.log(`  - ${PATCHES_DIR}/ (contient les patches)`);
console.log('\n3 lignes-clés du CSV:');
console.log(reportLines.slice(0, 4).join('\n'));
console.log('\n✅ Audit terminé !');
