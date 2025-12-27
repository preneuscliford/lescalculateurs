#!/usr/bin/env node
/**
 * Corrige les URLs dans les JSON-LD de tous les fichiers HTML
 * - Supprime .html des URLs
 * - Supprime index.html et le remplace par /
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readdirSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.resolve(__dirname, "../src/pages");

function fixJsonLdUrls(content) {
  let fixed = content;

  // Supprimer .html des URLs JSON-LD
  fixed = fixed.replace(
    /("item":|"url":|"canonicalUrl":)\s*"([^"]*?)\.html"/g,
    '$1 "$2"'
  );

  // Remplacer /index.html par /
  fixed = fixed.replace(
    /https:\/\/(?:www\.)?lescalculateurs\.fr\/index\.html/g,
    "https://www.lescalculateurs.fr/"
  );

  // Supprimer les extensions .html dans les liens relatifs du breadcrumb et autres
  fixed = fixed.replace(
    /"https:\/\/www\.lescalculateurs\.fr([^"]*?)\.html"/g,
    '"https://www.lescalculateurs.fr$1"'
  );

  // Corriger les og:url et autres meta tags
  fixed = fixed.replace(/content="([^"]*?)\.html"/g, 'content="$1"');

  return fixed;
}

function processHtmlFiles(dir) {
  const files = readdirSync(dir, { recursive: true });
  let fixedCount = 0;

  for (const file of files) {
    if (!file.endsWith(".html")) continue;

    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const fixed = fixJsonLdUrls(content);

    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed, "utf-8");
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    }
  }

  return fixedCount;
}

console.log("🔧 Fixing JSON-LD URLs in HTML files...");
const fixed = processHtmlFiles(pagesDir);
console.log(`\n✅ Completed: ${fixed} file(s) fixed`);
