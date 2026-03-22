/**
 * Script de mise a jour de la page plus-value immobiliere
 * 2025 → 2026
 */

const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../src/pages/plusvalue.html");

let content = fs.readFileSync(filePath, "utf8");

// Remplacements 2025 → 2026
content = content.replace(
  /Plus-value Immobiliere 2025/g,
  "Plus-value Immobiliere 2026",
);
content = content.replace(
  /plus-value immobiliere 2025/g,
  "plus-value immobiliere 2026",
);
content = content.replace(
  /Plus-Value Immobiliere 2025/g,
  "Plus-Value Immobiliere 2026",
);
content = content.replace(/abattements 2025/gi, "abattements 2026");
content = content.replace(/Abattements 2025/g, "Abattements 2026");
content = content.replace(/baremes 2025/g, "baremes 2026");
content = content.replace(
  /reglementation fiscale 2025/g,
  "reglementation fiscale 2026",
);
content = content.replace(/exonerations 2025/g, "exonerations 2026");

// Ne PAS changer les max date (max="2025-12-31" reste valide pour les dates de vente passees)

fs.writeFileSync(filePath, content, "utf8");

console.log("✅ Page plusvalue.html mise a jour vers 2026");
