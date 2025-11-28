#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const CLEAN = path.join(root, "reports", "duplication-fuzzy-clean.json");
const DATA_DIR = path.join(root, "data");
const SUG = path.join(DATA_DIR, "notaires-phrases-suggestions.json");
const CORR = path.join(root, "reports", "duplication-corrections.json");

function ts() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function safeRead(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    return null;
  }
}

const clean = safeRead(CLEAN);
if (!clean) {
  console.error("Cannot read or parse", CLEAN);
  process.exit(2);
}

// Ensure data dir
fs.mkdirSync(DATA_DIR, { recursive: true });

const existing = safeRead(SUG) || {};
// write a backup of existing suggestions (even if empty object)
const backupPath = SUG + ".bak." + ts();
fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2), "utf8");
console.log("Backup written to", backupPath);

// Build map from clean array
const merged = Object.assign({}, existing);
const corrections = [];
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

  const prev = merged[key];
  if (!prev) {
    merged[key] = entry;
    corrections.push({
      code: key,
      change: "added",
      before: null,
      after: entry,
    });
    added++;
  } else {
    // normalize prev to object
    const prevObj =
      typeof prev === "string" ? { intro: prev, notaires: "" } : prev;
    // if different, update but prefer existing non-empty
    const newObj = Object.assign({}, entry);
    if (prevObj.intro && prevObj.intro.trim()) newObj.intro = prevObj.intro;
    if (prevObj.notaires && prevObj.notaires.trim())
      newObj.notaires = prevObj.notaires;
    // detect if changed compared to prevObj
    if (JSON.stringify(prevObj) !== JSON.stringify(newObj)) {
      merged[key] = newObj;
      corrections.push({
        code: key,
        change: "updated",
        before: prevObj,
        after: newObj,
      });
      updated++;
    }
  }
}

fs.writeFileSync(SUG, JSON.stringify(merged, null, 2), "utf8");
fs.writeFileSync(
  CORR,
  JSON.stringify({ added, updated, items: corrections }, null, 2),
  "utf8"
);
console.log(
  `Merged ${added} added, ${updated} updated. Corrections written to ${path.relative(
    root,
    CORR
  )}`
);
process.exit(0);
