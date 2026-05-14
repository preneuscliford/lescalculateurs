import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createRequire } from "module";

import { notaireScenarios } from "../data/pseo/notaire-scenarios.js";
import {
  isGeneratedPseoNotairePage,
  renderNotaireScenarioPage,
} from "./lib/pseo/notaire-pseo-renderer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const outputDir = path.join(repoRoot, "src", "pages", "notaire");
const generatedAt = formatDisplayDate(new Date());

// notaire.calc.js is ESM, we need to convert it to CJS via a temp compilation
// But since it's pure JS with no TS, we use a different approach:
// We'll import it dynamically since it's ESM
async function loadNotaireEngine() {
  const engineSrc = path.join(repoRoot, "src", "utils", "notaire.calc.js");
  // Dynamic import works for ESM - convert Windows path to file:// URL
  const engine = await import(pathToFileURL(engineSrc).href);
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
      if (isGeneratedPseoNotairePage(content) && !allowedSlugs.has(entry.name)) {
        fs.rmSync(entryPath, { recursive: true, force: true });
      }
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const slug = entry.name.replace(/\.html$/i, "");
    const content = fs.readFileSync(entryPath, "utf8");
    if (isGeneratedPseoNotairePage(content) && !allowedSlugs.has(slug)) {
      fs.rmSync(entryPath, { force: true });
    }
  }
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  cleanupGeneratedPages(outputDir, new Set(notaireScenarios.map((item) => item.slug)));

  const engine = await loadNotaireEngine();

  const targetConfig = {
    stylesHref: "/tailwind.css",
    mainScriptTag: '<script type="module" src="/main.ts"></script>',
  };

  const enriched = notaireScenarios.map((scenario) => {
    const result = engine.calculFraisNotaire(
      scenario.input.prix,
      scenario.input.type,
      scenario.input.departement,
    );
    const fees = result.csi + result.debours + result.formalites + result.tva;
    return {
      ...scenario,
      estimate: {
        formattedTotal: formatApproxEuroSafe(result.total),
        formattedPrice: formatApproxEuroSafe(scenario.input.prix),
        formattedDmto: formatApproxEuroSafe(result.droits),
        formattedEmoluments: formatApproxEuroSafe(result.emoluments),
        formattedFees: formatApproxEuroSafe(fees),
      },
    };
  });

  for (const scenario of enriched) {
    const relatedPages = enriched.filter((item) => item.slug !== scenario.slug).slice(0, 2);
    const html = renderNotaireScenarioPage({
      scenario,
      estimate: scenario.estimate,
      relatedPages,
      generatedAt,
      targetConfig,
    });

    // Write as flat file
    fs.writeFileSync(path.join(outputDir, `${scenario.slug}.html`), html, "utf8");
    // Write as nested directory with index.html
    const nestedDir = path.join(outputDir, scenario.slug);
    fs.mkdirSync(nestedDir, { recursive: true });
    fs.writeFileSync(path.join(nestedDir, "index.html"), html, "utf8");
  }

  console.log("PSEO Notaire: " + enriched.length + " pages generees dans " + outputDir);
}

main().catch((err) => {
  console.error("Erreur generation PSEO Notaire:", err);
  process.exit(1);
});

function formatApproxEuroSafe(value) {
  return (
    "~" +
    (Number(value) || 0).toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) +
    " EUR"
  );
}

function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return day + "-" + month + "-" + year;
}
