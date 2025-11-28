#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const TEMPLATE = path.resolve(
  __dirname,
  "..",
  "data",
  "notaires-phrases-remaining-template.json"
);
const DEPS = path.resolve(__dirname, "..", "src", "data", "departements.json");
const OUT = path.resolve(
  __dirname,
  "..",
  "reports",
  "duplication-fuzzy-clean.json"
);

function readJson(p) {
  try {
    let raw = fs.readFileSync(p, "utf8");
    raw = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

const tpl = readJson(TEMPLATE) || {};
const deps = readJson(DEPS) || {};

const items = [];
for (const code of Object.keys(tpl)) {
  const text = tpl[code];
  const nom =
    (deps[code] && deps[code].nom) || text.split(":")[0] || `dep-${code}`;
  // try to extract median number from text
  const m =
    String(text).match(/médian\s*DVF\s*([0-9\s,.]+)\s*€/i) ||
    String(text).match(/médian\s*([0-9\s,.]+)\s*€/i);
  const median = m ? Number(String(m[1]).replace(/[^0-9]/g, "")) : undefined;
  const intro = typeof text === "string" ? text.replace(/\s+–\s*/, ". ") : "";
  const notaires = `Faites estimer vos droits par une étude notariale ${nom}.`;
  items.push({
    code: String(code),
    nom,
    url: `/blog/immobilier/frais-notaire-${String(code)}`,
    prix_m2_median: median,
    intro_courte: intro,
    notaires_court: notaires,
  });
}

fs.writeFileSync(OUT, JSON.stringify(items, null, 2), "utf8");
console.log("Wrote", OUT, "entries:", items.length);
