#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function listHtmlFiles(dir) {
  const out = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) out.push(...listHtmlFiles(p));
    else if (it.isFile() && it.name.endsWith(".html")) out.push(p);
  }
  return out;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function splitSentences(text) {
  // split on punctuation and newlines, keep short trims
  return text
    .split(/[\n\r]+|[\.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20); // ignore very short fragments
}

function normalizeForDup(s) {
  // lowercase, remove punctuation, collapse spaces, replace numbers with #NUM#
  return s
    .toLowerCase()
    .replace(/[0-9]+(?:[\s\.\,\u202F][0-9]{3})*/g, "#NUM#")
    .replace(/[\u00A0\u202F]/g, " ")
    .replace(/[^a-z0-9#\sàâäéèêëîïôöùûüç'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureReportsDir() {
  const dir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  return dir;
}

function codeFromFilename(file) {
  // try to extract department code from filename like frais-notaire-XX.html
  const m = file.match(/frais-notaire-([0-9]{1,3}|2A|2B)/i);
  if (m) return m[1];
  return path.basename(file);
}

function main() {
  const base = path.join(process.cwd(), "src", "pages", "blog", "departements");
  if (!fs.existsSync(base)) {
    console.error("Directory not found:", base);
    process.exit(1);
  }

  const files = listHtmlFiles(base);
  const occurrences = [];

  for (const f of files) {
    const raw = fs.readFileSync(f, "utf8");
    const txt = stripHtml(raw);
    const sents = splitSentences(txt);
    const code = codeFromFilename(f);
    for (const s of sents) {
      occurrences.push({
        file: path.relative(process.cwd(), f),
        code,
        orig: s,
      });
    }
  }

  const groups = new Map();
  for (const occ of occurrences) {
    const norm = normalizeForDup(occ.orig);
    if (!groups.has(norm)) groups.set(norm, []);
    groups.get(norm).push(Object.assign({}, occ, { norm }));
  }

  const clusters = [];
  for (const [norm, items] of groups) {
    if (items.length > 1) {
      const departments = Array.from(new Set(items.map((i) => i.code)));
      clusters.push({ items, departments });
    }
  }

  const out = {
    generatedAt: new Date().toISOString(),
    totalSentences: occurrences.length,
    clustersFound: clusters.length,
    clusters,
    meta: { normalization: "numbers->#NUM#, punctuation removed, lowercased" },
  };

  const dir = ensureReportsDir();
  const outPath = path.join(dir, "duplication-fuzzy-report.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log("Fuzzy report written to", outPath);
  console.log("Clusters found:", clusters.length);
}

if (require.main === module) main();
