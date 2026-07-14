#!/usr/bin/env node
/**
 * Batch fix entités HTML mal formées : &eacute → &eacute; etc.
 */
const fs = require("fs");
const path = require("path");

const SRC = path.resolve(__dirname, "..", "src", "pages");

const ENTITY_FIXES = {
  "&eacute": "&eacute;",
  "&egrave": "&egrave;",
  "&ecirc": "&ecirc;",
  "&ocirc": "&ocirc;",
  "&agrave": "&agrave;",
  "&acirc": "&acirc;",
  "&ucirc": "&ucirc;",
  "&icirc": "&icirc;",
  "&rsquo": "&rsquo;",
  "&lsquo": "&lsquo;",
  "&laquo": "&laquo;",
  "&raquo": "&raquo;",
  "&nbsp": "&nbsp;",
};

function collect(dir) {
  const res = [];
  if (!fs.existsSync(dir)) return res;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "scripts") res.push(...collect(full));
    else if (e.isFile() && e.name.endsWith(".html")) res.push(full);
  }
  return res;
}

const files = collect(SRC);
let totalFixed = 0;
let totalFiles = 0;

for (const fp of files) {
  let content = fs.readFileSync(fp, "utf-8");
  const original = content;
  let fileCount = 0;

  for (const [bad, good] of Object.entries(ENTITY_FIXES)) {
    const re = new RegExp(bad + "(?!;)", "gi");
    const matches = content.match(re);
    if (matches) {
      content = content.replace(re, good);
      fileCount += matches.length;
    }
  }

  if (content !== original) {
    totalFiles++;
    totalFixed += fileCount;
    fs.writeFileSync(fp, content, "utf-8");
    console.log(`  ✓ ${path.relative(SRC, fp)} (${fileCount} entités)`);
  }
}

console.log(`\nFichiers corrigés: ${totalFiles} | Entités réparées: ${totalFixed}`);
