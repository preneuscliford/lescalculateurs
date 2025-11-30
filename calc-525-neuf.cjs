#!/usr/bin/env node
/**
 * Calcule le montant neuf pour 525 000 € à Paris
 */

const fs = require('fs');
const departements = JSON.parse(fs.readFileSync('src/data/departements.json', 'utf-8'));

function calculateFees(prixAchat, typeBien = 'ancien', deptData) {
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

const deptData = departements['75'];

console.log('Paris 75 - Calculs pour 525 000 €:\n');

const ancien525 = calculateFees(525000, 'ancien', deptData);
const neuf525 = calculateFees(525000, 'neuf', deptData);

console.log(`Ancien: ${ancien525.total.toLocaleString('fr-FR')} € (${ancien525.pourcentage}%)`);
console.log(`Neuf:   ${neuf525.total.toLocaleString('fr-FR')} € (${neuf525.pourcentage}%)`);
console.log(`\nÉcart ancien → neuf: ${(ancien525.total - neuf525.total).toLocaleString('fr-FR')} €`);

console.log(`\n⚠️  Le contenu affiche: 9 545 €`);
console.log(`Correct: ${neuf525.total} €`);
console.log(`Écart: ${(neuf525.total - 9545).toLocaleString('fr-FR')} €`);
