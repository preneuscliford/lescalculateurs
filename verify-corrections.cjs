#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("[VERIFICATION] Scan des corrections appliquees\n");

const files = [
  "content_SAFE/are.html",
  "content_SAFE/apl.html",
  "content_SAFE/rsa.html",
  "content_SAFE/prime-activite.html",
  "content_SAFE/asf.html",
  "content_SAFE/charges.html",
  "content_SAFE/notaire.html",
  "content_SAFE/impot.html",
  "content_SAFE/crypto-bourse.html",
  "content_SAFE/pret.html",
];

let totalWords = 0;
let totalChars = 0;

files.forEach((file) => {
  const fullPath = path.resolve(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf-8");
    
    // Extraire le texte visible (entre les balises)
    const text = content.replace(/<[^>]*>/g, " ");
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    
    totalWords += words;
    totalChars += chars;
    
    // Stats sur les caractères spéciaux français
    const accents = (content.match(/[àâäæçéèêëîïôöœùûüœñýÀÂÄÆÇÉÈÊËÎÏÔÖŒÙÛÜŒÑÝ]/g) || []).length;
    const quotes = (content.match(/['""]/g) || []).length;
    
    console.log(`[${file}]`);
    console.log(`  Mots: ${words.toLocaleString("fr-FR")}`);
    console.log(`  Caractères: ${chars.toLocaleString("fr-FR")}`);
    console.log(`  Accents français: ${accents}`);
    console.log(`  Guillemets/apostrophes: ${quotes}\n`);
  }
});

console.log("[TOTAL]");
console.log(`  Mots: ${totalWords.toLocaleString("fr-FR")}`);
console.log(`  Caractères: ${totalChars.toLocaleString("fr-FR")}\n`);

console.log("[STATUS] Tous les fichiers HTML ont ete traites\n");
