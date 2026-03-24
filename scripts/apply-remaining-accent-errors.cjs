#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { applyCorrectionsToHtml } = require("./lib/html-safe-french-corrections.cjs");
const AMBIGUOUS_ACCENT_PAIRS = new Map([
  ["a", "à"],
  ["ou", "où"],
  ["des", "dès"],
  ["la", "là"],
]);

function stripDiacritics(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function countAccents(value) {
  return (String(value || "").match(/[\u00C0-\u017F]/gu) || []).length;
}

function isHighConfidenceAccentItem(item) {
  const original = String(item?.error || "");
  const suggestion = String(item?.suggestions?.[0] || "");

  if (!original || !suggestion || original === suggestion) {
    return false;
  }

  if (AMBIGUOUS_ACCENT_PAIRS.get(original.trim().toLowerCase()) === suggestion.trim().toLowerCase()) {
    return false;
  }

  if (!/[\u00C0-\u017F]/u.test(suggestion)) {
    return false;
  }

  if (stripDiacritics(original) !== stripDiacritics(suggestion)) {
    return false;
  }

  if (original.toLowerCase() === suggestion.toLowerCase()) {
    return false;
  }

  if (countAccents(suggestion) <= countAccents(original)) {
    return false;
  }

  if (original.length < 4 && !/[ '-]/.test(original)) {
    return false;
  }

  if (!/^[\p{L}\p{M}'’ -]+$/u.test(original) || !/^[\p{L}\p{M}'’ -]+$/u.test(suggestion)) {
    return false;
  }

  return true;
}

function parseArgs() {
  const inputArg = process.argv.find((arg) => arg.startsWith("--input="));
  return {
    inputPath: inputArg
      ? path.resolve(process.cwd(), inputArg.split("=")[1])
      : path.resolve(process.cwd(), "reports/remaining-accent-errors-site.json"),
  };
}

function groupByFile(items) {
  return items.filter(isHighConfidenceAccentItem).reduce((accumulator, item) => {
    const filePath = path.resolve(process.cwd(), item.file);
    if (!accumulator[filePath]) {
      accumulator[filePath] = [];
    }
    accumulator[filePath].push(item);
    return accumulator;
  }, {});
}

function main() {
  const { inputPath } = parseArgs();
  const payload = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const items = Array.isArray(payload) ? payload : payload.items || [];
  const byFile = groupByFile(items);

  let appliedCount = 0;
  let rejectedCount = 0;
  let modifiedFiles = 0;

  for (const [filePath, issues] of Object.entries(byFile)) {
    if (!fs.existsSync(filePath)) {
      rejectedCount += issues.length;
      continue;
    }

    const originalHtml = fs.readFileSync(filePath, "utf8");
    const result = applyCorrectionsToHtml(originalHtml, issues, {
      minLength: 3,
      maxLengthDelta: 20,
    });

    if (result.applied.length > 0) {
      fs.writeFileSync(filePath, result.html, "utf8");
      modifiedFiles += 1;
    }

    appliedCount += result.applied.length;
    rejectedCount += result.rejected.length;
  }

  console.log(
    `Deuxieme passe accents: ${modifiedFiles} fichier(s), ${appliedCount} correction(s) appliquee(s), ${rejectedCount} rejetee(s)`,
  );
}

main();
