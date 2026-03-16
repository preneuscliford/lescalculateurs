import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";

import { simulateursAbsenceRevenuScenarios } from "../data/pseo/simulateurs-absence-revenu-scenarios.js";
import {
  isGeneratedPseoSimulateursPage,
  renderSimulateursScenarioPage,
} from "./lib/pseo/simulateurs-pseo-renderer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "src", "pages", "simulateurs");
const generatedAt = formatDisplayDate(new Date());

async function loadEngine(relativePath, tempName) {
  const engineSrc = path.join(repoRoot, relativePath);
  const tempDir = path.join(repoRoot, "temp", tempName);
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
  const compiledPath = path.join(tempDir, path.basename(relativePath).replace(/\.ts$/, ".js"));
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

  const [rsaEngine, aplEngine, primeEngine] = await Promise.all([
    loadEngine("src/utils/rsaCalculEngine.ts", "pseo-sim-rsa"),
    loadEngine("src/utils/aplCalculEngine.ts", "pseo-sim-apl"),
    loadEngine("src/utils/primeActiviteCalculEngine.ts", "pseo-sim-prime"),
  ]);

  const targetConfig = { stylesHref: "/tailwind.css", mainScriptTag: '<script type="module" src="/content.ts"></script>' };

  const enriched = simulateursAbsenceRevenuScenarios.map((scenario) => {
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

    const rsaAmount = rsa.success ? rsa.montantEstime : 0;
    const aplAmount = apl.success && apl.data ? apl.data.apl_estimee : 0;
    const primeAmount = prime.success ? prime.montantEstime : 0;
    const total = rsaAmount + aplAmount + primeAmount;

    return {
      ...scenario,
      estimates: {
        rsa: formatApproxEuro(rsaAmount),
        apl: formatApproxEuro(aplAmount),
        prime: formatApproxEuro(primeAmount),
        total: formatApproxEuro(total),
        revenus: formatApproxEuro(scenario.input.revenus),
        loyer: formatApproxEuro(scenario.input.loyer),
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
