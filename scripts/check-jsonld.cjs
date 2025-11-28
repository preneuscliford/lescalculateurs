#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
    d.getHours()
  )}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

const args = process.argv.slice(2);
const FIX = args.includes("--fix");

const BASE = path.resolve(
  process.cwd(),
  "src",
  "pages",
  "blog",
  "departements"
);
if (!fs.existsSync(BASE)) {
  console.error("Directory not found:", BASE);
  process.exit(2);
}

const files = fs.readdirSync(BASE).filter((f) => f.endsWith(".html"));
let totalBlocks = 0;
let invalidBlocks = 0;
const errors = [];

function decodeHtmlEntities(str) {
  if (!str) return str;
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");
}

function extractJsonLdBlocks(html) {
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const blocks = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push(m[1]);
  }
  return blocks;
}

for (const name of files) {
  const p = path.join(BASE, name);
  const html = fs.readFileSync(p, "utf8");
  const blocks = extractJsonLdBlocks(html);
  totalBlocks += blocks.length;
  blocks.forEach((blk, idx) => {
    try {
      JSON.parse(blk);
    } catch (err) {
      invalidBlocks += 1;
      errors.push({ file: name, index: idx, message: err.message });
    }
  });
}

console.log(`Files scanned: ${files.length}`);
console.log(`Total JSON-LD blocks: ${totalBlocks}`);
console.log(`Invalid blocks: ${invalidBlocks}`);

if (invalidBlocks === 0) process.exit(0);

if (!FIX) {
  console.log(
    "Run with --fix to attempt automatic repairs (backs up files to ./reports/jsonld-backups-<stamp>/)"
  );
  errors
    .slice(0, 30)
    .forEach((e) => console.log(`${e.file} [block ${e.index}]: ${e.message}`));
  process.exit(1);
}

// --fix mode
const stamp = nowStamp();
const backupDir = path.resolve(
  process.cwd(),
  "reports",
  `jsonld-backups-${stamp}`
);
fs.mkdirSync(backupDir, { recursive: true });

console.log("Attempting fixes; backups will be written to:", backupDir);

for (const name of files) {
  const p = path.join(BASE, name);
  let html = fs.readFileSync(p, "utf8");
  const blocks = extractJsonLdBlocks(html);
  let changed = false;
  const newHtml = html.replace(
    /(<script[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,
    (m, open, content, close) => {
      try {
        JSON.parse(content);
        return m; // valid
      } catch (err) {
        // try basic repairs
        let repaired = decodeHtmlEntities(content);
        repaired = repaired.replace(/<[^>]+>/g, "");
        repaired = repaired.trim();
        try {
          const parsed = JSON.parse(repaired);
          changed = true;
          return open + JSON.stringify(parsed, null, 2) + close;
        } catch (err2) {
          // as a last resort try to wrap as array or object (not safe) — skip
          return m;
        }
      }
    }
  );

  if (newHtml !== html) {
    const backupPath = path.join(backupDir, name);
    fs.writeFileSync(backupPath, html, "utf8");
    fs.writeFileSync(p, newHtml, "utf8");
    console.log("Fixed and backed up:", name);
  }
}

console.log("Fix pass complete. Re-run without --fix to confirm.");
process.exit(0);
