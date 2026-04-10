import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { createRequire } from "module";

import { impotPilotScenarios } from "../data/pseo/impot-pilot-scenarios.js";
import {
  isGeneratedPseoImpotPage,
  renderImpotScenarioPage,
} from "./lib/pseo/impot-pseo-renderer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const { normalizeFrenchText } = require("./lib/french-normalization.cjs");
const outputDir = path.join(repoRoot, "src", "pages", "impot");
const generatedAt = formatDisplayDate(new Date());

async function loadIrEngine() {
  const engineSrc = path.join(repoRoot, "src", "utils", "irCalculEngine.ts");
  const tempDir = path.join(repoRoot, "temp", "pseo-impot-engine");
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
  const compiledPath = path.join(tempDir, "irCalculEngine.js");
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
      if (isGeneratedPseoImpotPage(content) && !allowedSlugs.has(entry.name)) {
        fs.rmSync(entryPath, { recursive: true, force: true });
      }
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const slug = entry.name.replace(/\.html$/i, "");
    const content = fs.readFileSync(entryPath, "utf8");
    if (isGeneratedPseoImpotPage(content) && !allowedSlugs.has(slug)) {
      fs.rmSync(entryPath, { force: true });
    }
  }
}

function buildRelatedMap(scenarios) {
  const map = new Map();
  for (const scenario of scenarios) {
    const related = scenarios
      .filter((candidate) => candidate.slug !== scenario.slug)
      .map((candidate) => ({
        slug: candidate.slug,
        score: sharedTagScore(scenario.tags, candidate.tags),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug, "fr"))
      .slice(0, 3)
      .map((item) => item.slug);
    map.set(scenario.slug, related);
  }
  return map;
}

function sharedTagScore(left, right) {
  const rightSet = new Set(right);
  return left.reduce((acc, tag) => acc + (rightSet.has(tag) ? 1 : 0), 0);
}

async function main() {
  const sanitizedScenarios = impotPilotScenarios.map(sanitizeImpotScenario);
  fs.mkdirSync(outputDir, { recursive: true });
  cleanupGeneratedPages(outputDir, new Set(sanitizedScenarios.map((item) => item.slug)));

  const engine = await loadIrEngine();
  const targetConfig = { stylesHref: "/tailwind.css", mainScriptTag: '<script type="module" src="/content.ts"></script>' };

  const enriched = sanitizedScenarios.map((scenario) => {
    const result = engine.calculerIR({
      revenu: scenario.input.revenu,
      parts: scenario.input.parts,
    });

    return {
      ...scenario,
      estimate: {
        amount: result.irBrut,
        formattedAmount: formatApproxEuro(result.irBrut),
        formattedMensualite: formatApproxEuro(result.mensualiteMoyenne),
        formattedRevenu: formatApproxEuro(scenario.input.revenu),
        formattedParts: String(scenario.input.parts).replace(".", ","),
        formattedTauxMoyen: `${(result.tauxMoyen * 100).toFixed(1).replace(".", ",")} %`,
        formattedTauxMarginal: `${(result.tauxMarginal * 100).toFixed(0)} %`,
      },
    };
  });

  const relatedMap = buildRelatedMap(enriched);

  for (const scenario of enriched) {
    const relatedPages = (relatedMap.get(scenario.slug) || [])
      .map((slug) => enriched.find((item) => item.slug === slug))
      .filter(Boolean);

    const html = renderImpotScenarioPage({
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

  console.log(`PSEO Impot: ${enriched.length} pages generees dans ${outputDir}`);
}

main();

function formatApproxEuro(value) {
  return `~${Math.round(Number(value) || 0).toLocaleString("fr-FR")} EUR`;
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
    [/\bcelibataire\b/gi, "c\u00e9libataire"],
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

function sanitizeImpotScenario(scenario) {
  const preserveInitialCase = (source, normalized) => {
    if (typeof source !== "string" || typeof normalized !== "string") return normalized;
    const firstSource = source.trimStart().charAt(0);
    const firstNormalized = normalized.trimStart().charAt(0);
    if (!firstSource || !firstNormalized) return normalized;
    const sourceUpper = firstSource === firstSource.toUpperCase();
    const normalizedLower = firstNormalized === firstNormalized.toLowerCase();
    if (!sourceUpper || !normalizedLower) return normalized;
    return normalized.replace(firstNormalized, firstNormalized.toUpperCase());
  };

  return {
    ...scenario,
    title: normalizeText(scenario.title),
    description: normalizeText(scenario.description),
    summary: normalizeText(scenario.summary),
    audience: normalizeText(scenario.audience),
    checklist: Array.isArray(scenario.checklist)
      ? scenario.checklist.map((item) => preserveInitialCase(item, normalizeText(item)))
      : scenario.checklist,
    faq: Array.isArray(scenario.faq)
      ? scenario.faq.map((item) => ({
          ...item,
          question: preserveInitialCase(item.question, normalizeText(item.question)),
          answer: preserveInitialCase(item.answer, normalizeText(item.answer)),
        }))
      : scenario.faq,
  };
}
