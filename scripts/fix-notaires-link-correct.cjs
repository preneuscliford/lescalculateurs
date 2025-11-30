#!/usr/bin/env node
/**
 * Corriger le lien des barèmes notariaux avec le bon URL officiel
 */

const fs = require('fs');
const glob = require('glob');

const blogFiles = glob.sync('src/pages/blog/departements/frais-notaire-*.html');

console.log(`\n🔗 Correction du lien des barèmes notariaux\n`);

// Mauvais lien
const oldLink = 'https://www.notaires.fr/fr/actualites/les-tarifs-notariaux-2024-2025';
// Lien correct: Page principale des tarifs notariaux
const newLink = 'https://www.notaires.fr/fr/vous-etes-proprietaire-immobilier-ou-acquereur/le-role-du-notaire/les-tarifs-notariaux';

let updated = 0;

blogFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  
  if (content.includes(oldLink)) {
    const newContent = content.replace(new RegExp(oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newLink);
    fs.writeFileSync(file, newContent);
    updated++;
    console.log(`✅ ${file.split('\\').pop()}`);
  }
});

console.log(`\n${'─'.repeat(70)}`);
console.log(`✅ ${updated} fichiers corrigés`);
console.log(`\nAncien lien: ${oldLink}`);
console.log(`Nouveau lien: ${newLink}`);
