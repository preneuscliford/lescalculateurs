#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { collectFiles } = require("./lib/text-file-scopes.cjs");
const { repairMojibakeText } = require("./lib/french-normalization.cjs");
const { BOM, decodeLikelyText, detectEncoding, isValidUtf8Buffer } = require("./lib/utf8-quality.cjs");

function parseScope() {
  const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
  return scopeArg ? scopeArg.split("=")[1] : "pseo";
}

function isUtf8Like(buffer) {
  const detected = detectEncoding(buffer);
  return detected === "UTF-8" || detected === "ASCII" || buffer.slice(0, 3).equals(BOM) || isValidUtf8Buffer(buffer);
}

function main() {
  const scope = parseScope();
  const files = collectFiles(scope);
  let changed = 0;

  for (const filePath of files) {
    const originalBuffer = fs.readFileSync(filePath);
    const decoded = decodeLikelyText(originalBuffer);
    const repaired = repairMojibakeText(decoded);

    if (originalBuffer.slice(0, 3).equals(BOM) || !isUtf8Like(originalBuffer) || repaired !== decoded) {
      fs.writeFileSync(filePath, repaired, "utf8");
      changed += 1;
      console.log(`fixed ${path.relative(process.cwd(), filePath)}`);
    }
  }

  console.log(`UTF-8 fix termine : ${changed} fichier(s) modifies sur ${files.length}`);
}

main();
