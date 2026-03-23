const fs = require("fs");
const path = require("path");

const SRC_DIR = path.resolve(__dirname, "../content_SAFE");
const PAGES_FILE = path.resolve(__dirname, "../pages-to-scan.json");

const pagesToScan = JSON.parse(fs.readFileSync(PAGES_FILE, "utf8"));

function getFilesRecursive(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getFilesRecursive(fullPath));
    } else if (item.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

const allFiles = getFilesRecursive(SRC_DIR);
const fileRelativePaths = allFiles.map(f => path.relative(SRC_DIR, f).toLowerCase());

console.log(`Total files in content_SAFE: ${allFiles.length}`);
console.log(`Pages to scan (from Excel): ${pagesToScan.length}\n`);

let foundCount = 0;
const notFound = [];

for (const page of pagesToScan) {
  const searchPath = page.toLowerCase().replace(/\.html$/, "");
  
  const found = fileRelativePaths.some(filePath => {
    const fileNoExt = filePath.replace(/\.html$/, "");
    return fileNoExt === searchPath || filePath === page;
  });
  
  if (found) {
    foundCount++;
  } else {
    notFound.push(page);
  }
}

console.log(`✅ Found: ${foundCount}`);
console.log(`❌ Not found: ${notFound.length}\n`);

console.log("First 30 pages NOT found:");
for (let i = 0; i < Math.min(30, notFound.length); i++) {
  console.log(`  ${notFound[i]}`);
}

console.log("\n\nAnalyzing patterns in not found pages:");
const patterns = {};
for (const page of notFound) {
  const base = page.split('/')[0].replace('.html', '');
  patterns[base] = (patterns[base] || 0) + 1;
}

for (const [pattern, count] of Object.entries(patterns)) {
  console.log(`  ${pattern}: ${count}`);
}

// Try to find similar files for debugging
console.log("\n\nSample of actual files in content_SAFE:");
const samples = fileRelativePaths.slice(0, 50);
for (const file of samples) {
  console.log(`  ${file}`);
}
