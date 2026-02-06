#!/usr/bin/env node
/**
 * Correction automatique UTF-8 pour le build
 * Corrige les problèmes d'encodage dans les fichiers HTML/JS/TS
 */

const fs = require("fs");
const path = require("path");

const TARGET_DIRS = [
  "content_SAFE",
  "pages_YMYL_SAFE",
  "pages_YMYL_FINAL",
  "src/pages"
];

const EXCLUDE_FILES = [
  ".git",
  "node_modules",
  ".vercel"
];

// Mapping des caractères Latin-1 vers UTF-8
const LATIN1_TO_UTF8 = [
  { pattern: /Ã©/g, replacement: "é" },
  { pattern: /Ã¨/g, replacement: "è" },
  { pattern: /Ã /g, replacement: "à" },
  { pattern: /Ã´/g, replacement: "ô" },
  { pattern: /Ãª/g, replacement: "ê" },
  { pattern: /Ã»/g, replacement: "û" },
  { pattern: /Ã¹/g, replacement: "ù" },
  { pattern: /Ã®/g, replacement: "î" },
  { pattern: /Ã¯/g, replacement: "ï" },
  { pattern: /Ã§/g, replacement: "ç" },
  { pattern: /Å“/g, replacement: "œ" },
  { pattern: /Å’/g, replacement: "Œ" },
  { pattern: /Ã€/g, replacement: "À" },
  { pattern: /Ã‰/g, replacement: "É" },
  { pattern: /Ãˆ/g, replacement: "È" },
  { pattern: /â€œ/g, replacement: '"' },
  { pattern: /â€�/g, replacement: '"' },
  { pattern: /â€™/g, replacement: "'" },
  { pattern: /â€¦/g, replacement: "…" },
  { pattern: /â€“/g, replacement: "–" },
  { pattern: /â€”/g, replacement: "—" }
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  let original = content;
  let fixCount = 0;
  
  // Supprimer le BOM s'il existe
  if (content.startsWith("\uFEFF")) {
    content = content.substring(1);
    fixCount++;
  }
  
  // Corriger les caractères Latin-1
  for (const { pattern, replacement } of LATIN1_TO_UTF8) {
    const matches = content.match(pattern);
    if (matches) {
      fixCount += matches.length;
      content = content.replace(pattern, replacement);
    }
  }
  
  // Sauvegarder si modifié
  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    return { fixed: true, count: fixCount };
  }
  
  return { fixed: false, count: 0 };
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_FILES.includes(file)) {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith(".html") || file.endsWith(".js") || file.endsWith(".ts")) {
      callback(filePath);
    }
  }
}

function main() {
  console.log("🔧 Correction UTF-8 des fichiers...\n");
  
  let filesFixed = 0;
  let filesChecked = 0;
  let totalFixes = 0;
  
  for (const dir of TARGET_DIRS) {
    const fullPath = path.resolve(process.cwd(), dir);
    
    if (!fs.existsSync(fullPath)) {
      continue;
    }
    
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, (filePath) => {
        filesChecked++;
        const result = fixFile(filePath);
        if (result.fixed) {
          filesFixed++;
          totalFixes += result.count;
          console.log(`✅ ${path.relative(process.cwd(), filePath)}: ${result.count} corrections`);
        }
      });
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Fichiers vérifiés: ${filesChecked}`);
  console.log(`Fichiers corrigés: ${filesFixed}`);
  console.log(`Corrections totales: ${totalFixes}`);
  console.log(`${'='.repeat(50)}`);
  
  if (filesFixed > 0) {
    console.log("\n💡 Exécutez 'npm run build' pour continuer le build.");
  }
}

main();
