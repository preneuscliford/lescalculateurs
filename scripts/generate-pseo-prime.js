import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { createRequire } from "module";

import { primeAbsenceRevenuScenarios } from "../data/pseo/prime-absence-revenu-scenarios.js";
import {
  isGeneratedPseoPrimePage,
  renderPrimeScenarioPage,
} from "./lib/pseo/prime-pseo-renderer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const { normalizeFrenchText } = require("./lib/french-normalization.cjs");
const outputDir = path.join(repoRoot, "src", "pages", "prime-activite");
const generatedAt = formatDisplayDate(new Date());

async function loadPrimeEngine() {
  const engineSrc = path.join(repoRoot, "src", "utils", "primeActiviteCalculEngine.ts");
  const tempDir = path.join(repoRoot, "temp", "pseo-prime-engine");
  fs.mkdirSync(tempDir, { recursive: true });
  fs.writeFileSync(
    path.join(tempDir, "package.json"),
    JSON.stringify({ type: "commonjs" }, null, 2),
    "utf8",
  );
  execFileSync(
    process.execPath,
    [
      path.join(repoRoot, "node_modules", "typescript", "bin", "tsc"),
      engineSrc,
      "--outDir",
      tempDir,
      "--module",
      "CommonJS",
      "--target",
      "ES2020",
      "--moduleResolution",
      "node",
      "--resolveJsonModule",
      "true",
      "--esModuleInterop",
      "true",
      "--skipLibCheck",
      "true",
    ],
    { cwd: repoRoot, stdio: "pipe" },
  );
  const compiledPath = path.join(tempDir, "utils", "primeActiviteCalculEngine.js");
  const engine = require(compiledPath);
  fs.rmSync(tempDir, { recursive: true, force: true });
  return engine;
}

function cleanupGeneratedPages(outputRoot, allowedSlugs) {
  if (!fs.existsSync(outputRoot)) return;
  const entries = fs.readdirSync(outputRoot, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(outputRoot, entry.name);
    if (entry.isDirectory()) {
      const indexPath = path.join(entryPath, "index.html");
      if (!fs.existsSync(indexPath)) continue;
      const content = fs.readFileSync(indexPath, "utf8");
      if (isGeneratedPseoPrimePage(content) && !allowedSlugs.has(entry.name)) {
        fs.rmSync(entryPath, { recursive: true, force: true });
      }
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const slug = entry.name.replace(/\.html$/i, "");
    const content = fs.readFileSync(entryPath, "utf8");
    if (isGeneratedPseoPrimePage(content) && !allowedSlugs.has(slug)) {
      fs.rmSync(entryPath, { force: true });
    }
  }
}

async function main() {
  const sanitizedScenarios = primeAbsenceRevenuScenarios.map(sanitizePrimeScenario);
  fs.mkdirSync(outputDir, { recursive: true });
  cleanupGeneratedPages(outputDir, new Set(sanitizedScenarios.map((item) => item.slug)));
  const engine = await loadPrimeEngine();
  const targetConfig = {
    stylesHref: "/tailwind.css",
    mainScriptTag: '<script type="module" src="/main.ts"></script>',
  };

  const enriched = sanitizedScenarios.map((scenario) => {
    const result = engine.calculerPrimeActivite(scenario.input);
    return {
      ...scenario,
      estimate: {
        amount: result.montantEstime,
        formattedAmount: formatApproxEuroSafe(result.montantEstime),
        formattedIncome: formatApproxEuroSafe(scenario.input.revenusProf),
        formattedOtherIncome: formatApproxEuroSafe(scenario.input.autresRevenus),
        eligibility: result.eligibilite,
      },
    };
  });

  for (const scenario of enriched) {
    const relatedPages = enriched.filter((item) => item.slug !== scenario.slug).slice(0, 2);
    const html = renderPrimeScenarioPage({
      scenario,
      estimate: scenario.estimate,
      relatedPages,
      generatedAt,
      targetConfig,
    });

    fs.writeFileSync(path.join(outputDir, `${scenario.slug}.html`), html, "utf8");
    const nestedDir = path.join(outputDir, scenario.slug);
    fs.mkdirSync(nestedDir, { recursive: true });
    fs.writeFileSync(path.join(nestedDir, "index.html"), html, "utf8");
  }

  console.log(`PSEO Prime: ${enriched.length} pages generees dans ${outputDir}`);
}

main();

function formatApproxEuroSafe(value) {
  return `~${(Number(value) || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`;
}

function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
}

function normalizeText(value) {
  if (typeof value !== "string") return value;
  let output = normalizeFrenchText(value, { preserveOuterWhitespace: true });
  const fixes = [
    [/\bscenario\b/gi, "sc\u00e9nario"],
    [/\bscenarios\b/gi, "sc\u00e9narios"],
    [/\bfrequentes\b/gi, "fr\u00e9quentes"],
    [/\bverifier\b/gi, "v\u00e9rifier"],
    [/\bverifiez\b/gi, "v\u00e9rifiez"],
    [/\bcomplete\b/gi, "compl\u00e8te"],
    [/\bcompleter\b/gi, "compl\u00e9ter"],
    [/\bregles\b/gi, "r\u00e8gles"],
    [/\bdecote\b/gi, "d\u00e9cote"],
  ];
  for (const [pattern, replacement] of fixes) {
    output = output.replace(pattern, (match) => {
      const startsUpper = match[0] && match[0] === match[0].toUpperCase();
      if (!startsUpper) return replacement;
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    });
  }
  return output;
}

function sanitizePrimeScenario(scenario) {
  return {
    ...scenario,
    title: normalizeText(scenario.title),
    description: normalizeText(scenario.description),
    summary: normalizeText(scenario.summary),
    audience: normalizeText(scenario.audience),
    checklist: Array.isArray(scenario.checklist)
      ? scenario.checklist.map(normalizeText)
      : scenario.checklist,
    faq: Array.isArray(scenario.faq)
      ? scenario.faq.map((item) => ({
          ...item,
          question: normalizeText(item.question),
          answer: normalizeText(item.answer),
        }))
      : scenario.faq,
  };
}
