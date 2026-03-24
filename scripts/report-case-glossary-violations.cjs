#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const { collectLanguageToolFiles } = require("./lib/text-file-scopes.cjs");
const { extractSeoTextFromHtml } = require("./lib/html-text-utils.cjs");
const { getTextNodes } = require("./lib/html-safe-french-corrections.cjs");
const { collectCaseStyleFixes } = require("./lib/french-case-style.cjs");

function parseArgs() {
  const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
  const outputArg = process.argv.find((arg) => arg.startsWith("--output="));
  const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));

  return {
    scope: scopeArg ? scopeArg.split("=")[1] : "site-rendered",
    outputPath: outputArg
      ? path.resolve(process.cwd(), outputArg.split("=")[1])
      : path.resolve(process.cwd(), "reports/case-glossary-violations-site.json"),
    mode: modeArg ? modeArg.split("=")[1] : "visible",
  };
}

function extractText(filePath, mode) {
  const raw = fs.readFileSync(filePath, "utf8");
  const extension = path.extname(filePath).toLowerCase();
  if (extension !== ".html") {
    return raw;
  }

  if (mode === "seo") {
    return extractSeoTextFromHtml(raw);
  }

  const $ = cheerio.load(raw, { decodeEntities: false });
  return getTextNodes($, { minLength: 1 })
    .map((entry) => entry.node.data)
    .join(" ");
}

function buildTopPairs(items, limit = 50) {
  return Object.entries(
    items.reduce((accumulator, item) => {
      const key = `${item.original} -> ${item.replacement}`;
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([pair, count]) => ({ pair, count }));
}

function main() {
  const { scope, outputPath, mode } = parseArgs();
  const files = collectLanguageToolFiles(scope).filter((filePath) => path.extname(filePath).toLowerCase() === ".html");
  const items = [];

  for (const filePath of files) {
    const text = extractText(filePath, mode);
    if (!text || text.length < 10) {
      continue;
    }

    const result = collectCaseStyleFixes(text);
    for (const fix of result.fixes) {
      items.push({
        file: path.relative(process.cwd(), filePath),
        original: fix.original,
        replacement: fix.replacement,
      });
    }
  }

  const summary = {
    scope,
    mode,
    scannedFiles: files.length,
    totalFixes: items.length,
    topPairs: buildTopPairs(items),
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify({ summary, items }, null, 2), "utf8");

  console.log(
    `Rapport glossaire casse genere: ${path.relative(process.cwd(), outputPath)} (${items.length} correction(s), ${files.length} fichier(s))`,
  );
}

main();
