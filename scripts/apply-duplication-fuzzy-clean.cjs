#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const CLEAN_PATH = path.resolve(
  __dirname,
  "..",
  "reports",
  "duplication-fuzzy-clean.json"
);
const SUG_PATH = path.resolve(
  __dirname,
  "..",
  "data",
  "notaires-phrases-suggestions.json"
);

function timestamp() {
  return new Date().toISOString();
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    return null;
  }
}

let clean = readJson(CLEAN_PATH);
if (!clean) {
  // try tolerant parsing: read raw text and extract JSON objects
  const raw = fs.readFileSync(CLEAN_PATH, "utf8");
  const stripped = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  const objs = [];
  const re = /\{[\s\S]*?\}(?=,?\s*(?:\{|$))/g;
  let m;
  while ((m = re.exec(stripped)) !== null) {
    const s = m[0];
    try {
      objs.push(JSON.parse(s));
    } catch (e) {
      // skip unparsable piece
    }
  }
  if (objs.length) {
    clean = objs;
  }
}
if (!clean) {
  console.error("Cannot read or parse", CLEAN_PATH);
  process.exit(2);
}

const suggestions = readJson(SUG_PATH) || {};

const backupPath = SUG_PATH + ".bak." + timestamp().replace(/[:.]/g, "-");
fs.writeFileSync(backupPath, JSON.stringify(suggestions, null, 2), "utf8");
console.log("Backup written to", backupPath);

let added = 0,
  updated = 0;
for (const item of clean) {
  if (!item || !item.code) continue;
  const key = String(item.code).toUpperCase();
  const entry = {
    intro:
      item.intro_courte ||
      item.intro ||
      (item.prix_m2_median ? `Prix médian ${item.prix_m2_median} €/m²` : ""),
    notaires: item.notaires_court || item.notaires || "",
  };

  // If existing value is a string, or missing, replace with object
  const existing = suggestions[key];
  if (!existing) {
    suggestions[key] = entry;
    added++;
  } else {
    // If existing is string, convert
    if (typeof existing === "string") {
      suggestions[key] = Object.assign(
        { intro: existing, notaires: "" },
        entry
      );
      updated++;
    } else {
      // Merge but prefer existing non-empty values
      const merged = Object.assign({}, entry);
      if (existing.intro && existing.intro.trim())
        merged.intro = existing.intro;
      if (existing.notaires && existing.notaires.trim())
        merged.notaires = existing.notaires;
      suggestions[key] = merged;
      updated++;
    }
  }
}

fs.writeFileSync(SUG_PATH, JSON.stringify(suggestions, null, 2), "utf8");
console.log(
  `Merged ${added} new entries, ${updated} updated entries into ${path.relative(
    process.cwd(),
    SUG_PATH
  )}`
);
process.exit(0);
