#!/usr/bin/env node
/**
 * Analyse le word count de toutes les pages HTML
 * et identifie celles avec trop peu de contenu
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readdirSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.resolve(__dirname, "../src/pages");

function getTextContent(html) {
  // Supprimer les scripts et styles
  let text = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Supprimer les commentaires HTML
  text = text.replace(/<!--.*?-->/gs, "");

  // Supprimer les balises HTML
  text = text.replace(/<[^>]+>/g, "");

  // Supprimer les entités HTML
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&[a-z]+;/gi, "");

  // Compter les mots
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  return words.length;
}

function analyzeHtmlFiles(dir) {
  const files = readdirSync(dir, { recursive: true })
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.join(dir, f));

  const results = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf-8");
    const wordCount = getTextContent(content);
    const relPath = path.relative(dir, filePath);

    results.push({
      file: relPath,
      wordCount,
      path: filePath,
    });
  }

  // Trier par word count
  results.sort((a, b) => a.wordCount - b.wordCount);

  // Afficher les résultats
  console.log("📊 Word Count Analysis\n");
  console.log("Pages with LOW word count (< 500 words):\n");

  const lowWordCount = results.filter((r) => r.wordCount < 500);
  lowWordCount.forEach((r) => {
    console.log(`  ⚠️  ${r.file}: ${r.wordCount} words`);
  });

  console.log(`\n📈 Total pages analyzed: ${results.length}`);
  console.log(`   Pages with < 500 words: ${lowWordCount.length}`);
  console.log(
    `   Avg word count: ${Math.round(
      results.reduce((s, r) => s + r.wordCount, 0) / results.length
    )}`
  );

  return lowWordCount;
}

analyzeHtmlFiles(pagesDir);
