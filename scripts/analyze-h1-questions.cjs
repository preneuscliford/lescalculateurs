#!/usr/bin/env node

/**
 * Analyse si les pages les plus visitées ont un H1 sous forme de question.
 *
 * Usage: node scripts/analyze-h1-questions.cjs
 */

const fs = require("fs");
const path = require("path");

const REPORT_PATH = path.resolve(
  __dirname,
  "..",
  "reports",
  "search-console-multi-engine-latest.json",
);
const SRC_PAGES = path.resolve(__dirname, "..", "src", "pages");
const CONTENT_SAFE = path.resolve(__dirname, "..", "content_SAFE");
const VDF = path.resolve(__dirname, "..", "vdf");

// Charger le rapport
const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf-8"));

// Pages "hub" (simulateurs globaux) à exclure
const HUB_PAGES = new Set([
  "/pages/apl",
  "/pages/are",
  "/pages/prime-activite",
  "/pages/rsa",
  "/pages/notaire",
  "/pages/taxe",
  "/pages/impot",
  "/pages/aah",
  "/pages/asf",
  "/pages/charges",
  "/pages/plusvalue",
  "/pages/travail",
  "/pages/ik",
  "/pages/apl-zones", // page zone APL = hub aussi
  "/pages/apl-etudiant", // hub étudiant
  "/pages/guide-complet-impot-revenu-2026",
  "/pages/salaire-brut-net-calcul-2026",
  "/pages/taxe-fonciere",
]);

function isHubPage(pagePath) {
  return HUB_PAGES.has(pagePath);
}

// Fusionner les pages Google + Bing, trier par clics totaux
const pageMap = new Map();

for (const p of report.google.topPages || []) {
  const key = p.page;
  if (!pageMap.has(key))
    pageMap.set(key, {
      page: key,
      googleClicks: 0,
      bingClicks: 0,
      totalClicks: 0,
      googleImpr: 0,
      bingImpr: 0,
    });
  const entry = pageMap.get(key);
  entry.googleClicks = Number(p.clicks);
  entry.totalClicks += Number(p.clicks);
  entry.googleImpr = Number(p.impressions);
}

for (const p of report.bing.topPages || []) {
  const key = p.page;
  if (!pageMap.has(key))
    pageMap.set(key, {
      page: key,
      googleClicks: 0,
      bingClicks: 0,
      totalClicks: 0,
      googleImpr: 0,
      bingImpr: 0,
    });
  const entry = pageMap.get(key);
  entry.bingClicks = Number(p.clicks);
  entry.totalClicks += Number(p.clicks);
  entry.bingImpr = Number(p.impressions);
}

const sortedPages = [...pageMap.values()].sort((a, b) => b.totalClicks - a.totalClicks);

// Filtrer : exclure les hubs ET ne garder que les pages profondes (avec au moins 2 segments après /pages/)
const satellitePages = sortedPages.filter((p) => !isHubPage(p.page));

