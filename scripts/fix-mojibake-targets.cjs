#!/usr/bin/env node
const fs = require("node:fs");

const files = [
  "src/pages/prime-activite.html",
  "src/pages/apl.html",
  "src/pages/rsa.html",
  "src/pages/apl/apl-selon-situation-2026/index.html",
];

const replacements = [
  ["Ã©", "é"],
  ["Ã¨", "è"],
  ["Ãª", "ê"],
  ["Ã ", "à"],
  ["Ã¢", "â"],
  ["Ã§", "ç"],
  ["Ã¹", "ù"],
  ["Ã»", "û"],
  ["Ã´", "ô"],
  ["Ã®", "î"],
  ["Ã¯", "ï"],
  ["â€™", "’"],
  ["â€“", "–"],
  ["â€”", "—"],
  ["âœ“", "✓"],
  ["âš ï¸", "⚠️"],
  ["ðŸŸ¢", "🟢"],
  ["ðŸ“Œ", "📌"],
  ["ðŸ§­", "🧭"],
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, "utf8");
  for (const [from, to] of replacements) {
    text = text.split(from).join(to);
  }
  fs.writeFileSync(file, text, "utf8");
  console.log(`fixed: ${file}`);
}
