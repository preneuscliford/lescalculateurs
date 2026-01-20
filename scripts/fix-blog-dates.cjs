const fs = require("fs");

// Corriger frais-notaire-departements.html
let html = fs.readFileSync(
  "src/pages/blog/frais-notaire-departements.html",
  "utf8",
);
html = html.replace(/barème officiel 2025/gi, "barème officiel 2026");
html = html.replace(/barème 2025/gi, "barème 2026");
html = html.replace(/notaire 2025/gi, "notaire 2026");
html = html.replace(
  /"dateModified": "2025-10-10T10:00:00Z"/g,
  '"dateModified": "2026-01-16T10:00:00Z"',
);
fs.writeFileSync(
  "src/pages/blog/frais-notaire-departements.html",
  html,
  "utf8",
);
console.log("✓ frais-notaire-departements.html corrigé");

// Corriger frais-notaire-ancien-neuf-2026.html
html = fs.readFileSync(
  "src/pages/blog/frais-notaire-ancien-neuf-2026.html",
  "utf8",
);
html = html.replace(
  /"dateModified": "2025-10-06T14:00:00Z"/g,
  '"dateModified": "2026-01-16T14:00:00Z"',
);
html = html.replace(
  /<time datetime="2026-01-06">6 janvier 2025<\/time>/g,
  '<time datetime="2026-01-16">16 janvier 2026</time>',
);
fs.writeFileSync(
  "src/pages/blog/frais-notaire-ancien-neuf-2026.html",
  html,
  "utf8",
);
console.log("✓ frais-notaire-ancien-neuf-2026.html corrigé");

console.log("\n✓ Toutes les dates blog corrigées");
