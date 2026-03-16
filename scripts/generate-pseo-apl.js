import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";
import { createRequire } from "module";

import { aplPilotScenarios } from "../data/pseo/apl-pilot-scenarios.js";
import { aplAbsenceRevenuScenarios } from "../data/pseo/apl-absence-revenu-scenarios.js";
import {
  isGeneratedPseoAplPage,
  renderAPLScenarioPage,
} from "./lib/pseo/apl-pseo-renderer.js";

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
const aplScenarios = [...aplPilotScenarios, ...aplAbsenceRevenuScenarios];

async function main() {
  const sanitizedScenarios = aplScenarios.map(sanitizeAplScenario);

  validateScenarios(sanitizedScenarios);

  const engine = await loadAplEngine();
  const targetConfig = getTargetConfig(target);
  const outputDir = path.join(targetConfig.pagesRoot, "apl");

  fs.mkdirSync(outputDir, { recursive: true });
  cleanupGeneratedPages(
    outputDir,
    new Set(sanitizedScenarios.map((item) => normalizeSlug(item.slug))),
  );

  const enriched = sanitizedScenarios.map((scenario) => {
    const calc = engine.calculerAPL(scenario.input);
    if (!calc.success || !calc.data) {
      throw new Error(
        `Calcul APL invalide pour ${scenario.slug}: ${calc.error || "erreur inconnue"}`,
      );
    }

    return {
      ...scenario,
      slug: normalizeSlug(scenario.slug),
      estimate: {
        apl: calc.data.apl_estimee,
        formattedApl: formatApproxEuroAscii(calc.data.apl_estimee),
        formattedRent: formatApproxEuroAscii(scenario.input.loyer_mensuel),
        formattedRevenue: formatApproxEuroAscii(scenario.input.revenus_mensuels),
        reasonZero: calc.data.raison_zero || "",
      },
    };
  });

  const relatedMap = buildRelatedMap(enriched);

  for (const scenario of enriched) {
    const relatedPages = (relatedMap.get(scenario.slug) || [])
      .map((slug) => enriched.find((item) => item.slug === slug))
      .filter(Boolean);

    const html = renderAPLScenarioPage({
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

  console.log(`PSEO APL: ${enriched.length} pages generees dans ${outputDir}`);
}

function sanitizeAplScenario(scenario) {
  const sanitizeText = (value) =>
    typeof value === "string" ? normalizeFrenchText(value) : value;

  const sanitizeFaqItem = (item) => ({
    ...item,
    question: sanitizeText(item.question),
    answer: sanitizeText(item.answer),
  });

  const sanitizePilotProduct = (pilotProduct) => {
    if (!pilotProduct) return pilotProduct;

    return {
      ...pilotProduct,
      variants: Array.isArray(pilotProduct.variants)
        ? pilotProduct.variants.map((item) => ({
            ...item,
            label: sanitizeText(item.label),
            description: sanitizeText(item.description),
          }))
        : pilotProduct.variants,
      drivers: Array.isArray(pilotProduct.drivers)
        ? pilotProduct.drivers.map((item) => ({
            ...item,
            title: sanitizeText(item.title),
            description: sanitizeText(item.description),
          }))
        : pilotProduct.drivers,
      comparisonLinks: Array.isArray(pilotProduct.comparisonLinks)
        ? pilotProduct.comparisonLinks.map((item) => ({
            ...item,
            label: sanitizeText(item.label),
          }))
        : pilotProduct.comparisonLinks,
      journey: Array.isArray(pilotProduct.journey)
        ? pilotProduct.journey.map(sanitizeText)
        : pilotProduct.journey,
    };
  };

  return {
    ...scenario,
    intent: sanitizeText(scenario.intent),
    title: sanitizeText(scenario.title),
    description: sanitizeText(scenario.description),
    summary: sanitizeText(scenario.summary),
    audience: sanitizeText(scenario.audience),
    checklist: Array.isArray(scenario.checklist)
      ? scenario.checklist.map(sanitizeText)
      : scenario.checklist,
    faq: Array.isArray(scenario.faq)
      ? scenario.faq.map(sanitizeFaqItem)
      : scenario.faq,
    pilotProduct: sanitizePilotProduct(scenario.pilotProduct),
  };
}

function validateScenarios(scenarios) {
  const slugs = new Set();

  for (const scenario of scenarios) {
    const required = [
      "slug",
      "intent",
      "title",
      "description",
      "summary",
      "audience",
      "tags",
      "input",
      "checklist",
      "faq",
    ];

    for (const key of required) {
      if (!(key in scenario)) {
        throw new Error(
          `Scenario invalide (${scenario.slug || "sans-slug"}): champ manquant ${key}`,
        );
      }
    }

    if (slugs.has(scenario.slug)) {
      throw new Error(`Slug duplique: ${scenario.slug}`);
    }

    slugs.add(scenario.slug);
  }
}

async function loadAplEngine() {
  const engineSrc = path.join(repoRoot, "src", "utils", "aplCalculEngine.ts");
  const tempDir = path.join(repoRoot, "temp", "pseo-engine");

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
    {
      cwd: repoRoot,
      stdio: "pipe",
    },
  );

  const compiledPath = path.join(tempDir, "aplCalculEngine.js");
  const engine = await import(
    `${pathToFileURL(compiledPath).href}?v=${Date.now()}`
  );
  fs.rmSync(tempDir, { recursive: true, force: true });
  return engine;
}

function getTargetConfig(targetName) {
  if (targetName === "dist") {
    const distRoot = path.join(repoRoot, "dist");
    const assetsDir = path.join(distRoot, "assets");

    if (!fs.existsSync(assetsDir)) {
      throw new Error("dist/assets est introuvable. Lancez d abord le build Vite.");
    }

    const assetFiles = fs.readdirSync(assetsDir);
    const cssFile = assetFiles.find((item) => item.endsWith(".css"));
    const jsFile =
      assetFiles.find((item) => item.startsWith("main-") && item.endsWith(".js")) ||
      assetFiles.find((item) => item.endsWith(".js"));

    if (!cssFile || !jsFile) {
      throw new Error("Assets CSS/JS introuvables dans dist/assets.");
    }

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

function getTagScore(left, right) {
  const rightSet = new Set(right);
  return left.reduce((score, tag) => score + (rightSet.has(tag) ? 1 : 0), 0);
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
      if (isGeneratedPseoAplPage(content) && !allowedSlugs.has(entry.name)) {
        fs.rmSync(entryPath, { recursive: true, force: true });
      }
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;

    const slug = entry.name.replace(/\.html$/i, "");
    const content = fs.readFileSync(entryPath, "utf8");
    if (isGeneratedPseoAplPage(content) && !allowedSlugs.has(slug)) {
      fs.rmSync(entryPath, { force: true });
    }
  }
}

function formatEuroAscii(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("fr-FR")} €`;
}

function formatApproxEuroAscii(value) {
  return `~${Math.round(Number(value) || 0).toLocaleString("fr-FR")} €`;
}

function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
}

function normalizeSlug(value) {
  return String(value)
    .replace(/c\?libataire/gi, "celibataire")
    .replace(/\?tudiant/gi, "etudiant")
    .replace(/isol\?/gi, "isole")
    .replace(/\?lev\?/gi, "eleve")
    .replace(/\?le-de-france/gi, "ile-de-france")
    .replace(/\?/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
