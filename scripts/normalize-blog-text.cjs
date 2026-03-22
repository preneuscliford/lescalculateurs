#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { readTextFile, writeTextFile } = require("./encoding.cjs");

function walk(dir, onFile) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) walk(p, onFile);
    else if (it.isFile()) onFile(p);
  }
}

function normalizeBlogText(input) {
  let s = input;
  s = s.replace(/˜/g, "≈");
  s = s.replace(/(\d)\?(\d)/g, "$1\u202F$2");
  s = s.replace(//g, "");
  s = s.replace(/a€"/g, "-");
  s = s.replace(/a€"/g, "-");
  s = s.replace(/'/g, "'");
  s = s.replace(/"/g, """);
  s = s.replace(/a€/g, """);
  s = s.replace(/a€¯/g, "\u202F");
  s = s.replace(/a€/g, "‐");
  s = s.replace(/a€/g, "‑");
  s = s.replace(/a€/g, "'");
  s = s.replace(/a€/g, "'");
  s = s.replace(/a€/g, """);
  s = s.replace(/a€/g, """);
  s = s.replace(/a€¢/g, "•");
  s = s.replace(/e/g, "e");
  s = s.replace(/e/g, "e");
  s = s.replace(/e/g, "e");
  s = s.replace(/e/g, "ë");
  s = s.replace(/a/g, "a");
  s = s.replace(/a/g, "a");
  s = s.replace(/Ã®/g, "î");
  s = s.replace(/Ã´/g, "o");
  s = s.replace(/u/g, "u");
  s = s.replace(/c/g, "c");
  s = s.replace(/Ã‰/g, "E");
  s = s.replace(/Ã€/g, "A");
  s = s.replace(/Ã‡/g, "Ç");
  s = s.replace(/Ã"/g, "û");
  return s;
}

function main() {
  const args = process.argv.slice(2);
  const roots = args.length ? args : ["src/pages/blog"];

  let total = 0;
  let changed = 0;
  const changedFiles = [];

  for (const root of roots) {
    const abs = path.resolve(process.cwd(), root);
    if (!fs.existsSync(abs)) continue;

    walk(abs, (filePath) => {
      const lc = filePath.toLowerCase();
      if (!lc.endsWith(".html")) return;
      total++;
      const original = readTextFile(filePath);
      const normalized = normalizeBlogText(original);
      if (normalized !== original) {
        writeTextFile(filePath, normalized);
        changed++;
        changedFiles.push(path.relative(process.cwd(), filePath));
      }
    });
  }

  console.log(
    JSON.stringify(
      { roots, totalHtmlFiles: total, changedFiles: changed, files: changedFiles },
      null,
      2,
    ),
  );
}

main();

