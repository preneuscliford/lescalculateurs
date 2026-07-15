#!/usr/bin/env node
/**
 * Diagnostique les pages avec des éléments HTML hors de la structure <html>...</html>
 * Problème : du contenu HTML placé avant <!doctype> ou après </html>
 */
const fs = require("fs");
const path = require("path");

const SRC_PAGES = path.resolve(__dirname, "..", "src", "pages");

function collectHtmlFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "scripts" && !e.name.startsWith(".")) {
      results.push(...collectHtmlFiles(full));
    } else if (e.isFile() && e.name.endsWith(".html")) {
      results.push(full);
    }
  }
  return results;
}

function diagnoseFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch (e) {
    return { file: filePath, error: e.message };
  }

  const issues = [];

  // 1. Vérifier le DOCTYPE
  const hasDoctype = /<!doctype/i.test(content.slice(0, 200));
  if (!hasDoctype) {
    issues.push("DOCTYPE manquant ou pas en début de fichier");
  }

  // 2. Contenu avant <!doctype ou <html
  const firstHtmlTag = content.search(/<(!doctype|html)/i);
  const beforeHtml = content.slice(0, Math.max(0, firstHtmlTag)).trim();
  if (beforeHtml.length > 0) {
    const preview = beforeHtml.replace(/\s+/g, " ").slice(0, 100);
    issues.push(`Contenu avant DOCTYPE/html: "${preview}"`);
  }

  // 3. Contenu après </html>
  const closeHtmlIdx = content.lastIndexOf("</html>");
  if (closeHtmlIdx === -1) {
    issues.push("Balise </html> MANQUANTE");
    return { file: filePath, issues, critical: true };
  }

  const afterClose = content.slice(closeHtmlIdx + 7).trim();
  if (afterClose.length > 0) {
    const lines = afterClose.split("\n").filter((l) => l.trim());
    const preview = afterClose.replace(/\s+/g, " ").slice(0, 200);
    issues.push(`Contenu après </html> (${lines.length} lignes): "${preview}"`);
  }

  // 4. Double <html> ou doublons structurels
  const openHtmlCount = (content.match(/<html[^>]*>/gi) || []).length;
  const closeHtmlCount = (content.match(/<\/html>/gi) || []).length;
  const openBodyCount = (content.match(/<body[^>]*>/gi) || []).length;
  const closeBodyCount = (content.match(/<\/body>/gi) || []).length;
  const openHeadCount = (content.match(/<head\b[^>]*>/gi) || []).length;
  const closeHeadCount = (content.match(/<\/head>/gi) || []).length;

  if (openHtmlCount > 1) issues.push(`Multiple <html> (${openHtmlCount})`);
  if (closeHtmlCount > 1) issues.push(`Multiple </html> (${closeHtmlCount})`);
  if (openBodyCount > 1) issues.push(`Multiple <body> (${openBodyCount})`);
  if (openHeadCount > 1) issues.push(`Multiple <head> (${openHeadCount})`);
  if (openHtmlCount !== closeHtmlCount)
    issues.push(`<html>/</html> mismatch: ${openHtmlCount}/${closeHtmlCount}`);
  if (openBodyCount !== closeBodyCount)
    issues.push(`<body>/</body> mismatch: ${openBodyCount}/${closeBodyCount}`);

  return {
    file: filePath,
    issues,
    critical: issues.length > 0,
    afterCloseLines: afterClose.length > 0 ? afterClose.substring(0, 500) : null,
  };
}

// MAIN
const files = collectHtmlFiles(SRC_PAGES);
console.log(`🔍 Analyse structurelle de ${files.length} pages...\n`);

const results = files.map((f) => diagnoseFile(f)).filter((r) => r.critical);

console.log(`⚠️  ${results.length} pages avec problèmes structurels :\n`);
console.log("=".repeat(80));

for (const r of results) {
  const relPath = path.relative(SRC_PAGES, r.file);
  console.log(`\n📄 ${relPath}`);
  for (const issue of r.issues) {
    console.log(`   ❌ ${issue}`);
  }
  if (r.afterCloseLines) {
    console.log(`   📋 Contenu après </html> :`);
    console.log(`   ${"-".repeat(60)}`);
    r.afterCloseLines
      .split("\n")
      .slice(0, 8)
      .forEach((l) => console.log(`   | ${l.trim().slice(0, 120)}`));
  }
}

console.log("\n" + "=".repeat(80));
console.log(`Total: ${results.length} pages à corriger sur ${files.length} scannées`);

// Grouper par pattern de contenu après </html>
const patterns = {};
for (const r of results) {
  if (r.afterCloseLines) {
    const key = r.afterCloseLines.trim().slice(0, 60);
    if (!patterns[key]) patterns[key] = [];
    patterns[key].push(path.relative(SRC_PAGES, r.file));
  }
}

if (Object.keys(patterns).length > 0) {
  console.log("\n📊 Regroupement par contenu après </html> :");
  for (const [pattern, pages] of Object.entries(patterns)) {
    console.log(`\n   Pattern: "${pattern}"`);
    console.log(`   ${pages.length} pages`);
    pages.slice(0, 5).forEach((p) => console.log(`     - ${p}`));
    if (pages.length > 5) console.log(`     ... et ${pages.length - 5} autres`);
  }
}
