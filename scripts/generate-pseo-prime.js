import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";

import { primeAbsenceRevenuScenarios } from "../data/pseo/prime-absence-revenu-scenarios.js";
import {
  isGeneratedPseoPrimePage,
  renderPrimeScenarioPage,
} from "./lib/pseo/prime-pseo-renderer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "src", "pages", "prime-activite");
const generatedAt = formatDisplayDate(new Date());

async function loadPrimeEngine() {
  const engineSrc = path.join(repoRoot, "src", "utils", "primeActiviteCalculEngine.ts");
  const tempDir = path.join(repoRoot, "temp", "pseo-prime-engine");
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
  const compiledPath = path.join(tempDir, "primeActiviteCalculEngine.js");
  const engine = await import(`${pathToFileURL(compiledPath).href}?v=${Date.now()}`);
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
  fs.mkdirSync(outputDir, { recursive: true });
  cleanupGeneratedPages(outputDir, new Set(primeAbsenceRevenuScenarios.map((item) => item.slug)));
  const engine = await loadPrimeEngine();
  const targetConfig = { stylesHref: "/tailwind.css", mainScriptTag: '<script type="module" src="/content.ts"></script>' };

  const enriched = primeAbsenceRevenuScenarios.map((scenario) => {
    const result = engine.calculerPrimeActivite(scenario.input);
    return {
      ...scenario,
      estimate: {
        amount: result.montantEstime,
        formattedAmount: formatApproxEuro(result.montantEstime),
        formattedIncome: formatApproxEuro(scenario.input.revenusProf),
        formattedOtherIncome: formatApproxEuro(scenario.input.autresRevenus),
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

function formatApproxEuro(value) {
  return `~${Math.round(Number(value) || 0).toLocaleString("fr-FR")} €`;
}

function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
}
