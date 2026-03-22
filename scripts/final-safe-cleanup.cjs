#!/usr/bin/env node

/**
 * FINAL SAFE CLEANUP - Zero corruption risk
 * Uses only ASCII, no UTF-8 characters in script itself
 */

const fs = require("fs");
const path = require("path");

process.stdout.setEncoding("utf8");

const scriptDir = path.dirname(__filename);

// Corruption patterns as binary arrays
const patterns = [
  [[0xc3, 0xa9], "e"], // e-acute
  [[0xc3, 0xa0], "a"], // a-grave
  [[0xc3, 0xa8], "e"], // e-grave
  [[0xc3, 0xaa], "e"], // e-circumflex
  [[0xc3, 0xa7], "c"], // c-cedilla
  [[0xc3, 0xb9], "u"], // u-grave
  [[0xc3, 0xb4], "o"], // o-circumflex
  [[0xc3, 0xb2], "o"], // o-grave
  [[0xc3, 0xac], "i"], // i-grave
  [[0xc3, 0x89], "E"], // E-acute
  [[0xc3, 0x80], "A"], // A-grave
  [[0xc2, 0xa0], " "], // non-breaking space
  [[0xc2, 0xab], '"'], // left guillemet
  [[0xc2, 0xbb], '"'], // right guillemet
  [[0xe2, 0x80, 0x99], "'"], // right single quote
  [[0xe2, 0x80, 0x98], "'"], // left single quote
  [[0xe2, 0x80, 0x9c], '"'], // left double quote
  [[0xe2, 0x80, 0x9d], '"'], // right double quote
  [[0xe2, 0x80, 0x93], "-"], // en-dash
  [[0xe2, 0x80, 0x94], "-"], // em-dash
  [[0xef, 0xbf, 0xbd], "?"], // replacement character
  [[0xef, 0xbb, 0xbf], ""], // BOM
];

const files = fs
  .readdirSync(scriptDir)
  .filter((f) => /\.(cjs|mjs|js)$/.test(f) && f !== "final-safe-cleanup.cjs");

let totalFiles = 0;
let totalFixes = 0;

files.forEach((file) => {
  const fullPath = path.join(scriptDir, file);
  let buffer = fs.readFileSync(fullPath);
  let fileCount = 0;

  patterns.forEach(([badBytes, goodStr]) => {
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
      totalFixes++;
      pos = idx + badBuf.length;
    }
    buffer = newBuf;
  });

  if (fileCount > 0) {
    fs.writeFileSync(fullPath, buffer);
    console.log("[DONE] " + file + " +" + fileCount);
    totalFiles++;
  }
});

console.log("\n[SUMMARY] " + totalFiles + " files / " + totalFixes + " fixes\n");
