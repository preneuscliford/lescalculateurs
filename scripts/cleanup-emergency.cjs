#!/usr/bin/env node

/**
 * EMERGENCY CLEANUP - Version ultra-sûre
 * Opere UNIQUEMENT sur des buffers binaires pour eviter toute auto-corruption
 */

const fs = require("fs");
const path = require("path");

process.stdout.setEncoding("utf8");

console.log("[EMERGENCY_CLEANUP] Version sûre\n");

const filesToFix = [
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

// Patterns en bytes uniquement - JAMAIS de strings
const fixPatterns = [
  [[0xc3, 0xa9], "e"], // e
  [[0xc3, 0xa0], "a"], // a
  [[0xc3, 0xa8], "e"], // e
  [[0xc3, 0xaa], "e"], // e
  [[0xc3, 0xa7], "c"], // c
  [[0xc3, 0xb9], "u"], // u
  [[0xc3, 0xb4], "o"], // o
  [[0xc3, 0xb2], "o"], // o
  [[0xc3, 0xac], "i"], // i
  [[0xc3, 0x89], "E"], // E
  [[0xc3, 0x80], "A"], // A
  [[0xc2, 0xa0], " "], // nbsp
  [[0xe2, 0x80, 0x99], "'"], // '
  [[0xe2, 0x80, 0x98], "'"], // '
  [[0xe2, 0x80, 0x9c], '"'], // "
  [[0xe2, 0x80, 0x9d], '"'], // "
  [[0xef, 0xbf, 0xbd], ""], // REPLACEMENT CHAR
];

let totalFixed = 0;

for (const filePath of filesToFix) {
  const fullPath = path.resolve(__dirname, "../", filePath);

  if (!fs.existsSync(fullPath)) continue;

  try {
    let buffer = fs.readFileSync(fullPath);
    let fileFixCount = 0;

    for (const [badBytes, goodStr] of fixPatterns) {
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
      console.log(`[OK] ${filePath} +${fileFixCount}`);
    }
  } catch (err) {
    console.error(`[ERROR] ${filePath}: ${err.message.substring(0, 50)}`);
  }
}

console.log(`\n[DONE] +${totalFixed} corrections\n`);
