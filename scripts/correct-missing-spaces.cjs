#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { applyCorrectionsToHtml } = require("./lib/html-safe-french-corrections.cjs");

const ERRORS_FILE = path.join(__dirname, "..", "real-missing-spaces.json");
const DRY_RUN = process.argv.includes("--dry-run");
const BACKUP_EXT = ".bak";

const IGNORE_ERRORS = new Set(["LesCalculateurs", "JavaScript", "TypeScript"]);

function loadErrors() {
  return JSON.parse(fs.readFileSync(ERRORS_FILE, "utf8")).filter(
    (error) => !IGNORE_ERRORS.has(error.error),
  );
}

function groupByFile(errors) {
  return errors.reduce((accumulator, error) => {
    const filePath = path.resolve(error.file);
    if (!accumulator[filePath]) {
      accumulator[filePath] = [];
    }

    accumulator[filePath].push({
      ...error,
      suggestions: [error.suggestion],
      text: error.context,
    });
    return accumulator;
  }, {});
}

function backupFile(filePath) {
  const backupPath = `${filePath}${BACKUP_EXT}`;
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }
}

function processFile(filePath, issues) {
  if (!fs.existsSync(filePath)) {
    return {
      applied: [],
      rejected: issues.map((issue) => ({ issue, reason: "file_not_found" })),
    };
  }

  const originalHtml = fs.readFileSync(filePath, "utf8");
  const result = applyCorrectionsToHtml(originalHtml, issues, {
    minLength: 3,
    maxLengthDelta: 10,
  });

  if (!DRY_RUN && result.applied.length > 0) {
    backupFile(filePath);
    fs.writeFileSync(filePath, result.html, "utf8");
  }

  return result;
}

function main() {
  const errors = loadErrors();
  const byFile = groupByFile(errors);
  const fileEntries = Object.entries(byFile);

  let appliedCount = 0;
  let rejectedCount = 0;

  console.log(`Erreurs chargees: ${errors.length}`);
  console.log(`Fichiers a traiter: ${fileEntries.length}`);
  if (DRY_RUN) {
    console.log("Mode dry-run actif");
  }

  for (const [filePath, issues] of fileEntries) {
    const result = processFile(filePath, issues);
    appliedCount += result.applied.length;
    rejectedCount += result.rejected.length;

    console.log(
      `${path.relative(process.cwd(), filePath)}: ${result.applied.length} appliquee(s), ${result.rejected.length} rejetee(s)`,
    );
  }

  console.log(
    `Resume: ${appliedCount} correction(s) appliquee(s), ${rejectedCount} correction(s) rejetee(s)`,
  );
}

main();
