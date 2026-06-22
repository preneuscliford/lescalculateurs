import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { createRequire } from "module";

import { salairePilotScenarios } from "../data/pseo/salaire-pilot-scenarios.js";
import {
  isGeneratedPseoSalairePage,
  renderSalaireScenarioPage,
} from "./lib/pseo/salaire-pseo-renderer.js";

const require = createRequire(import.meta.url);
const { normalizeFrenchText } = require("./lib/french-normalization.cjs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  }),
);

const target = args.get("target") || "src";
const generatedAt = formatDisplayDate(new Date());

function formatEuro(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("fr-FR")} €`;
}

function formatApproxEuro(value) {
  const numeric = Number(value) || 0;
  const sign = numeric < 0 ? "-" : "";
  const absolute = Math.abs(numeric);
  const whole = Math.floor(absolute);
  const cents = Math.round((absolute - whole) * 100)
    .toString()
    .padStart(2, "0");
  return `~${sign}${whole.toLocaleString("fr-FR")},${cents} €`;
}

function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
}

function normalizeSlug(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
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
      .map((candidate) => ({
        slug: candidate.slug,
        score: getTagScore(scenario.tags, candidate.tags),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug, "fr"))
      .slice(0, 4)
      .map((item) => item.slug);
    relatedMap.set(scenario.slug, related);
  }
  return relatedMap;
}

function cleanupGeneratedPages(outputDir, allowedSlugs) {
  if (!fs.existsSync(outputDir)) return;
  const entries = fs.readdirSync(outputDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(outputDir, entry.name);
    if (entry.isDirectory()) {
      const indexPath = path.join(entryPath, "index.html");
      if (!fs.existsSync(indexPath)) continue;
      const content = fs.readFileSync(indexPath, "utf8");
      if (isGeneratedPseoSalairePage(content) && !allowedSlugs.has(entry.name)) {
        fs.rmSync(entryPath, { recursive: true, force: true });
      }
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const slug = entry.name.replace(/\.html$/i, "");
    const content = fs.readFileSync(entryPath, "utf8");
    if (isGeneratedPseoSalairePage(content) && !allowedSlugs.has(slug)) {
      fs.rmSync(entryPath, { force: true });
    }
  }
}

async function loadSalaireEngine() {
  const engineSrc = path.join(repoRoot, "src", "utils", "salaireCalculEngine.ts");
  const tempDir = path.join(repoRoot, "temp", "pseo-engine-salaire");
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
  const compiledPath = path.join(tempDir, "salaireCalculEngine.js");
  const engine = require(compiledPath);
  fs.rmSync(tempDir, { recursive: true, force: true });
  return engine;
}

function getTargetConfig(targetName) {
  if (targetName === "dist") {
    const distRoot = path.join(repoRoot, "dist");
    const assetsDir = path.join(distRoot, "assets");
    if (!fs.existsSync(assetsDir))
      throw new Error("dist/assets introuvable. Lancez d'abord le build Vite.");
    const assetFiles = fs.readdirSync(assetsDir);
    const cssFile = assetFiles.find((item) => item.endsWith(".css"));
    const jsFile =
      assetFiles.find((item) => item.startsWith("main-") && item.endsWith(".js")) ||
      assetFiles.find((item) => item.endsWith(".js"));
    if (!cssFile || !jsFile) throw new Error("Assets CSS/JS introuvables dans dist/assets.");
    return {
      pagesRoot: path.join(distRoot, "pages"),
      stylesHref: `/assets/${cssFile}`,
      mainScriptTag: `<script type="module" crossorigin src="/assets/${jsFile}"></script>`,
    };
  }
  return {
    pagesRoot: path.join(repoRoot, "src", "pages"),
    stylesHref: "/tailwind.css",
    mainScriptTag: '<script type="module" src="/main.ts"></script>',
  };
}

async function main() {
  const scenarios = salairePilotScenarios;
  const engine = await loadSalaireEngine();
  const targetConfig = getTargetConfig(target);
  const outputDir = path.join(targetConfig.pagesRoot, "salaire");
  fs.mkdirSync(outputDir, { recursive: true });

  cleanupGeneratedPages(outputDir, new Set(scenarios.map((s) => normalizeSlug(s.slug))));

  const enriched = scenarios.map((scenario) => {
    const calc = engine.calculerSalaire(scenario.input);
    return {
      ...scenario,
      slug: normalizeSlug(scenario.slug),
      estimate: {
        brut: calc.brut,
        netAvantImpot: calc.netAvantImpot,
        formattedBrut: formatEuro(calc.brut),
        formattedNet: formatApproxEuro(calc.netAvantImpot),
      },
    };
  });

  const relatedMap = buildRelatedMap(enriched);

  for (const scenario of enriched) {
    const relatedPages = (relatedMap.get(scenario.slug) || [])
      .map((slug) => enriched.find((item) => item.slug === slug))
      .filter(Boolean);

    const html = renderSalaireScenarioPage({
      scenario,
      estimate: scenario.estimate,
      relatedPages,
      targetConfig,
      generatedAt,
    });

    const flatPath = path.join(outputDir, `${scenario.slug}.html`);
    const cleanDir = path.join(outputDir, scenario.slug);
    fs.mkdirSync(cleanDir, { recursive: true });
    fs.writeFileSync(flatPath, html, "utf8");
    fs.writeFileSync(path.join(cleanDir, "index.html"), html, "utf8");
  }

  console.log(`PSEO SALAIRE: ${enriched.length} pages generees dans ${outputDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
