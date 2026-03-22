#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { isSafeIssue, sortCandidates } = require("./lib/openai-french-safe-utils.cjs");

function parseArgs() {
  const inputArg = process.argv.find((arg) => arg.startsWith("--input="));
  if (!inputArg) {
    throw new Error("--input=... requis");
  }

  return {
    input: inputArg.split("=").slice(1).join("="),
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAllExact(content, original, corrected) {
  const pattern = new RegExp(escapeRegExp(original), "g");
  let count = 0;
  const next = content.replace(pattern, () => {
    count += 1;
    return corrected;
  });
  return { next, count };
}

function main() {
  const { input } = parseArgs();
  const inputPath = path.resolve(process.cwd(), input);
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const candidates = [];

  for (const file of raw.files || []) {
    for (const issue of file.issues || []) {
      if (!isSafeIssue(issue)) {
        continue;
      }

      candidates.push({
        filePath: file.filePath,
        original: issue.original,
        corrected: issue.corrected,
        category: issue.category,
        reason: issue.reason,
      });
    }
  }

  const byFile = new Map();
  for (const candidate of sortCandidates(candidates)) {
    const list = byFile.get(candidate.filePath) || [];
    list.push(candidate);
    byFile.set(candidate.filePath, list);
  }

  const applied = [];
  const skipped = [];

  for (const [relativePath, fileCandidates] of byFile.entries()) {
    const absolutePath = path.resolve(process.cwd(), relativePath);
    let content = fs.readFileSync(absolutePath, "utf8");
    let touched = false;

    for (const candidate of fileCandidates) {
      if (!content.includes(candidate.original)) {
        skipped.push({ ...candidate, filePath: relativePath, reason: "original introuvable dans le fichier" });
        continue;
      }

      const { next, count } = replaceAllExact(content, candidate.original, candidate.corrected);
      if (count === 0) {
        skipped.push({ ...candidate, filePath: relativePath, reason: "aucun remplacement applique" });
        continue;
      }

      content = next;
      touched = true;
      applied.push({ ...candidate, filePath: relativePath, replacements: count });
    }

    if (touched) {
      fs.writeFileSync(absolutePath, content, "utf8");
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    input: path.relative(process.cwd(), inputPath),
    summary: {
      appliedCount: applied.length,
      skippedCount: skipped.length,
      filesTouched: new Set(applied.map((item) => item.filePath)).size,
    },
    applied,
    skipped,
  };

  const baseName = path.basename(inputPath, ".json").replace(/^openai-french-review-/, "openai-safe-applied-");
  const reportPath = path.resolve(process.cwd(), "reports", `${baseName}.json`);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Application safe terminee : ${report.summary.appliedCount} correction(s) sur ${report.summary.filesTouched} fichier(s)`);
  console.log(`Rapport d'application : ${path.relative(process.cwd(), reportPath)}`);
  if (report.summary.skippedCount > 0) {
    console.log(`${report.summary.skippedCount} correction(s) ignoree(s) car non trouvables ou non applicables`);
  }
}

main();
