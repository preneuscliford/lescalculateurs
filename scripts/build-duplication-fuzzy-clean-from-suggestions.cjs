#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const SUG = path.resolve(
  __dirname,
  "..",
  "data",
  "notaires-phrases-suggestions.json"
);
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

const suggestions = readJson(SUG) || {};
const items = [];
for (const code of Object.keys(suggestions)) {
  const val = suggestions[code];
  let intro = "",
    notaires = "";
  if (typeof val === "string") intro = val;
  else if (val && typeof val === "object") {
    intro = val.intro || "";
    notaires = val.notaires || "";
  }
  items.push({
    code: String(code),
    intro_courte: intro,
    notaires_court: notaires,
  });
}

fs.writeFileSync(OUT, JSON.stringify(items, null, 2), "utf8");
console.log("Wrote", OUT, "entries:", items.length);
