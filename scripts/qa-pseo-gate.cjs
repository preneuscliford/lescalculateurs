#!/usr/bin/env node

const { spawnSync } = require("child_process");

function parseScope() {
  const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
  return scopeArg ? scopeArg.split("=")[1] : "publish-pseo";
}

function runStep(label, command, args) {
  console.log(`\n[QA] ${label}`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function main() {
  const scope = parseScope();
  const renderedScope = scope === "publish-pseo" ? "pseo-rendered" : scope;

  runStep("UTF-8", "node", ["scripts/verify-utf8.cjs", `--scope=${scope}`]);
  runStep("Normalisation visible", "node", [
    "scripts/normalize-french-text.cjs",
    `--scope=${renderedScope}`,
    "--html-mode=visible",
    "--check",
  ]);
  runStep("Normalisation SEO", "node", [
    "scripts/normalize-french-text.cjs",
    `--scope=${renderedScope}`,
    "--html-mode=seo",
    "--check",
  ]);
  runStep("LanguageTool", "node", ["scripts/check-french-with-languagetool.cjs", `--scope=${renderedScope}`]);
  runStep("Rapport qualite", "node", ["scripts/report-pseo-quality.cjs", `--scope=${renderedScope}`]);

  console.log(`\nQA pSEO OK pour le scope ${scope}`);
}

main();
