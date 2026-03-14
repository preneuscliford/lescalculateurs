#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const chardet = require("chardet");
const iconv = require("iconv-lite");
const { collectFiles } = require("./lib/text-file-scopes.cjs");
const { repairMojibakeText } = require("./lib/french-normalization.cjs");

const BOM = Buffer.from([0xef, 0xbb, 0xbf]);

function parseScope() {
  const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
  return scopeArg ? scopeArg.split("=")[1] : "pseo";
}

function decodeBuffer(buffer) {
  const detected = String(chardet.detect(buffer) || "utf-8").toLowerCase();
  const cleanBuffer = buffer.slice(0, 3).equals(BOM) ? buffer.slice(3) : buffer;

  if (detected.includes("windows-1252")) return iconv.decode(cleanBuffer, "win1252");
  if (detected.includes("iso-8859-1")) return iconv.decode(cleanBuffer, "latin1");
  if (detected.includes("utf-16le")) return iconv.decode(cleanBuffer, "utf16-le");

  return iconv.decode(cleanBuffer, "utf8");
}

function isUtf8Like(buffer) {
  const detected = String(chardet.detect(buffer) || "utf-8").toUpperCase();
  const cleanBuffer = buffer.slice(0, 3).equals(BOM) ? buffer.slice(3) : buffer;
  const decoded = iconv.decode(cleanBuffer, "utf8");
  const reencoded = Buffer.from(decoded, "utf8");
  return (
    detected === "UTF-8" ||
    detected === "ASCII" ||
    buffer.slice(0, 3).equals(BOM) ||
    cleanBuffer.equals(reencoded)
  );
}

function main() {
  const scope = parseScope();
  const files = collectFiles(scope);
  let changed = 0;

  for (const filePath of files) {
    const originalBuffer = fs.readFileSync(filePath);
    const decoded = decodeBuffer(originalBuffer);
    const repaired = repairMojibakeText(decoded);

    if (
      originalBuffer.slice(0, 3).equals(BOM) ||
      !isUtf8Like(originalBuffer) ||
      repaired !== decoded
    ) {
      fs.writeFileSync(filePath, repaired, "utf8");
      changed += 1;
      console.log(`fixed ${path.relative(process.cwd(), filePath)}`);
    }
  }

  console.log(`UTF-8 fix terminé: ${changed} fichier(s) modifiés sur ${files.length}`);
}

main();
