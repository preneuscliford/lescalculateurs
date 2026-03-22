#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { repairMojibakeText } = require("./lib/french-normalization.cjs");
const {
  BOM,
  decodeLikelyText,
  detectEncoding,
  isValidUtf8Buffer,
} = require("./lib/utf8-quality.cjs");

function collectHtmlFiles(baseDir) {
  const files = [];
  function traverse(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        files.push(fullPath);
      }
    }
  }
  traverse(baseDir);
  return files;
}

function main() {
  const baseDirs = [
    path.resolve(__dirname, "../content_SAFE"),
    path.resolve(__dirname, "../src/pages"),
  ];

  let totalFiles = 0;
  let changedFiles = 0;
  const changedFilesList = [];

  for (const baseDir of baseDirs) {
    if (!fs.existsSync(baseDir)) {
      console.log(`⚠️  Directory not found : ${baseDir}`);
      continue;
    }

    const htmlFiles = collectHtmlFiles(baseDir);
    console.log(
      `📁 Found ${htmlFiles.length} HTML files in ${path.relative(process.cwd(), baseDir)}`,
    );

    for (const filePath of htmlFiles) {
      totalFiles++;
      try {
        const originalBuffer = fs.readFileSync(filePath);
        const decoded = decodeLikelyText(originalBuffer);
        const repaired = repairMojibakeText(decoded);

        // Check if content changed
        if (repaired !== decoded) {
          fs.writeFileSync(filePath, repaired, "utf8");
          changedFiles++;
          changedFilesList.push(path.relative(process.cwd(), filePath));
          console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
        }
      } catch (err) {
        console.error(
          `❌ Error processing ${path.relative(process.cwd(), filePath)}: ${err.message}`,
        );
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`✨ HTML Mojibake Fix Complete`);
  console.log(`📊 Total HTML files scanned: ${totalFiles}`);
  console.log(`📝 Files with mojibake fixed: ${changedFiles}`);
  console.log(`========================================\n`);

  if (changedFilesList.length > 0) {
    console.log("Changed files:");
    changedFilesList.forEach((f) => console.log(`  - ${f}`));
  }
}

main();
