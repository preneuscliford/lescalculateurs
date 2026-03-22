#!/usr/bin/env node

/**
 * AGGRESSIVE CLEANUP V2 - Patterns comprehen sifs de corruption UTF-8
 * Base sur les analyses reelles de bytes corrompus
 */

const fs = require("fs");
const path = require("path");

process.stdout.setEncoding("utf8");

console.log("[AGGRESSIVE_V2] Nettoyage ultra-agressif avec patterns etendus\n");

const scriptDir = path.resolve(__dirname);

// Patterns en HEX - UTF-8 mal decode a travers plusieurs couches
const corruptionPatterns = [
  // Accents mal decodes (UTF-8 BOM)
  { bad: Buffer.from([0xc3, 0xa9]), good: "e", name: "e" },
  { bad: Buffer.from([0xc3, 0xa0]), good: "a", name: "a" },
  { bad: Buffer.from([0xc3, 0xa8]), good: "e", name: "e" },
  { bad: Buffer.from([0xc3, 0xaa]), good: "e", name: "e" },
  { bad: Buffer.from([0xc3, 0xa7]), good: "c", name: "c" },
  { bad: Buffer.from([0xc3, 0xb9]), good: "u", name: "u" },
  { bad: Buffer.from([0xc3, 0xb4]), good: "o", name: "o" },
  { bad: Buffer.from([0xc3, 0xb2]), good: "o", name: "o" },
  { bad: Buffer.from([0xc3, 0xac]), good: "i", name: "i" },

  // Unicode quotes mal decod es (UTF-8 + UTF-16)
  { bad: Buffer.from([0xe2, 0x80, 0x99]), good: "'", name: "'" }, // U+2019
  { bad: Buffer.from([0xe2, 0x80, 0x98]), good: "'", name: "'" }, // U+2018
  { bad: Buffer.from([0xe2, 0x80, 0x9c]), good: '"', name: '"' }, // U+201C
  { bad: Buffer.from([0xe2, 0x80, 0x9d]), good: '"', name: '"' }, // U+201D
  { bad: Buffer.from([0xe2, 0x80, 0x93]), good: "-", name: "-" }, // U+2013
  { bad: Buffer.from([0xe2, 0x80, 0x94]), good: "-", name: "-" }, // U+2014

  // Double-decoding patterns
  { bad: Buffer.from([0xc3, 0x89]), good: "E", name: "E" },
  { bad: Buffer.from([0xc3, 0x80]), good: "A", name: "A" },

  // Nbsp et espaces bizarres
  { bad: Buffer.from([0xc2, 0xa0]), good: " ", name: "nbsp" },
  { bad: Buffer.from([0xc2, 0xab]), good: '"', name: "left-guillemet" },
  { bad: Buffer.from([0xc2, 0xbb]), good: '"', name: "right-guillemet" },

  // BOM sequences
  { bad: Buffer.from([0xef, 0xbb, 0xbf]), good: "", name: "BOM" },

  // Caracteres de controle bizarres
  { bad: Buffer.from([0xef, 0xbf, 0xbd]), good: "?", name: "REPLACEMENT CHAR" },
];

const files = fs.readdirSync(scriptDir).filter((f) => /\.(cjs|mjs|js)$/.test(f));

let totalFixed = 0;
let filesFixed = 0;

for (const file of files) {
  const fullPath = path.join(scriptDir, file);

  try {
    let buffer = fs.readFileSync(fullPath);
    let changed = false;
    let fileFixCount = 0;

    // Appliquer chaque pattern de nettoyage
    for (const pattern of corruptionPatterns) {
      let index = 0;
      let newBuffer = Buffer.alloc(0);

      while (index < buffer.length) {
        const found = buffer.indexOf(pattern.bad, index);

        if (found === -1) {
          newBuffer = Buffer.concat([newBuffer, buffer.slice(index)]);
          break;
        } else {
          newBuffer = Buffer.concat([
            newBuffer,
            buffer.slice(index, found),
            Buffer.from(pattern.good, "utf8"),
          ]);
          fileFixCount++;
          totalFixed++;
          changed = true;
          index = found + pattern.bad.length;
        }
      }

      buffer = newBuffer;
    }

    if (changed && fileFixCount > 0) {
      fs.writeFileSync(fullPath, buffer);
      console.log(`[FIX] ${file} : ${fileFixCount} corrections`);
      filesFixed++;
    }
  } catch (err) {
    console.error(`[ERROR] ${file} : ${err.message}`);
  }
}

console.log(`\n[DONE] ${filesFixed} fichier(s) fixed | ${totalFixed} total corrections\n`);
