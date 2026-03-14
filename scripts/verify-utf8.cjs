#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const chardet = require("chardet");
const iconv = require("iconv-lite");
const { collectFiles } = require("./lib/text-file-scopes.cjs");

const REPLACEMENT_CHAR = "\uFFFD";
const BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const MOJIBAKE_PATTERNS = [
  "Ã©",
  "Ã¨",
  "Ãª",
  "Ã ",
  "Ã¢",
  "Ã´",
  "Ã§",
  "Ã‰",
  "Ã€",
  "â€™",
  "â€œ",
  "â€",
  "â€“",
  "â€”",
  "â‚¬",
  "ï»¿",
];
const ALLOWED_ENCODINGS = new Set(["UTF-8", "ASCII", "UTF-8-BOM"]);

function parseScope() {
  const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
  return scopeArg ? scopeArg.split("=")[1] : "pseo";
}

function detectEncoding(buffer) {
  const detected = chardet.detect(buffer) || "unknown";
  if (buffer.slice(0, 3).equals(BOM)) return "UTF-8-BOM";
  return String(detected).toUpperCase();
}

function isValidUtf8Buffer(buffer) {
  const cleanBuffer = buffer.slice(0, 3).equals(BOM) ? buffer.slice(3) : buffer;
  const decoded = iconv.decode(cleanBuffer, "utf8");
  const reencoded = Buffer.from(decoded, "utf8");
  return cleanBuffer.equals(reencoded);
}

function inspectFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const encoding = detectEncoding(buffer);
  const decoded = iconv.decode(buffer, "utf8");
  const issues = [];

  if (!ALLOWED_ENCODINGS.has(encoding) && !isValidUtf8Buffer(buffer)) {
    issues.push(`encodage detecte: ${encoding}`);
  }

  if (buffer.slice(0, 3).equals(BOM)) {
    issues.push("BOM UTF-8 present");
  }

  if (decoded.includes(REPLACEMENT_CHAR)) {
    issues.push("caractere de remplacement detecte");
  }

  if (MOJIBAKE_PATTERNS.some((pattern) => decoded.includes(pattern))) {
    issues.push("sequence mojibake detectee");
  }

  return issues;
}

function main() {
  const scope = parseScope();
  const files = collectFiles(scope);
  const failures = [];

  for (const filePath of files) {
    const issues = inspectFile(filePath);
    if (issues.length > 0) {
      failures.push({ filePath, issues });
    }
  }

  if (failures.length === 0) {
    console.log(`UTF-8 OK: ${files.length} fichiers verifies (${scope})`);
    return;
  }

  console.error(`UTF-8 KO: ${failures.length} fichier(s) suspects sur le scope ${scope}`);
  for (const failure of failures.slice(0, 50)) {
    console.error(`- ${path.relative(process.cwd(), failure.filePath)}: ${failure.issues.join(", ")}`);
  }

  process.exit(1);
}

main();
