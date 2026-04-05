import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { createRequire } from "module";

import { arePilotScenarios } from "../data/pseo/are-pilot-scenarios.js";
import { areAbsenceRevenuScenarios } from "../data/pseo/are-absence-revenu-scenarios.js";
import {
  isGeneratedPseoArePage,
  renderAREScenarioPage,
} from "./lib/pseo/are-pseo-renderer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const outputDir = path.join(repoRoot, "src", "pages", "are");
const generatedAt = formatDisplayDate(new Date());
const areScenarios = [...arePilotScenarios, ...areAbsenceRevenuScenarios];

async function loadAreEngine() {
  const engineSrc = path.join(repoRoot, "src", "utils", "areCalculEngine.ts");
  const tempDir = path.join(repoRoot, "temp", "pseo-are-engine");
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
  const compiledPath = path.join(tempDir, "utils", "areCalculEngine.js");
  const engine = require(compiledPath);
  fs.rmSync(tempDir, { recursive: true, force: true });
  return engine;
}

function getTagScore(left, right) {
  const rightSet = new Set(right);
  return left.reduce((score, tag) => score + (rightSet.has(tag) ? 1 : 0), 0);
}

function buildRelatedMap(scenarios) {
  const relatedMap = new Map();
  for (const scenario of scenarios) {
    const related = scenarios
      .filter((candidate) => candidate.slug !== scenario.slug)
      .map((candidate) => ({ slug: candidate.slug, score: getTagScore(scenario.tags, candidate.tags) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug, "fr"))
      .slice(0, 3)
      .map((item) => item.slug);
    relatedMap.set(scenario.slug, related);
  }
  return relatedMap;
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
      if (isGeneratedPseoArePage(content) && !allowedSlugs.has(entry.name)) {
        fs.rmSync(entryPath, { recursive: true, force: true });
      }
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const slug = entry.name.replace(/\.html$/i, "");
    const content = fs.readFileSync(entryPath, "utf8");
    if (isGeneratedPseoArePage(content) && !allowedSlugs.has(slug)) {
      fs.rmSync(entryPath, { force: true });
    }
  }
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  cleanupGeneratedPages(outputDir, new Set(areScenarios.map((item) => item.slug)));
  const engine = await loadAreEngine();

  const enriched = areScenarios.map((scenario) => {
    const result = engine.calculerARE(scenario.input);
    return {
      ...scenario,
      estimate: {
        amount: result.montantEstime,
        formattedAmount: formatApproxEuro(result.montantEstime),
        formattedSalary: formatApproxEuro(scenario.input.salaireReferent),
        durationLabel: result.eligible
          ? `Duree max indicative : ${result.durationMax} mois`
          : "Situation a verifier",
      },
    };
  });

  const relatedMap = buildRelatedMap(enriched);
  const targetConfig = { stylesHref: "/tailwind.css", mainScriptTag: '<script type="module" src="/content.ts"></script>' };

  for (const scenario of enriched) {
    const relatedPages = (relatedMap.get(scenario.slug) || [])
      .map((slug) => enriched.find((item) => item.slug === slug))
      .filter(Boolean);

    const html = renderAREScenarioPage({
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

  console.log(`PSEO ARE: ${enriched.length} pages generees dans ${outputDir}`);
}

main();

function formatApproxEuro(value) {
  return `~${Math.round(Number(value) || 0).toLocaleString("fr-FR")} €`;
}

function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
}
