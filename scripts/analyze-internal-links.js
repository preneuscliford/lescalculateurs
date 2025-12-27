#!/usr/bin/env node
/**
 * Analyse les liens internes dans chaque page HTML
 * pour identifier les pages isolées ou mal liées
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readdirSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.resolve(__dirname, "../src/pages");

function countInternalLinks(html) {
  // Compter les liens vers d'autres pages (pas d'images, pas d'ancres)
  // Inclure <a href="/..."> et <a href="...">
  const linkPattern = /<a\s+[^>]*href=["']([^"']*)[^>]*>(?!<img)/gi;
  const links = [];
  let match;

  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1];
    // Exclure les liens externes et les ancres pures
    if (!href.startsWith("http") && !href.startsWith("#") && href !== "") {
      links.push(href);
    }
  }

  return links.length;
}

function analyzeInternalLinks(dir) {
  const files = readdirSync(dir, { recursive: true })
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.join(dir, f));

  const results = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf-8");
    const linkCount = countInternalLinks(content);
    const relPath = path.relative(dir, filePath);

    results.push({
      file: relPath,
      linkCount,
      path: filePath,
    });
  }

  // Trier par link count
  results.sort((a, b) => a.linkCount - b.linkCount);

  // Afficher les résultats
  console.log("🔗 Internal Linking Analysis\n");

  const isolated = results.filter((r) => r.linkCount < 2);
  const poor = results.filter((r) => r.linkCount >= 2 && r.linkCount < 5);
  const good = results.filter((r) => r.linkCount >= 5);

  if (isolated.length > 0) {
    console.log(`❌ Isolated pages (< 2 internal links):\n`);
    isolated.forEach((r) => {
      console.log(`  ${r.file}: ${r.linkCount} link(s)`);
    });
  }

  if (poor.length > 0) {
    console.log(`\n⚠️  Poor linking (2-4 internal links):\n`);
    poor.forEach((r) => {
      console.log(`  ${r.file}: ${r.linkCount} link(s)`);
    });
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Isolated (< 2): ${isolated.length}`);
  console.log(`   Poor (2-4): ${poor.length}`);
  console.log(`   Good (5+): ${good.length}`);
  console.log(
    `   Avg links: ${Math.round(
      results.reduce((s, r) => s + r.linkCount, 0) / results.length
    )}`
  );
}

analyzeInternalLinks(pagesDir);
