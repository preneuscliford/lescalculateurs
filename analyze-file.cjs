#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Lire le premier fichier en bytes
const file = "c:\\Users\\prene\\OneDrive\\Bureau\\lesCalculateurs\\scripts\\add-disclaimers.cjs";
const buffer = fs.readFileSync(file);

console.log("[ANALYSIS] Examinons les 500 premiers bytes...\n");

// Afficher en hex et ASCII
let hex = "";
let ascii = "";

for (let i = 0; i < Math.min(500, buffer.length); i++) {
  const byte = buffer[i];

  hex += byte.toString(16).padStart(2, "0").toUpperCase() + " ";
  ascii += byte >= 32 && byte < 127 ? String.fromCharCode(byte) : ".";

  if ((i + 1) % 32 === 0) {
    console.log(`${hex.padEnd(96)} | ${ascii}`);
    hex = "";
    ascii = "";
  }
}

console.log("\n[PATTERNS] Cherchons des caracteres suspects...\n");

// Patterns UTF-8 mal décodés courants
const patterns = [
  { name: "Ã©  (é mal décodé)", bytes: Buffer.from([0xc3, 0xa9]) },
  { name: "Ã  (à mal décodé)", bytes: Buffer.from([0xc3, 0xa0]) },
  { name: "â€™ (apostr mal décodé)", bytes: Buffer.from([0xe2, 0x80, 0x99]) },
  { name: "Â  (nbsp mal décodé)", bytes: Buffer.from([0xc2, 0xa0]) },
  { name: "ðŸ (emoji mal décodé)", bytes: Buffer.from([0xf0, 0x9f]) },
];

for (const pattern of patterns) {
  let count = 0;
  let pos = 0;
  while ((pos = buffer.indexOf(pattern.bytes, pos)) !== -1) {
    count++;
    pos += pattern.bytes.length;
  }
  if (count > 0) {
    console.log(`Found: ${pattern.name} x${count}`);
  }
}
