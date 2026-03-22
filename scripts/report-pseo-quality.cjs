#!/usr/bin/env node

const path = require("path");
const { createQualityReport, writeQualityArtifacts } = require("./lib/quality-report-core.cjs");

function parseScope() {
  const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
  return scopeArg ? scopeArg.split("=")[1] : "pseo-rendered";
}

function main() {
  const scope = parseScope();
  const report = createQualityReport(scope);
  const paths = writeQualityArtifacts(report, "pseo-quality-report", "Rapport qualite pSEO");

  console.log(`Rapport qualite pSEO genere : ${path.relative(process.cwd(), paths.jsonPath)}`);
  console.log(`Vue HTML generee : ${path.relative(process.cwd(), paths.htmlPath)}`);
  console.log(
    `Score moyen ${report.summary.avgScore}/100 sur ${report.summary.totalFiles} page(s), minimum ${report.summary.minScore}/100`,
  );
  console.log(
    `UTF-8: ${report.summary.withUtf8Issues}, visible a normaliser: ${report.summary.withVisibleNormalization}, SEO a normaliser: ${report.summary.withSeoNormalization}`,
  );
}

main();
