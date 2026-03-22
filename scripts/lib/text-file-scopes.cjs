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

const PSEO_SOURCE_PATHS = [
  "data/pseo",
  "scripts/lib/pseo",
  "scripts/lib/french-normalization.cjs",
  "scripts/lib/html-text-utils.cjs",
  "scripts/lib/text-file-scopes.cjs",
  "scripts/lib/utf8-quality.cjs",
  "scripts/generate-pseo-apl.js",
  "scripts/generate-pseo-rsa.js",
  "scripts/generate-pseo-are.js",
  "scripts/generate-pseo-asf.js",
  "scripts/generate-pseo-prime.js",
  "scripts/generate-pseo-simulateurs.js",
  "scripts/normalize-french-text.cjs",
  "scripts/check-french-with-languagetool.cjs",
  "scripts/verify-utf8.cjs",
  "scripts/fix-utf8-build.cjs",
];

const PSEO_RENDERED_PATHS = [
  "src/pages/apl",
  "src/pages/rsa",
  "src/pages/are",
  "src/pages/asf",
  "src/pages/prime-activite",
  "src/pages/simulateurs",
];

const SIMULATEURS_RENDERED_PATHS = ["src/pages/simulateurs", "src/pages/simulateurs.html"];

const PILLARS_RENDERED_PATHS = [
  "src/pages/apl.html",
  "src/pages/are.html",
  "src/pages/rsa.html",
  "src/pages/asf.html",
  "src/pages/prime-activite.html",
  "src/pages/notaire.html",
  "src/pages/impot.html",
  "src/pages/salaire.html",
  "src/pages/taxe.html",
  "src/pages/charges.html",
  "src/pages/simulateurs.html",
];

const SITE_RENDERED_PATHS = ["src/pages", "src/404.html"];
const FRENCH_PILOT_20_PATHS = [
  "src/pages/apl.html",
  "src/pages/are.html",
  "src/pages/rsa.html",
  "src/pages/asf.html",
  "src/pages/prime-activite.html",
  "src/pages/notaire.html",
  "src/pages/impot.html",
  "src/pages/simulateurs/quelle-aide-selon-mon-profil-2026.html",
  "src/pages/simulateurs/quelles-aides-sans-revenu.html",
  "src/pages/blog/departements/frais-notaire-56.html",
  "src/pages/apl/apl-celibataire-smic/index.html",
  "src/pages/apl/apl-chomage-loyer-moyen/index.html",
  "src/pages/apl/apl-couple-sans-enfant/index.html",
  "src/pages/apl/apl-personne-seule-smic/index.html",
  "src/pages/apl/apl-smic-seul/index.html",
  "src/pages/apl/apl-chomage-personne-seule/index.html",
  "src/pages/are/montant-are-2026.html",
  "src/pages/are/are-fin-de-droits-quelles-aides.html",
  "src/pages/rsa/rsa-sans-revenu-personne-seule.html",
  "src/pages/rsa/rsa-couple-sans-enfant.html",
];

const PSEO_DOCS_PATHS = [
  "docs/PSEO-CONSOLIDATION-PLAYBOOK.md",
  "docs/GROWTH-SIGNALS-PLAYBOOK.md",
  "docs/QUALITY-GATES.md",
];

const SCOPE_CONFIG = {
  "priority-pages": [
    "src/pages/are.html",
    "src/pages/apl.html",
    "src/pages/rsa.html",
    "src/pages/prime-activite.html",
    "src/pages/asf.html",
    "src/pages/notaire.html",
    "src/pages/blog/frais-notaire-ancien-neuf-2026.html",
    "src/pages/blog/frais-notaire-departements.html",
    "src/pages/blog/departements/frais-notaire-56.html",
    "src/pages/blog/departements/frais-notaire-38.html",
    "src/pages/blog/departements/frais-notaire-06.html",
    "src/pages/apl/apl-celibataire-smic/index.html",
  ],
  "pseo-source": PSEO_SOURCE_PATHS,
  "simulateurs-rendered": SIMULATEURS_RENDERED_PATHS,
  "pillars-rendered": PILLARS_RENDERED_PATHS,
  "pseo-rendered": PSEO_RENDERED_PATHS,
  "site-rendered": SITE_RENDERED_PATHS,
  "french-pilot-20": FRENCH_PILOT_20_PATHS,
  pseo: [...PSEO_SOURCE_PATHS, ...PSEO_RENDERED_PATHS, ...PSEO_DOCS_PATHS],
  "publish-pseo": [...PSEO_SOURCE_PATHS, ...PSEO_RENDERED_PATHS, ...PSEO_DOCS_PATHS],
  repo: ["src", "data", "scripts", "docs", "public"],
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
  SCOPE_CONFIG,
};
