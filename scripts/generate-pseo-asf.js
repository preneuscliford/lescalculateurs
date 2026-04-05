import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { createRequire } from "module";

import { asfAbsenceRevenuScenarios } from "../data/pseo/asf-absence-revenu-scenarios.js";
import {
  isGeneratedPseoAsfPage,
  renderASFScenarioPage,
} from "./lib/pseo/asf-pseo-renderer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const outputDir = path.join(repoRoot, "src", "pages", "asf");
const generatedAt = formatDisplayDate(new Date());

async function loadAsfEngine() {
  const engineSrc = path.join(repoRoot, "src", "utils", "asfCalculEngine.ts");
  const tempDir = path.join(repoRoot, "temp", "pseo-asf-engine");
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
  const compiledPath = path.join(tempDir, "utils", "asfCalculEngine.js");
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
      if (isGeneratedPseoAsfPage(content) && !allowedSlugs.has(entry.name)) {
        fs.rmSync(entryPath, { recursive: true, force: true });
      }
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const slug = entry.name.replace(/\.html$/i, "");
    const content = fs.readFileSync(entryPath, "utf8");
    if (isGeneratedPseoAsfPage(content) && !allowedSlugs.has(slug)) {
      fs.rmSync(entryPath, { force: true });
    }
  }
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  cleanupGeneratedPages(outputDir, new Set(asfAbsenceRevenuScenarios.map((item) => item.slug)));
  const engine = await loadAsfEngine();
  const targetConfig = { stylesHref: "/tailwind.css", mainScriptTag: '<script type="module" src="/content.ts"></script>' };

  const enriched = asfAbsenceRevenuScenarios.map((scenario) => {
    const result = engine.calculerASF(scenario.input);
    return {
      ...scenario,
      estimate: {
        amount: result.montantEstime,
        formattedAmount: formatApproxEuroSafe(result.montantEstime),
        formattedRevenue: formatApproxEuroSafe(scenario.input.revenus),
      },
    };
  });

  for (const scenario of enriched) {
    const relatedPages = enriched.filter((item) => item.slug !== scenario.slug).slice(0, 2);
    const html = renderASFScenarioPage({
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

  console.log(`PSEO ASF: ${enriched.length} pages generees dans ${outputDir}`);
}

main();

function formatApproxEuro(value) {
  return `~${Math.round(Number(value) || 0).toLocaleString("fr-FR")} €`;
}

function formatApproxEuroSafe(value) {
  return `~${Math.round(Number(value) || 0).toLocaleString("fr-FR")} EUR`;
}

function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
}
