#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { collectFiles } = require("./lib/text-file-scopes.cjs");
const { inspectUtf8Buffer } = require("./lib/utf8-quality.cjs");

function parseScope() {
  const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
  return scopeArg ? scopeArg.split("=")[1] : "pseo";
}

function inspectFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  return inspectUtf8Buffer(buffer);
}

function main() {
  const scope = parseScope();
  const files = collectFiles(scope);
  const failures = [];

  for (const filePath of files) {
    const issues = inspectFile(filePath);
    if (issues.length > 0) {
      failures.push({ filePath, issues });
    }
  }

  if (failures.length === 0) {
    console.log(`UTF-8 OK : ${files.length} fichiers verifies (${scope})`);
    return;
  }

  console.error(`UTF-8 KO : ${failures.length} fichier(s) suspects sur le scope ${scope}`);
  for (const failure of failures.slice(0, 50)) {
    console.error(`- ${path.relative(process.cwd(), failure.filePath)}: ${failure.issues.join(", ")}`);
  }

  process.exit(1);
}

main();
