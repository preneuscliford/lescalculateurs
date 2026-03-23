#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mini dictionnaire des faux positifs courants
const FALSE_POSITIVES = new Set([
  // Mots en "des"
  'dessous', 'dessus', 'description', 'desactivee', 'desactive', 'descend', 'destroy', 'desordres', 'deservice',
  // Mots en "et"
  'etapes', 'etablissement', 'etudient', 'etatGeneral', 'Etudiant', 'etudiant', 'etabli', 'etudiants',
  // Mots en "par"
  'parametres', 'Parking', 'particulier', 'partements', 'participation', 'Particularité', 'parents', 'partagée', 'parentés',
  'partissent', 'parisienne', 'Parametre', 'Parametres', 'parseInt',
  // Mots en "ou"
  'outils', 'Outils', 'Oublier', 'outreâ', 'ou',
  // Mots en "ne"
  'nettement', 'neutre', 'nettoyer', 'nergie',
  // Mots en "un"
  'Uniquement', 'Unités',
  // Mots en "qu"
  'quilibrés', 'qualité', 'querySelector', 'question', 'que', 'qu',
  // Autres
  'surtout', 'surtaxe', 'Surtaxe', 'surcoût', 'Surcoût', 'surendettement', 'Survolez', 'sur',
  'nextElementSibling', 'LeSJRest', 'Negocier', 'Negociez', 'surCAFouestimateur',
  // Camel case
  'etatGeneral', 'DESACTIVE'
]);

// Chaque mot doit être au moins 5+ lettres et PAS dans FALSE_POSITIVES
function filterValidErrors(errors) {
  return errors.filter(err => {
    const combined = err.error.toLowerCase();
    
    // Exclure si dans la liste noire
    if (FALSE_POSITIVES.has(combined)) return false;
    
    // Exclure si  plus court que 8 lettres (trop petit pour être significatif)
    if (err.error.length < 8) return false;
    
    // Garder les cas CLAIRS: Les, les, Des, des + mot entier
    const word = err.word.toLowerCase();
    if (['les', 'des', 'lun', 'une'].includes(word)) {
      return true;
    }
    
    return false;
  });
}

function main() {
  const inputFile = path.join(__dirname, '..', 'spacing-real-errors.json');
  const outputFile = path.join(__dirname, '..', 'spacing-confirmed.json');
  
  let errors = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  
  console.log(`✅ ${errors.length} erreurs chargées`);
  
  const filtered = filterValidErrors(errors);
  
  console.log(`✅ ${filtered.length} erreurs après filtrage`);
  
  // Grouper par fichier
  const byFile = {};
  for (const err of filtered) {
    if (!byFile[err.file]) {
      byFile[err.file] = [];
    }
    byFile[err.file].push(err);
  }

  // Afficher top fichiers
  const topFiles = Object.entries(byFile)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20);

  console.log('\n📄 Erreurs confirmées par fichier:');
  for (const [file, errs] of topFiles) {
    const filename = path.relative(path.join(__dirname, '..'), file);
    console.log(`  ${filename}: ${errs.length}`);
    errs.forEach(e => {
      console.log(`    • "${e.error}" → "${e.suggestion}"`);
    });
  }

  // Sauver
  fs.writeFileSync(outputFile, JSON.stringify(filtered, null, 2));
  console.log(`\n✓ ${outputFile}`);
}

main();
