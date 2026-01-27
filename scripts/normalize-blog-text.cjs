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
  s = s.replace(/Â/g, "");
  s = s.replace(/â€”/g, "—");
  s = s.replace(/â€“/g, "–");
  s = s.replace(/â€™/g, "’");
  s = s.replace(/â€œ/g, "“");
  s = s.replace(/â€/g, "”");
  s = s.replace(/â€¯/g, "\u202F");
  s = s.replace(/â€/g, "‐");
  s = s.replace(/â€/g, "‑");
  s = s.replace(/â€/g, "‘");
  s = s.replace(/â€/g, "’");
  s = s.replace(/â€/g, "“");
  s = s.replace(/â€/g, "”");
  s = s.replace(/â€¢/g, "•");
  s = s.replace(/Ã©/g, "é");
  s = s.replace(/Ã¨/g, "è");
  s = s.replace(/Ãª/g, "ê");
  s = s.replace(/Ã«/g, "ë");
  s = s.replace(/Ã /g, "à");
  s = s.replace(/Ã¢/g, "â");
  s = s.replace(/Ã®/g, "î");
  s = s.replace(/Ã´/g, "ô");
  s = s.replace(/Ã¹/g, "ù");
  s = s.replace(/Ã§/g, "ç");
  s = s.replace(/Ã‰/g, "É");
  s = s.replace(/Ã€/g, "À");
  s = s.replace(/Ã‡/g, "Ç");
  s = s.replace(/Ã»/g, "û");
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

