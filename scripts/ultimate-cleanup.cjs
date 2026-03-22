#!/usr/bin/env node

/**
 * ULTIMATE SAFE CLEANUP - utilise des buffers et hex encoding
 * pour eviter l'auto-corruption
 */

const fs = require("fs");
const path = require("path");

// Force UTF-8
process.stdout.setEncoding("utf8");
process.stderr.setEncoding("utf8");

console.log("[ULTIMATE_CLEANUP] Nettoyage ultra-securise\n");

const scriptDir = path.resolve(__dirname);

// Patterns en HEX pour eviter la corruption pendant la lecture
// Ã© = C3 A9 en UTF-8 mal decode
const fixPatternsHex = [
  { bad: Buffer.from([0xc3, 0xa9]), good: "e", name: "e avec accent" },
  { bad: Buffer.from([0xc3, 0xa2]), good: "a", name: "a avec accent" },
  { bad: Buffer.from([0xc3, 0xa8]), good: "e", name: "e grave" },
  { bad: Buffer.from([0xc3, 0xaa]), good: "e", name: "e circumflex" },
  { bad: Buffer.from([0xc3, 0xa7]), good: "c", name: "c cedille" },
  { bad: Buffer.from([0xc3, 0xa9]), good: "e", name: "e aigu" },
  { bad: Buffer.from([0xc2, 0xa0]), good: " ", name: "nbsp" },
];

const files = fs.readdirSync(scriptDir).filter((f) => /\.(cjs|mjs|js)$/.test(f));

let totalFixed = 0;
let skipped = 0;

for (const file of files) {
  const fullPath = path.join(scriptDir, file);

  try {
    // Lire en buffer binaire (pas de decoding)
    let buffer = fs.readFileSync(fullPath);
    let changed = false;
    let changeCount = 0;

    // Remplacer par pattern en hex
    for (const { bad, good } of fixPatternsHex) {
      let index = 0;
      let newBuffer = Buffer.alloc(0);

      while (index < buffer.length) {
        const found = buffer.indexOf(bad, index);

        if (found === -1) {
          newBuffer = Buffer.concat([newBuffer, buffer.slice(index)]);
          break;
        } else {
          newBuffer = Buffer.concat([
            newBuffer,
            buffer.slice(index, found),
            Buffer.from(good, "utf8"),
          ]);
          changeCount++;
          changed = true;
          index = found + bad.length;
        }
      }

      buffer = newBuffer;
    }

    if (changed) {
      fs.writeFileSync(fullPath, buffer);
      console.log(`[FIX] ${file}`);
      console.log(`  -> ${changeCount} correction(s) appliquee(s)`);
      totalFixed += changeCount;
    } else {
      skipped++;
    }
  } catch (err) {
    console.error(`[ERROR] ${file} : ${err.message}`);
  }
}

console.log(`\n[DONE] ${totalFixed} correction(s) | ${skipped} fichier(s) clean\n`);
