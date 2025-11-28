#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const REPORT = path.resolve(
  __dirname,
  "..",
  "reports",
  "duplication-fuzzy-report.json"
);
const OUT_JSON = path.resolve(
  __dirname,
  "..",
  "temp",
  "duplicates-for-deepseek.json"
);

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const report = readJson(REPORT);

const output = {
  instruction:
    "For each cluster below, provide unique sentence variations for each department to replace the duplicate sentence. Ensure each variation is specific to the department's context.",
  clusters: report.clusters.map((cluster, idx) => ({
    clusterId: idx + 1,
    duplicateSentence: cluster.items[0].orig,
    departments: cluster.items.map((item) => ({
      code: item.code,
      file: item.file,
    })),
  })),
};

fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2), "utf8");
console.log("JSON written to", OUT_JSON);