// Fonction pour trouver le fichier HTML correspondant à une page
function findHtmlFile(pagePath) {
  // Nettoyer le path
  let clean = pagePath.replace(/\/$/, "");
  if (!clean.startsWith("/")) clean = "/" + clean;

  // Cas spéciaux: /pages/xxx → src/pages/xxx.html ou src/pages/xxx/index.html
  const possiblePaths = [];

  // src/pages/xxx.html
  possiblePaths.push(path.join(SRC_PAGES, clean.replace(/^\/pages\//, "") + ".html"));
  // src/pages/xxx/index.html
  possiblePaths.push(path.join(SRC_PAGES, clean.replace(/^\/pages\//, ""), "index.html"));
  // src/pages/xxx/xxx.html (nom de dossier = nom de fichier)
  const parts = clean.replace(/^\/pages\//, "").split("/");
  const lastPart = parts[parts.length - 1];
  possiblePaths.push(path.join(SRC_PAGES, parts.join("/"), lastPart + ".html"));
  // content_SAFE/xxx.html
  possiblePaths.push(path.join(CONTENT_SAFE, clean.replace(/^\//, "") + ".html"));
  possiblePaths.push(path.join(CONTENT_SAFE, clean.replace(/^\//, "") + "/index.html"));
  // vdf/xxx.html
  possiblePaths.push(path.join(VDF, clean.replace(/^\//, "") + ".html"));
  possiblePaths.push(path.join(VDF, clean.replace(/^\//, ""), "index.html"));

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }

  return null;
}

// Extraire le H1 d'un fichier HTML
function extractH1(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    // Regex pour capturer le contenu entre <h1> et </h1> (insensible à la casse, avec attributs possibles)
    const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      // Nettoyer le HTML à l'intérieur (enlever les <span>, <br>, etc.)
      let text = h1Match[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return text;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Vérifier si un texte est une question
function isQuestion(text) {
  if (!text) return false;
  return text.trim().endsWith("?");
}

// Analyser
console.log("=".repeat(90));
console.log("  ANALYSE H1 vs QUESTIONS - Pages les plus visitées");
console.log("  Période: " + report.meta.period.start + " → " + report.meta.period.end);
console.log("=".repeat(90));
console.log("");

const results = [];
let questionCount = 0;
let totalWithH1 = 0;
let totalFound = 0;

for (const entry of satellitePages.slice(0, 30)) {
  const filePath = findHtmlFile(entry.page);
  const h1 = filePath ? extractH1(filePath) : null;
  const question = h1 ? isQuestion(h1) : false;

  results.push({ ...entry, filePath, h1, isQuestion: question });

  if (h1) totalWithH1++;
  if (filePath) totalFound++;
  if (question) questionCount++;
}

// Afficher les résultats
console.log("  TOP 30 Pages SATELLITES (hors hubs/simulateurs globaux)");
console.log("  Hubs exclus: /pages/apl, /pages/are, /pages/rsa, /pages/notaire, /pages/taxe, ...");
console.log("─".repeat(90));
console.log("");

for (let i = 0; i < results.length; i++) {
  const r = results[i];
  const rank = String(i + 1).padStart(2);
  const page = r.page.padEnd(52);
  const clicks = String(r.totalClicks).padStart(5);
  const icon = r.isQuestion ? "❓" : "📄";
  const status = r.h1 ? (r.isQuestion ? "QUESTION ✓" : "PAS QUESTION ✗") : "H1 INTROUVABLE";

  console.log(`  ${rank}. ${icon} ${page} | ${clicks} clics | ${status}`);
  if (r.h1) {
    const displayH1 = r.h1.length > 80 ? r.h1.slice(0, 77) + "..." : r.h1;
    console.log(`      H1: "${displayH1}"`);
  } else {
    console.log(`      (fichier HTML non trouvé: ${r.filePath || "aucun chemin résolu"})`);
  }
  console.log("");
}

// Résumé
console.log("─".repeat(90));
console.log("  RÉSUMÉ (pages satellites uniquement)");
console.log("─".repeat(90));
console.log("");
console.log(`  Pages satellites analysées: ${results.length}`);
console.log(`  Fichiers HTML trouvés: ${totalFound}/${results.length}`);
console.log(`  H1 extraits: ${totalWithH1}/${results.length}`);
console.log(
  `  H1 en forme de QUESTION: ${questionCount}/${totalWithH1} (${totalWithH1 > 0 ? ((questionCount / totalWithH1) * 100).toFixed(1) : 0}%)`,
);
console.log(`  H1 PAS en forme de question: ${totalWithH1 - questionCount}/${totalWithH1}`);
console.log("");

// Distinguer par seuil de popularité
const top10 = results.slice(0, 10).filter((r) => r.h1);
const top10Questions = top10.filter((r) => r.isQuestion);
const rest = results.slice(10).filter((r) => r.h1);
const restQuestions = rest.filter((r) => r.isQuestion);

console.log("  Top 10 pages satellites:");
console.log(
  `    H1 questions: ${top10Questions.length}/${top10.length} (${top10.length > 0 ? ((top10Questions.length / top10.length) * 100).toFixed(1) : 0}%)`,
);
console.log("  Pages satellites 11-30:");
console.log(
  `    H1 questions: ${restQuestions.length}/${rest.length} (${rest.length > 0 ? ((restQuestions.length / rest.length) * 100).toFixed(1) : 0}%)`,
);
console.log("");
console.log("=".repeat(90));
