import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { createRequire } from "module";

import { simulateursAbsenceRevenuScenarios } from "../data/pseo/simulateurs-absence-revenu-scenarios.js";
import {
  isGeneratedPseoSimulateursPage,
  renderSimulateursScenarioPage,
} from "./lib/pseo/simulateurs-pseo-renderer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const outputDir = path.join(repoRoot, "src", "pages", "simulateurs");
const generatedAt = formatDisplayDate(new Date());

async function loadEngine(relativePath, tempName) {
  const engineSrc = path.join(repoRoot, relativePath);
  const tempDir = path.join(repoRoot, "temp", tempName);
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
  const compiledRelativePath = path
    .relative(repoRoot, engineSrc)
    .replace(/^src[\\/]/, "")
    .replace(/\.ts$/, ".js");
  const compiledPath = path.join(tempDir, compiledRelativePath);
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
      if (isGeneratedPseoSimulateursPage(content) && !allowedSlugs.has(entry.name)) {
        fs.rmSync(entryPath, { recursive: true, force: true });
      }
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const slug = entry.name.replace(/\.html$/i, "");
    const content = fs.readFileSync(entryPath, "utf8");
    if (isGeneratedPseoSimulateursPage(content) && !allowedSlugs.has(slug)) {
      fs.rmSync(entryPath, { force: true });
    }
  }
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  cleanupGeneratedPages(outputDir, new Set(simulateursAbsenceRevenuScenarios.map((item) => item.slug)));

  const [rsaEngine, aplEngine, primeEngine, areEngine] = await Promise.all([
    loadEngine("src/utils/rsaCalculEngine.ts", "pseo-sim-rsa"),
    loadEngine("src/utils/aplCalculEngine.ts", "pseo-sim-apl"),
    loadEngine("src/utils/primeActiviteCalculEngine.ts", "pseo-sim-prime"),
    loadEngine("src/utils/areCalculEngine.ts", "pseo-sim-are"),
  ]);

  const targetConfig = { stylesHref: "/tailwind.css", mainScriptTag: '<script type="module" src="/content.ts"></script>' };

  const enriched = simulateursAbsenceRevenuScenarios.map((scenario) => {
    const areInput = scenario.areInput || {
      situation: scenario.input.situation,
      ancienneteEmploi: 0,
      salaireReferent: 0,
      personnesCharge: scenario.input.enfants,
      agePersonne: 0,
    };
    const rsa = rsaEngine.calculerRSA({
      situation: scenario.input.situation,
      enfants: scenario.input.enfants,
      revenus: scenario.input.revenus,
      logement: scenario.input.logement,
      activite: scenario.input.activite,
    });
    const apl = aplEngine.calculerAPL({
      situation: scenario.input.situation,
      enfants: scenario.input.enfants,
      revenus_mensuels: scenario.input.revenus,
      loyer_mensuel: scenario.input.loyer,
      region: scenario.input.region,
      type_logement: scenario.input.logement === "loue" ? "location" : scenario.input.logement === "proprio" ? "accession" : "colocation",
      economie: 0,
    });
    const prime = primeEngine.calculerPrimeActivite({
      situation: scenario.input.situation,
      enfants: scenario.input.enfants,
      revenusProf: scenario.input.revenusPro,
      autresRevenus: scenario.input.autresRevenus,
      logement: scenario.input.logement,
      typeActivite: scenario.input.typeActivite,
    });
    const are = areEngine.calculerARE(areInput);

    const rsaAmount = rsa.success ? rsa.montantEstime : 0;
    const aplAmount = apl.success && apl.data ? apl.data.apl_estimee : 0;
    const primeAmount = prime.success ? prime.montantEstime : 0;
    const areAmount = are.eligible ? are.montantEstime : 0;
    const total = rsaAmount + aplAmount + primeAmount + areAmount;

    return {
      ...scenario,
      estimates: {
        rsa: formatApproxEuroSafe(rsaAmount),
        apl: formatApproxEuroSafe(aplAmount),
        prime: formatApproxEuroSafe(primeAmount),
        are: formatApproxEuroSafe(areAmount),
        areDuration: are.eligible ? `Durée max : ${are.durationMax} mois` : "ARE non éligible",
        total: formatApproxEuroSafe(total),
        revenus: formatApproxEuroSafe(scenario.input.revenus),
        loyer: formatApproxEuroSafe(scenario.input.loyer),
      },
    };
  });

  for (const scenario of enriched) {
    const relatedPages = enriched.filter((item) => item.slug !== scenario.slug).slice(0, 2);
    const html = renderSimulateursScenarioPage({
      scenario,
      estimates: scenario.estimates,
      relatedPages,
      generatedAt,
      targetConfig,
    });

    fs.writeFileSync(path.join(outputDir, `${scenario.slug}.html`), html, "utf8");
    const nestedDir = path.join(outputDir, scenario.slug);
    fs.mkdirSync(nestedDir, { recursive: true });
    fs.writeFileSync(path.join(nestedDir, "index.html"), html, "utf8");
  }

  console.log(`PSEO Simulateurs: ${enriched.length} pages generees dans ${outputDir}`);
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

function formatApproxEuroSafe(value) {
  return `~${Math.round(Number(value) || 0).toLocaleString("fr-FR")} EUR`;
}
