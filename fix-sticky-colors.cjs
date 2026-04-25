#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const blogDepsDir = path.join(process.cwd(), "src/pages/blog/departements");

const files = fs
  .readdirSync(blogDepsDir)
  .filter((f) => f.startsWith("frais-notaire-") && f.endsWith(".html"));

console.log(`Found ${files.length} files to process...`);

let count = 0;
files.forEach((file) => {
  const filePath = path.join(blogDepsDir, file);
  let content = fs.readFileSync(filePath, "utf-8");

  // Check if already has color
  if (content.includes("color:#1f2937")) {
    return; // Already fixed
  }

  // Match sticky-ymyl divs and add color to style attribute
  if (content.includes("sticky-ymyl")) {
    // Replace the closing quote of style attribute with ;color:#1f2937;"
    content = content.replace(
      /class="sticky-ymyl"([^>]*?)style="([^"]*?)"/g,
      (match, beforeStyle, styleContent) => {
        if (styleContent.includes("color:")) {
          return match;
        }
        return `class="sticky-ymyl"${beforeStyle}style="${styleContent}color:#1f2937;"`;
      },
    );

    fs.writeFileSync(filePath, content);
    count++;
  }
});

console.log(`✅ Fixed ${count} files`);
