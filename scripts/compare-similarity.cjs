#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PAGES_DIR = path.join(root, "src", "pages", "blog", "departements");

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u2018\u2019\u201C\u201D]/g, '"')
    .replace(/[\s\u00A0]+/g, " ")
    .trim()
    .toLowerCase();
}

function tokenize(text) {
  return text
    .replace(/[^a-z0-9àâäéèêëîïôöùûüç'\- ]+/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function shingles(tokens, k = 5) {
  const out = new Set();
  for (let i = 0; i + k <= tokens.length; i++) {
    out.add(tokens.slice(i, i + k).join(" "));
  }
  return out;
}

function jaccard(aSet, bSet) {
  let inter = 0;
  for (const x of aSet) if (bSet.has(x)) inter++;
  const union = aSet.size + bSet.size - inter;
  return union === 0 ? 0 : inter / union;
}

function readPage(code) {
  const file = path.join(PAGES_DIR, `frais-notaire-${code}.html`);
  if (!fs.existsSync(file)) throw new Error("Missing " + file);
  return fs.readFileSync(file, "utf8");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node compare-similarity.cjs <codeA> <codeB>");
    process.exit(2);
  }
  const [a, b] = args.map((s) => String(s).padStart(2, "0"));
  const htmlA = readPage(a);
  const htmlB = readPage(b);

  const textA = stripHtml(htmlA);
  const textB = stripHtml(htmlB);

  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  const shA = shingles(tokensA, 5);
  const shB = shingles(tokensB, 5);

  const j = jaccard(shA, shB);

  const wordOverlap =
    tokensA.filter((t) => tokensB.includes(t)).length /
      Math.max(tokensA.length, tokensB.length) || 0;

  console.log(`Similarity report for ${a} vs ${b}`);
  console.log("--------------------------------");
  console.log(`Shingle size: 5 words`);
  console.log(`Shingle sets: ${shA.size} vs ${shB.size}`);
  console.log(`Jaccard similarity (shingles): ${(j * 100).toFixed(1)} %`);
  console.log(`Token overlap (words): ${(wordOverlap * 100).toFixed(1)} %`);
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
