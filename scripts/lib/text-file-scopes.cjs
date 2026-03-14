const fs = require("fs");
const path = require("path");

const TEXT_EXTENSIONS = new Set([
  ".html",
  ".js",
  ".cjs",
  ".mjs",
  ".ts",
  ".json",
  ".md",
  ".xml",
  ".txt",
]);

const LT_EXTENSIONS = new Set([".html", ".md", ".txt"]);

const SCOPE_CONFIG = {
  "pseo-source": [
    "data/pseo",
    "scripts/lib/pseo",
    "scripts/generate-pseo-apl.js",
    "scripts/generate-pseo-rsa.js",
    "scripts/generate-pseo-are.js",
  ],
  "pseo-rendered": ["src/pages/apl", "src/pages/rsa", "src/pages/are"],
  pseo: [
    "data/pseo",
    "scripts/lib/pseo",
    "scripts/generate-pseo-apl.js",
    "scripts/generate-pseo-rsa.js",
    "scripts/generate-pseo-are.js",
    "src/pages/apl",
    "src/pages/rsa",
    "src/pages/are",
    "docs/PSEO-CONSOLIDATION-PLAYBOOK.md",
  ],
  full: ["src", "data", "scripts", "docs", "public"],
};

function walkDir(rootDir, files) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "dist") {
      continue;
    }

    const absolutePath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      walkDir(absolutePath, files);
      continue;
    }

    if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath);
    }
  }
}

function collectFiles(scope = "pseo") {
  const configured = SCOPE_CONFIG[scope] || SCOPE_CONFIG.pseo;
  const resolved = new Set();

  for (const relativeTarget of configured) {
    const absoluteTarget = path.resolve(process.cwd(), relativeTarget);
    if (!fs.existsSync(absoluteTarget)) continue;

    const stat = fs.statSync(absoluteTarget);
    if (stat.isDirectory()) {
      const files = [];
      walkDir(absoluteTarget, files);
      for (const file of files) resolved.add(file);
      continue;
    }

    if (TEXT_EXTENSIONS.has(path.extname(absoluteTarget).toLowerCase())) {
      resolved.add(absoluteTarget);
    }
  }

  return Array.from(resolved).sort();
}

function collectLanguageToolFiles(scope = "pseo-rendered") {
  return collectFiles(scope).filter((filePath) =>
    LT_EXTENSIONS.has(path.extname(filePath).toLowerCase()),
  );
}

module.exports = {
  collectFiles,
  collectLanguageToolFiles,
};
