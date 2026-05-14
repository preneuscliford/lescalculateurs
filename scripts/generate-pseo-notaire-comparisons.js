import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import { notaireScenarios } from "../data/pseo/notaire-scenarios.js";
import { notaireComparisons } from "../data/pseo/notaire-comparisons.js";
import {
  isGeneratedPseoNotaireComparison,
  renderNotaireComparisonPage,
} from "./lib/pseo/notaire-comparison-renderer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "src", "pages", "notaire");
const generatedAt = formatDisplayDate(new Date());

async function loadNotaireEngine() {
  const engineSrc = path.join(repoRoot, "src", "utils", "notaire.calc.js");
  const engine = await import(pathToFileURL(engineSrc).href);
  return engine;
}

function cleanupGeneratedComparisons(outputRoot, allowedSlugs) {
  if (!fs.existsSync(outputRoot)) return;
  const entries = fs.readdirSync(outputRoot, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(outputRoot, entry.name);
    if (entry.isDirectory()) {
      const indexPath = path.join(entryPath, "index.html");
      if (!fs.existsSync(indexPath)) continue;
      const content = fs.readFileSync(indexPath, "utf8");
      if (isGeneratedPseoNotaireComparison(content) && !allowedSlugs.has(entry.name)) {
        fs.rmSync(entryPath, { recursive: true, force: true });
      }
      continue;
    }
  }
}

function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return day + "-" + month + "-" + year;
}

function formatApproxEuroSafe(value) {
  if (value === undefined || value === null) return "N/A";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(value);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  cleanupGeneratedComparisons(outputDir, new Set(notaireComparisons.map((item) => item.slug)));

  const engine = await loadNotaireEngine();
  const scenarioMap = {};
  notaireScenarios.forEach((s) => {
    scenarioMap[s.slug] = s;
  });

  const targetConfig = {
    stylesHref: "/tailwind.css",
    mainScriptTag: '<script type="module" src="/main.ts"></script>',
  };

  for (const comparison of notaireComparisons) {
    const scenario1 = scenarioMap[comparison.scenario1];
    const scenario2 = scenarioMap[comparison.scenario2];

    if (!scenario1 || !scenario2) {
      console.warn(`Skipping comparison ${comparison.slug}: scenarios not found`);
      continue;
    }

    const result1 = engine.calculFraisNotaire(
      scenario1.input.prix,
      scenario1.input.type,
      scenario1.input.departement,
    );
    const fees1 = result1.csi + result1.debours + result1.formalites + result1.tva;
    const estimate1 = {
      formattedTotal: formatApproxEuroSafe(result1.total),
      formattedPrice: formatApproxEuroSafe(scenario1.input.prix),
      formattedDmto: formatApproxEuroSafe(result1.droits),
      formattedEmoluments: formatApproxEuroSafe(result1.emoluments),
      formattedFees: formatApproxEuroSafe(fees1),
    };

    const result2 = engine.calculFraisNotaire(
      scenario2.input.prix,
      scenario2.input.type,
      scenario2.input.departement,
    );
    const fees2 = result2.csi + result2.debours + result2.formalites + result2.tva;
    const estimate2 = {
      formattedTotal: formatApproxEuroSafe(result2.total),
      formattedPrice: formatApproxEuroSafe(scenario2.input.prix),
      formattedDmto: formatApproxEuroSafe(result2.droits),
      formattedEmoluments: formatApproxEuroSafe(result2.emoluments),
      formattedFees: formatApproxEuroSafe(fees2),
    };

    const html = renderNotaireComparisonPage({
      comparison,
      scenario1,
      estimate1,
      scenario2,
      estimate2,
      generatedAt,
      targetConfig,
    });

    const nestedDir = path.join(outputDir, comparison.slug);
    fs.mkdirSync(nestedDir, { recursive: true });
    fs.writeFileSync(path.join(nestedDir, "index.html"), html, "utf8");
  }

  console.log(
    "PSEO Notaire Comparisons: " + notaireComparisons.length + " pages generees dans " + outputDir,
  );
}

main();
