#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const file = "c:\\Users\\prene\\OneDrive\\Bureau\\lesCalculateurs\\content_SAFE\\are.html";
const buf = fs.readFileSync(file);
const str = buf.toString("utf8");

console.log("[DIAGNOSTIC] Fichier: are.html\n");
console.log("Taille: " + buf.length + " bytes");
console.log("Longueur string: " + str.length + " chars\n");

// Chercher des patterns suspects
const suspiciousPatterns = [
  [/é/g, "é (correct)"],
  [/[\xc3][\xa9]/g, "é (UTF-8 double-decode)"],
  [/[\u00c3][\u00a9]/g, "Ã© (Unicode)"],
  [/à/g, "à (correct)"],
  [/[\xc3][\xa0]/g, "à (UTF-8 double-decode)"],
  [/'/g, "' (right quote)"],
  [/[\xe2][\x80][\x99]/g, "' (Unicode right quote)"],
  [/ðŸ/g, "ðŸ (emoji corrupt)"],
];

console.log("Patterns détectés:");
suspiciousPatterns.forEach(([pattern, name]) => {
  const matches = (str.match(pattern) || []).length;
  if (matches > 0) {
    console.log(`  ${name}: ${matches}x`);
  }
});

// Afficher des extraits du début
console.log("\nPremiers 500 chars:");
console.log(str.substring(0, 500));
