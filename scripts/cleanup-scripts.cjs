#!/usr/bin/env node

/**
 * CLEANUP SCRIPTS - Version ultra-safe avec buffers binaires
 * Evite toute corruption des patterns eux-memes
 */

const fs = require("fs");
const path = require("path");

process.stdout.setEncoding("utf8");
process.stderr.setEncoding("utf8");

console.log("[CLEANUP_SCRIPTS] Nettoyage des scripts JavaScript corrompus\n");

const scriptDir = path.resolve(__dirname);

// Patterns en bytes uniquement - JAMAIS en strings
const fixPatterns = [
  [[0xc3, 0xa9], "e"], // e -> e
  [[0xc3, 0xa0], "a"], // a -> a
  [[0xc3, 0xa8], "e"], // e -> e
  [[0xc3, 0xaa], "e"], // e -> e
  [[0xc3, 0xa7], "c"], // c -> c
  [[0xc3, 0xb9], "u"], // u -> u
  [[0xc3, 0xb4], "o"], // o -> o
  [[0xc3, 0xb2], "o"], // o -> o
  [[0xc3, 0xac], "i"], // i -> i
  [[0xc3, 0x89], "E"], // E -> E
  [[0xc3, 0x80], "A"], // A -> A
  [[0xc2, 0xa0], " "], // nbsp -> space
  [[0xc2, 0xab], '"'], // " -> "
  [[0xc2, 0xbb], '"'], // " -> "
  [[0xe2, 0x80, 0x99], "'"], // ' -> '
  [[0xe2, 0x80, 0x98], "'"], // ' -> '
  [[0xe2, 0x80, 0x9c], '"'], // " -> "
  [[0xe2, 0x80, 0x9d], '"'], // " -> "
  [[0xe2, 0x80, 0x93], "-"], // - -> -
  [[0xe2, 0x80, 0x94], "-"], // - -> -
  [[0xef, 0xbb, 0xbf], ""], // BOM -> (remove)
  [[0xef, 0xbf, 0xbd], "?"], // REPLACEMENT CHAR -> ?
];

const files = fs
  .readdirSync(scriptDir)
  .filter((f) => /\.(cjs|mjs|js)$/.test(f) && f !== "cleanup-scripts.cjs");

let totalFixed = 0;
let filesFixed = 0;

for (const file of files) {
  const fullPath = path.join(scriptDir, file);

  try {
    let buffer = fs.readFileSync(fullPath);
    let fileCount = 0;

    for (const [badBytes, goodStr] of fixPatterns) {
      const badBuf = Buffer.from(badBytes);
      const goodBuf = Buffer.from(goodStr, "utf8");
      let pos = 0;
      let newBuf = Buffer.alloc(0);

      while (pos < buffer.length) {
        const idx = buffer.indexOf(badBuf, pos);
        if (idx === -1) {
          newBuf = Buffer.concat([newBuf, buffer.slice(pos)]);
          break;
        }
        newBuf = Buffer.concat([newBuf, buffer.slice(pos, idx), goodBuf]);
        fileCount++;
        totalFixed++;
        pos = idx + badBuf.length;
      }

      buffer = newBuf;
    }

    if (fileCount > 0) {
      fs.writeFileSync(fullPath, buffer);
      console.log(`[FIX] ${file}`);
      console.log(`  -> ${fileCount} correction(s) appliquee(s)`);
      filesFixed++;
    }
  } catch (err) {
    console.error(`[ERROR] ${file} : ${err.message}`);
  }
}

console.log(
  `\n[DONE] ${filesFixed} fichier(s) | ${totalFixed} correction(s) appliquee(s) au total\n`,
);
