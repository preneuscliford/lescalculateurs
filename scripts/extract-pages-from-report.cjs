const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// Read the Excel file
const excelFile = path.resolve(__dirname, "../lescalculateurs.fr-Performance-on-Search-2026-03-20.xlsx");

if (!fs.existsSync(excelFile)) {
  console.error(`❌ File not found: ${excelFile}`);
  process.exit(1);
}

console.log(`📖 Reading: ${excelFile}\n`);

// Load workbook
const workbook = XLSX.readFile(excelFile);
console.log(`📊 Sheets found: ${workbook.SheetNames.join(", ")}\n`);

// Get the "Pages" sheet (contains traffic data by page)
const sheetName = workbook.SheetNames.includes("Pages") ? "Pages" : workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`📝 Rows: ${data.length}\n`);
console.log("🔍 Sample of data (first 3 rows):");
for (let i = 0; i < Math.min(3, data.length); i++) {
  console.log(`  ${JSON.stringify(data[i])}`);
}

// Extract page names from URLs
const pages = [];
const srcDir = path.resolve(__dirname, "../content_SAFE");
const urlFieldName = Object.keys(data[0]).find(key => 
  key.toLowerCase().includes("page") || 
  key.toLowerCase().includes("url") ||
  key.toLowerCase().includes("populaire")
);

console.log(`\n🔍 URL field detected: "${urlFieldName}"\n`);

for (const row of data) {
  const urlField = row[urlFieldName];
  
  if (!urlField) continue;

  let pageName = urlField.toString().trim();
  
  // Remove domain if present
  if (pageName.includes("lescalculateurs.fr")) {
    pageName = pageName.split("lescalculateurs.fr")[1] || "";
  }
  
  // Remove "/pages/" prefix and convert to file path
  pageName = pageName.replace(/^\/pages\//, "");
  
  // Convert path to filename
  // "rsa" → "rsa.html"
  // "rsa/qui-a-droit" → "rsa/qui-a-droit.html"
  // "blog/departements/frais-notaire-75" → "blog/departements/frais-notaire-75.html"
  
  if (!pageName || pageName === "/" || pageName === "") {
    pages.push("index.html");
  } else {
    // Remove trailing slash
    pageName = pageName.replace(/\/$/, "");
    
    // Add .html if not present
    if (!pageName.endsWith(".html")) {
      pageName = pageName + ".html";
    }
    
    pages.push(pageName);
  }
}

// Deduplicate
const uniquePages = [...new Set(pages)];

console.log(`\n✅ Extracted ${uniquePages.length} unique pages\n`);
console.log("Pages to scan:");
for (const page of uniquePages.slice(0, 20)) {
  console.log(`  - ${page}`);
}

if (uniquePages.length > 20) {
  console.log(`  ... and ${uniquePages.length - 20} more\n`);
}

// Save to file
const outputFile = path.resolve(__dirname, "../pages-to-scan.json");
fs.writeFileSync(outputFile, JSON.stringify(uniquePages, null, 2), "utf8");

console.log(`\n📄 Saved to: ${outputFile}`);
