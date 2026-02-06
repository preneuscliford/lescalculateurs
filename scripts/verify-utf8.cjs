#!/usr/bin/env node
/**
 * Vérification UTF-8 pré-build
 * Bloque le build si des caractères de remplacement ou BOM sont détectés
 */

const fs = require("fs");
const path = require("path");

const REPLACEMENT_CHAR = "\uFFFD"; // �
const BOM = "\uFEFF";

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

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const issues = [];
  
  // Vérifier le BOM
  if (content.startsWith(BOM)) {
    issues.push({ type: "BOM", line: 1, preview: "Fichier commence par BOM UTF-8" });
  }
  
  // Vérifier les caractères de remplacement
  const lines = content.split("\n");
  lines.forEach((line, index) => {
    if (line.includes(REPLACEMENT_CHAR)) {
      const pos = line.indexOf(REPLACEMENT_CHAR);
      const preview = line.substring(Math.max(0, pos - 20), Math.min(line.length, pos + 20));
      issues.push({ type: "REPLACEMENT", line: index + 1, preview });
    }
  });
  
  // Vérifier les caractères Latin-1 mal encodés
  const latin1Patterns = [
    { pattern: /Ã©/g, char: "é" },
    { pattern: /Ã¨/g, char: "è" },
    { pattern: /Ã /g, char: "à" },
    { pattern: /Ã´/g, char: "ô" },
    { pattern: /Ãª/g, char: "ê" },
    { pattern: /Ã»/g, char: "û" },
    { pattern: /Ã¹/g, char: "ù" },
    { pattern: /Ã®/g, char: "î" },
    { pattern: /Ã¯/g, char: "ï" },
    { pattern: /Ã§/g, char: "ç" },
    { pattern: /Å“/g, char: "œ" },
    { pattern: /Å’/g, char: "Œ" }
  ];
  
  latin1Patterns.forEach(({ pattern, char }) => {
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        issues.push({ 
          type: "LATIN1", 
          line: index + 1, 
          preview: `Caractère '${char}' mal encodé (Latin-1)`,
          char 
        });
      }
    });
  });
  
  return issues;
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
  console.log("🔍 Vérification UTF-8 des fichiers...\n");
  
  const allIssues = [];
  let filesChecked = 0;
  
  for (const dir of TARGET_DIRS) {
    const fullPath = path.resolve(process.cwd(), dir);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  Dossier ignoré (non trouvé): ${dir}`);
      continue;
    }
    
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, (filePath) => {
        filesChecked++;
        const issues = checkFile(filePath);
        if (issues.length > 0) {
          allIssues.push({ file: filePath, issues });
        }
      });
    }
  }
  
  // Afficher les résultats
  if (allIssues.length === 0) {
    console.log(`✅ Tous les fichiers sont propres (${filesChecked} vérifiés)`);
    process.exit(0);
  } else {
    console.error(`❌ ${allIssues.length} fichier(s) avec des problèmes d'encodage:\n`);
    
    for (const { file, issues } of allIssues) {
      console.error(`📄 ${path.relative(process.cwd(), file)}:`);
      for (const issue of issues.slice(0, 5)) { // Limiter à 5 issues par fichier
        console.error(`   Ligne ${issue.line}: [${issue.type}] ${issue.preview}`);
      }
      if (issues.length > 5) {
        console.error(`   ... et ${issues.length - 5} autres problèmes`);
      }
      console.error("");
    }
    
    console.error("\n💡 Pour corriger, exécutez: node fix-utf8-all-pages.py");
    console.error("🚫 Build interrompu à cause des erreurs d'encodage.");
    process.exit(1);
  }
}

main();
