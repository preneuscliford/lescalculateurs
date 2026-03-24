#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const { collectLanguageToolFiles } = require("./lib/text-file-scopes.cjs");
const { getTextNodes } = require("./lib/html-safe-french-corrections.cjs");
const { normalizeFrenchCaseStyle } = require("./lib/french-case-style.cjs");

function parseArgs() {
  const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
  return {
    scope: scopeArg ? scopeArg.split("=")[1] : "site-rendered",
  };
}

function main() {
  const { scope } = parseArgs();
  const files = collectLanguageToolFiles(scope).filter((filePath) => path.extname(filePath).toLowerCase() === ".html");
  let modifiedFiles = 0;
  let updatedNodes = 0;

  for (const filePath of files) {
    const html = fs.readFileSync(filePath, "utf8");
    const $ = cheerio.load(html, { decodeEntities: false });
    const entries = getTextNodes($, { minLength: 1 });
    let fileModified = false;

    for (const entry of entries) {
      const nextValue = normalizeFrenchCaseStyle(entry.node.data);
      if (nextValue !== entry.node.data) {
        entry.node.data = nextValue;
        updatedNodes += 1;
        fileModified = true;
      }
    }

    if (fileModified) {
      fs.writeFileSync(filePath, $.html(), "utf8");
      modifiedFiles += 1;
    }
  }

  console.log(`Glossaire de casse applique: ${modifiedFiles} fichier(s), ${updatedNodes} noeud(s) texte mis a jour`);
}

main();
