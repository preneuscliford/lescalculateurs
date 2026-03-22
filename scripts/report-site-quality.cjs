#!/usr/bin/env node

const path = require("path");
const { createQualityReport, writeQualityArtifacts } = require("./lib/quality-report-core.cjs");

function parseScope() {
  const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
  return scopeArg ? scopeArg.split("=")[1] : "site-rendered";
}

function buildBaseName(scope) {
  if (scope === "site-rendered") return "site-quality-report";
  return `${scope.replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}-quality-report`;
}

function main() {
  const scope = parseScope();
  const report = createQualityReport(scope);
  const baseName = buildBaseName(scope);
  const title = scope === "site-rendered" ? "Rapport qualite du site" : `Rapport qualite - ${scope}`;
  const paths = writeQualityArtifacts(report, baseName, title);

  console.log(`Rapport qualite site genere : ${path.relative(process.cwd(), paths.jsonPath)}`);
  console.log(`Vue HTML generee : ${path.relative(process.cwd(), paths.htmlPath)}`);
  console.log(
    `Score moyen ${report.summary.avgScore}/100 sur ${report.summary.totalFiles} page(s), minimum ${report.summary.minScore}/100`,
  );
  console.log(
    `UTF-8: ${report.summary.withUtf8Issues}, visible a normaliser: ${report.summary.withVisibleNormalization}, SEO a normaliser: ${report.summary.withSeoNormalization}`,
  );
}

main();
