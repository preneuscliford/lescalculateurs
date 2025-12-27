#!/usr/bin/env node
/**
 * Analyse le nombre de H1 tags dans chaque page HTML
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readdirSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.resolve(__dirname, "../src/pages");

function countH1Tags(html) {
  const matches = html.match(/<h1[^>]*>.*?<\/h1>/gi);
  return matches ? matches.length : 0;
}

function analyzeH1Tags(dir) {
  const files = readdirSync(dir, { recursive: true })
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.join(dir, f));

  const results = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf-8");
    const h1Count = countH1Tags(content);
    const relPath = path.relative(dir, filePath);

    if (h1Count !== 1) {
      results.push({
        file: relPath,
        h1Count,
        path: filePath,
      });
    }
  }

  // Trier par H1 count
  results.sort((a, b) => b.h1Count - a.h1Count);

  // Afficher les résultats
  console.log("🏷️  H1 Tags Analysis\n");

  if (results.length === 0) {
    console.log("✅ All pages have exactly 1 H1 tag");
    return;
  }

  console.log(`⚠️  Pages with incorrect H1 count:\n`);
  results.forEach((r) => {
    const status =
      r.h1Count === 0 ? "❌ Missing" : `⚠️  Multiple (${r.h1Count})`;
    console.log(`  ${status}: ${r.file}`);
  });

  console.log(`\n📊 Summary: ${results.length} page(s) need fixing`);
}

analyzeH1Tags(pagesDir);
