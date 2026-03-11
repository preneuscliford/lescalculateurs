import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";

import { arePilotScenarios } from "../data/pseo/are-pilot-scenarios.js";
import {
  isGeneratedPseoArePage,
  renderAREScenarioPage,
} from "./lib/pseo/are-pseo-renderer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "src", "pages", "are");
const generatedAt = new Date().toISOString().slice(0, 10);

async function loadAreEngine() {
  const engineSrc = path.join(repoRoot, "src", "utils", "areCalculEngine.ts");
  const tempDir = path.join(repoRoot, "temp", "pseo-are-engine");
  fs.mkdirSync(tempDir, { recursive: true });
  execFileSync(
    process.execPath,
    [
      path.join(repoRoot, "node_modules", "typescript", "bin", "tsc"),
      engineSrc,
      "--outDir",
      tempDir,
      "--module",
      "ES2020",
      "--target",
      "ES2020",
      "--moduleResolution",
      "node",
      "--skipLibCheck",
      "true",
    ],
    { cwd: repoRoot, stdio: "pipe" },
  );
  const compiledPath = path.join(tempDir, "areCalculEngine.js");
  const engine = await import(`${pathToFileURL(compiledPath).href}?v=${Date.now()}`);
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
  cleanupGeneratedPages(outputDir, new Set(arePilotScenarios.map((item) => item.slug)));
  const engine = await loadAreEngine();

  const enriched = arePilotScenarios.map((scenario) => {
    const result = engine.calculerARE(scenario.input);
    return {
      ...scenario,
      estimate: {
        amount: result.montantEstime,
        formattedAmount: `~${Math.round(result.montantEstime)} EUR`,
        formattedSalary: `${Math.round(scenario.input.salaireReferent)} EUR`,
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
