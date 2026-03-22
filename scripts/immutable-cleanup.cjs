#!/usr/bin/env node

/**
 * IMMUTABLE CLEANUP - Prote ge contre l'auto-corruption
 * Utilise uniquement des buffers et jamais de strings cote patterns
 */

const fs = require("fs");
const path = require("path");

process.stdout.setEncoding("utf8");

const scriptDir = path.dirname(__filename);

console.log("[IMMUTABLE_CLEANUP] Version ultra-sûre\n");

// ALL corruption patterns definis en bytes uniquement - JAMAIS en strings
const patterns = [
  [0xc3, 0xa9],
  "e", // e
  [0xc3, 0xa0],
  "a", // a
  [0xc3, 0xa8],
  "e", // e
  [0xc3, 0xaa],
  "e", // e
  [0xc3, 0xa7],
  "c", // c
  [0xc3, 0xb9],
  "u", // u
  [0xc3, 0xb4],
  "o", // o
  [0xc3, 0xb2],
  "o", // o
  [0xc3, 0xac],
  "i", // i
  [0xc3, 0x89],
  "E", // E
  [0xc3, 0x80],
  "A", // A
  [0xc2, 0xa0],
  " ", // nbsp
  [0xc2, 0xab],
  '"', // "
  [0xc2, 0xbb],
  '"', // "
  [0xe2, 0x80, 0x99],
  "'", // '
  [0xe2, 0x80, 0x98],
  "'", // '
  [0xe2, 0x80, 0x9c],
  '"', // "
  [0xe2, 0x80, 0x9d],
  '"', // "
  [0xe2, 0x80, 0x93],
  "-", // -
  [0xe2, 0x80, 0x94],
  "-", // -
  [0xef, 0xbb, 0xbf],
  "", // BOM
  [0xef, 0xbf, 0xbd],
  "?", // REPLACEMENT CHAR
];

const files = fs
  .readdirSync(scriptDir)
  .filter((f) => /\.(cjs|mjs|js)$/.test(f) && f !== "immutable-cleanup.cjs");

let totalFixed = 0;
let filesFixed = 0;

for (const file of files) {
  const fullPath = path.join(scriptDir, file);

  try {
    let buffer = fs.readFileSync(fullPath);
    let initialSize = buffer.length;
    let fileFixCount = 0;

    // Appliquer chaque pattern - toujours via buffers
    for (let i = 0; i < patterns.length; i += 2) {
      const badBytes = patterns[i];
      const goodStr = patterns[i + 1];
      const badBuffer = Buffer.from(badBytes);
      const goodBuffer = Buffer.from(goodStr, "utf8");

      let pos = 0;
      let newBuffer = Buffer.alloc(0);

      while (pos < buffer.length) {
        const idx = buffer.indexOf(badBuffer, pos);
        if (idx === -1) {
          newBuffer = Buffer.concat([newBuffer, buffer.slice(pos)]);
          break;
        }
        newBuffer = Buffer.concat([newBuffer, buffer.slice(pos, idx), goodBuffer]);
        fileFixCount++;
        totalFixed++;
        pos = idx + badBuffer.length;
      }

      buffer = newBuffer;
    }

    if (fileFixCount > 0) {
      fs.writeFileSync(fullPath, buffer);
      console.log(`[OK] ${file} : +${fileFixCount}`);
      filesFixed++;
    }
  } catch (err) {
    console.error(`[ERROR] ${file}: ${err.message.substring(0, 50)}`);
  }
}

console.log(`\n[DONE] ${filesFixed}/${files.length} files | +${totalFixed} fixes\n`);
