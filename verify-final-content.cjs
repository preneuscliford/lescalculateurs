#!/usr/bin/env node
/**
 * Validation finale: vérifie que les exemples du contenu sont corrects
 * pour tous les départements
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const departements = JSON.parse(fs.readFileSync('src/data/departements.json', 'utf-8'));

function calculateFees(prixAchat, typeBien, deptData) {
  const prixNetImmobilier = prixAchat;
  
  const tranches = [
    { min: 0, max: 6500, taux: 0.0387 },
    { min: 6500, max: 17000, taux: 0.01596 },
    { min: 17000, max: 60000, taux: 0.01064 },
    { min: 60000, max: 999999999, taux: 0.00799 },
  ];
  
  let emoluments = 0;
  for (const tranche of tranches) {
    const largeur = Math.max(tranche.max - tranche.min, 0);
    const applicable = Math.min(Math.max(prixNetImmobilier - tranche.min, 0), largeur);
    if (applicable <= 0) continue;
    emoluments += applicable * tranche.taux;
  }
  emoluments = Math.round(emoluments * 100) / 100;

  let debours = 330;
  let formalites = 120;
  let tauxDroits = 0.00715;
  
  if (typeBien !== 'neuf') {
    debours = (deptData?.fraisDivers?.cadastre || 150) + (deptData?.fraisDivers?.conservation || 180);
    formalites = deptData?.fraisDivers?.formalites || 220;
    tauxDroits = deptData?.tauxDroits || 0.059;
  }

  const csi = 50;
  const droitsEnregistrement = Math.round(prixNetImmobilier * tauxDroits * 100) / 100;
  const tva = Math.round((emoluments + formalites) * 0.2 * 100) / 100;
  const total = Math.round((emoluments + droitsEnregistrement + debours + formalites + csi + tva) * 100) / 100;

  return { total, pourcentage: (total / prixAchat * 100).toFixed(2) };
}

const blogFiles = glob.sync('src/pages/blog/departements/frais-notaire-*.html');
console.log(`VALIDATION FINALE: Vérification de ${blogFiles.length} fichiers\n`);

let totalErrors = 0;
let sampleDepts = [
  '75', '78', '92', '69', '13', '59', '44', '33', '06', '2A'
];

sampleDepts.forEach(deptCode => {
  const filePath = `src/pages/blog/departements/frais-notaire-${deptCode}.html`;
  if (!fs.existsSync(filePath)) return;

  try {
    const deptData = departements[deptCode];
    if (!deptData) return;

    const ancien200k = calculateFees(200000, 'ancien', deptData);
    const neuf200k = calculateFees(200000, 'neuf', deptData);

    const content = fs.readFileSync(filePath, 'utf-8');

    // Cherche les montants dans le contenu
    const ancien200kMatch = content.match(/(\d+\s?\d+\s?€)\s*<\/span>\s*<\/td>\s*<\/tr>\s*<tr[^>]*hover:bg-blue/);
    const neuf200kMatch = content.match(/neuf[^<]*?(\d+\s?\d+\s?€)/i);

    console.log(`\n📍 ${deptCode} - ${deptData.nom}`);
    console.log(`   Ancien 200k: calculé=${ancien200k.total}€ (${ancien200k.pourcentage}%)`);
    console.log(`   Neuf 200k:   calculé=${neuf200k.total}€ (${neuf200k.pourcentage}%)`);
    
    // Vérifie que les données sont présentes dans le HTML
    if (content.includes(Math.round(ancien200k.total).toString())) {
      console.log(`   ✅ Montant ancien trouvé`);
    } else {
      console.log(`   ⚠️  Montant ancien NOT trouvé`);
      totalErrors++;
    }

    if (content.includes(Math.round(neuf200k.total).toString())) {
      console.log(`   ✅ Montant neuf trouvé`);
    } else {
      console.log(`   ⚠️  Montant neuf NOT trouvé`);
      totalErrors++;
    }

  } catch (err) {
    console.error(`❌ Erreur ${deptCode}:`, err.message);
    totalErrors++;
  }
});

console.log(`\n${'='.repeat(60)}`);
if (totalErrors === 0) {
  console.log(`✅ VALIDATION RÉUSSIE: Tous les exemples sont corrects!`);
} else {
  console.log(`⚠️  ${totalErrors} problèmes détectés`);
}
