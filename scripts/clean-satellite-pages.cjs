const fs = require("fs");
const path = require("path");
const { readTextFile, writeTextFile } = require("./encoding.cjs");

const rootDir = path.resolve(__dirname, "..");

const TARGET_DIRS = {
  src: ["src/pages/simulateurs", "src/pages/aide"],
  dist: ["dist/pages/simulateurs", "dist/pages/aide"],
  all: [
    "src/pages/simulateurs",
    "src/pages/aide",
    "dist/pages/simulateurs",
    "dist/pages/aide",
  ],
};

const STRING_REPLACEMENTS = [
  ["Quelles aides ai-je droit ?", "À quelles aides ai-je droit ?"],
  [
    "Réponse à la question : À quelles aides ai-je droit ?.",
    "Réponse à la question : À quelles aides ai-je droit ?",
  ],
  [
    "Question traitée : À quelles aides ai-je droit.",
    "Question traitée : À quelles aides ai-je droit ?",
  ],
  [
    "📄 Lire aussi : Quelles aides ai-je droit ?",
    "📄 Lire aussi : À quelles aides ai-je droit ?",
  ],
];

const REGEX_REPLACEMENTS = [
  [
    /<li>(Les [^<]{30,})<\/li>\s*<\/ul>/g,
    "</ul>",
  ],
];

function getArgValue(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((entry) => entry.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
}

function walkHtmlFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(fullPath, out);
      continue;
    }
    if (entry.name.endsWith(".html")) out.push(fullPath);
  }
  return out;
}

function cleanFile(filePath) {
  const original = readTextFile(filePath);
  let next = original;

  for (const [search, replacement] of STRING_REPLACEMENTS) {
    next = next.split(search).join(replacement);
  }

  for (const [pattern, replacement] of REGEX_REPLACEMENTS) {
    next = next.replace(pattern, replacement);
  }

  if (next === original) return false;
  writeTextFile(filePath, next);
  return true;
}

function main() {
  const target = getArgValue("target", "src");
  const dirs = TARGET_DIRS[target] || TARGET_DIRS.src;
  const files = dirs.flatMap((dir) => walkHtmlFiles(path.join(rootDir, dir)));

  let updated = 0;
  for (const file of files) {
    if (cleanFile(file)) updated += 1;
  }

  console.log(
    `Nettoyage satellites ${target}: ${updated} fichier(s) mis à jour sur ${files.length}`,
  );
}

main();
