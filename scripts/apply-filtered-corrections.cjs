#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { applyCorrectionsToHtml } = require("./lib/html-safe-french-corrections.cjs");

const ERRORS_FILE = process.argv.includes("--priority")
  ? path.join(__dirname, "..", "french-errors-priority.json")
  : path.join(__dirname, "..", "french-errors-filtered.json");
const DRY_RUN = process.argv.includes("--dry-run");
const BACKUP_EXT = ".bak";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  gray: "\x1b[90m",
};

const log = {
  success: (msg) => console.log(`${colors.green}OK${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}ERR${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}WARN${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}INFO${colors.reset} ${msg}`),
  detail: (msg) => console.log(`${colors.gray}${msg}${colors.reset}`),
};

const stats = {
  filesProcessed: 0,
  correctionsApplied: 0,
  correctionsRejected: 0,
};

function loadErrors() {
  return JSON.parse(fs.readFileSync(ERRORS_FILE, "utf8"));
}

function groupErrorsByFile(errors) {
  return errors.reduce((accumulator, error) => {
    const filePath = path.resolve(process.cwd(), error.file);
    if (!accumulator[filePath]) {
      accumulator[filePath] = [];
    }
    accumulator[filePath].push(error);
    return accumulator;
  }, {});
}

function backupFile(filePath) {
  const backupPath = `${filePath}${BACKUP_EXT}`;
  if (fs.existsSync(backupPath)) {
    return true;
  }

  fs.copyFileSync(filePath, backupPath);
  return true;
}

function processFile(filePath, errors) {
  if (!fs.existsSync(filePath)) {
    return {
      applied: [],
      rejected: errors.map((error) => ({ issue: error, reason: "file_not_found" })),
    };
  }

  const originalHtml = fs.readFileSync(filePath, "utf8");
  const result = applyCorrectionsToHtml(originalHtml, errors, {
    minLength: 3,
    maxLengthDelta: 20,
  });

  if (!DRY_RUN && result.applied.length > 0) {
    backupFile(filePath);
    fs.writeFileSync(filePath, result.html, "utf8");
  }

  return result;
}

function main() {
  log.info(`Chargement de ${path.basename(ERRORS_FILE)}`);
  const errors = loadErrors();
  if (errors.length === 0) {
    log.warn("Aucune correction a appliquer");
    return;
  }

  const byFile = groupErrorsByFile(errors);
  const fileEntries = Object.entries(byFile);

  log.info(`${errors.length} erreurs candidates sur ${fileEntries.length} fichier(s)`);
  if (DRY_RUN) {
    log.warn("Mode dry-run actif");
  }

  for (const [filePath, fileErrors] of fileEntries) {
    stats.filesProcessed += 1;
    const result = processFile(filePath, fileErrors);
    stats.correctionsApplied += result.applied.length;
    stats.correctionsRejected += result.rejected.length;

    log.info(
      `[${stats.filesProcessed}/${fileEntries.length}] ${path.relative(process.cwd(), filePath)}: ${result.applied.length} appliquee(s), ${result.rejected.length} rejetee(s)`,
    );

    for (const applied of result.applied.slice(0, 5)) {
      log.detail(`  ${applied.original} -> ${applied.replacement}`);
    }

    for (const rejected of result.rejected.slice(0, 3)) {
      const issueLabel = rejected.issue?.error || rejected.issue?.context?.text || rejected.issue?.context || "?";
      log.detail(`  rejet: ${rejected.reason} (${issueLabel})`);
    }
  }

  log.info(
    `Resume: ${stats.filesProcessed} fichier(s), ${stats.correctionsApplied} correction(s) appliquee(s), ${stats.correctionsRejected} rejetee(s)`,
  );
}

main();
