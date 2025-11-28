#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const REPORT = path.resolve(
  __dirname,
  "..",
  "reports",
  "duplication-fuzzy-report.json"
);
const CLEAN = path.resolve(
  __dirname,
  "..",
  "reports",
  "duplication-fuzzy-clean.json"
);
const PAGES_DIR = path.resolve(
  __dirname,
  "..",
  "src",
  "pages",
  "blog",
  "departements"
);

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const report = readJson(REPORT);
const clean = readJson(CLEAN);

// Create map of code to nom
const codeToNom = {};
clean.forEach((item) => {
  codeToNom[item.code] = item.nom;
});

// For cluster 1, which has identical sentences, make them unique
const cluster1 = report.clusters.find((c) => c.clusterId === 1);
if (cluster1) {
  const duplicateSentence = `En 2025, ces frais représentent entre <strong>4% et 6,6% du prix d'achat</strong> selon que vous acquériez`;
  console.log("Fixing cluster 1:", duplicateSentence);

  cluster1.items.forEach((item) => {
    const nom = codeToNom[item.code];
    if (!nom) {
      console.error("No name for code", item.code);
      return;
    }
    const uniqueSentence = `En 2025, ces frais représentent entre <strong>4% et 6,6% du prix d'achat</strong> selon que vous acquériez un bien dans ${nom}`;

    const filePath = path.resolve(PAGES_DIR, item.file.split("\\").pop()); // item.file has src\... so take last part
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf8");
      if (content.includes(duplicateSentence)) {
        content = content.replace(duplicateSentence, uniqueSentence);
        fs.writeFileSync(filePath, content, "utf8");
        console.log("Updated", filePath);
      } else {
        console.log("Sentence not found in", filePath);
      }
    } else {
      console.error("File not found:", filePath);
    }
  });
}

console.log("Simple fixes applied.");
