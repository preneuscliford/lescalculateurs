#!/usr/bin/env node
/**
 * Script pour identifier TOUTES les mentions "2025" sur TOUS les pages
 * Scan recursif complet du site
 */

const fs = require("fs");
const path = require("path");

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith(".html")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const pagesDir = path.resolve(process.cwd(), "src/pages");
const htmlFiles = getAllHtmlFiles(pagesDir);

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🔍 SCAN RECURSIF - Toutes les Pages (${htmlFiles.length} fichiers)       ║
╚════════════════════════════════════════════════════════════════╝
`);

let fileStats = [];
let grandTotal = {
  seo: 0,
  visible: 0,
  data: 0,
};

htmlFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  if (!content.includes("2025")) return; // Skip files without 2025

  const lines = content.split("\n");
  const relativePath = path.relative(process.cwd(), filePath);

  const matches = {
    seo: 0,
    visible: 0,
    data: 0,
  };

  lines.forEach((line) => {
    if (!line.includes("2025")) return;

    if (
      line.includes("<meta") ||
      line.includes('"headline"') ||
      line.includes('"description"') ||
      line.includes("<title>") ||
      line.includes('property="og:')
    ) {
      matches.seo++;
      grandTotal.seo++;
    } else if (
      line.includes("bareme") ||
      line.includes("emolument") ||
      line.includes("tranches") ||
      line.includes("taux") ||
      line.includes("0.0387") ||
      line.includes("0.01596") ||
      line.includes("effective_date")
    ) {
      matches.data++;
      grandTotal.data++;
    } else if (
      line.includes("<h") ||
      line.includes("<p") ||
      line.includes("<span") ||
      line.includes("&copy;")
    ) {
      matches.visible++;
      grandTotal.visible++;
    }
  });

  const total = matches.seo + matches.visible + matches.data;
  if (total > 0) {
    fileStats.push({
      path: relativePath,
      ...matches,
      total,
    });
  }
});

// Trier par nombre total decroissant
fileStats.sort((a, b) => b.total - a.total);

console.log(`\n📊 PAGES AVEC MENTIONS "2025" (${fileStats.length} pages)\n`);
console.log(`${"Fichier".padEnd(50)} | SEO | VIS | DAT | Total`);
console.log(`${"-".repeat(80)}`);

fileStats.forEach((stat) => {
  const fileName = stat.path.replace(/^src\/pages\//, "").padEnd(48);
  console.log(
    `${fileName} | ${stat.seo.toString().padStart(3)} | ${stat.visible
      .toString()
      .padStart(3)} | ${stat.data.toString().padStart(3)} | ${stat.total
      .toString()
      .padStart(4)}`
  );
});

console.log(`${"-".repeat(80)}`);
console.log(
  `TOTAL${" ".repeat(45)} | ${grandTotal.seo
    .toString()
    .padStart(3)} | ${grandTotal.visible
    .toString()
    .padStart(3)} | ${grandTotal.data
    .toString()
    .padStart(3)} | ${(
    grandTotal.seo +
    grandTotal.visible +
    grandTotal.data
  )
    .toString()
    .padStart(4)}`
);

console.log(`
${"═".repeat(80)}

📋 RESUME:

   Pages avec mentions: ${fileStats.length}
   Total fichiers HTML: ${htmlFiles.length}

   A MODIFIER (SEO + Visible):
   🔍 SEO: ${grandTotal.seo} occurrences (2025 → 2026)
   👁️  Contenu: ${grandTotal.visible} occurrences (2025 → 2026)
   
   A LAISSER INTACTES:
   📊 Donnees officielles: ${grandTotal.data} occurrences

${"═".repeat(80)}

🎯 ESTIMATION:

   Total modifications: ${grandTotal.seo + grandTotal.visible}
   Fichiers a traiter: ${fileStats.length}
   
   Priorite 1 (Notaire/Impot/Salaire): ${fileStats
     .filter((f) =>
       f.path.includes(
         "notaire|impot|salaire|plusvalue|apl|ik|pret|charges|taxe"
       )
     )
     .reduce((sum, f) => sum + f.seo + f.visible, 0)} modifications

${"═".repeat(80)}

📌 PROCHAINE ETAPE:

   Creer un script de replacement automatique pour janvier 2026
   Remplacer "2025" → "2026" UNIQUEMENT dans:
   ✓ SEO metadata
   ✓ Contenu visible (titres, texte)
   ✗ PAS les donnees officielles

${"═".repeat(80)}
`);
