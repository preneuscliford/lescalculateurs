#!/usr/bin/env node

/**
 * Analyse détaillée du cluster /pages/revenus/ et revenu-median-commune
 * - Trafic Google + Bing
 * - H1 (question ou non)
 * - Classement par clics
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

const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf-8"));

// ----- 1. Lister toutes les pages du cluster -----
const revenusDir = path.join(SRC_PAGES, "revenus");
let clusterFiles = [];
if (fs.existsSync(revenusDir)) {
  const files = fs.readdirSync(revenusDir, { recursive: true });
  for (const f of files) {
    if (f.endsWith(".html")) {
      const relPath = "/pages/revenus/" + f.replace(/\\/g, "/");
      // ignorer les doublons index.html
      if (relPath.endsWith("/index.html")) {
        clusterFiles.push(relPath.replace(/\/index\.html$/, ""));
      } else {
        clusterFiles.push(relPath.replace(/\.html$/, ""));
      }
    }
  }
}
// Ajouter revenu-median-commune
clusterFiles.push("/pages/revenu-median-commune");

// Dédupliquer
clusterFiles = [...new Set(clusterFiles)];

// ----- 2. Extraire le trafic depuis le rapport -----
const trafficMap = new Map();
for (const page of clusterFiles) {
  trafficMap.set(page, {
    page,
    googleClicks: 0,
    bingClicks: 0,
    totalClicks: 0,
    googleImpr: 0,
    bingImpr: 0,
  });
}

for (const p of report.google.topPages || []) {
  const key = p.page;
  if (trafficMap.has(key)) {
    const entry = trafficMap.get(key);
    entry.googleClicks = Number(p.clicks);
    entry.totalClicks += Number(p.clicks);
    entry.googleImpr = Number(p.impressions);
  }
}
for (const p of report.bing.topPages || []) {
  const key = p.page;
  if (trafficMap.has(key)) {
    const entry = trafficMap.get(key);
    entry.bingClicks = Number(p.clicks);
    entry.totalClicks += Number(p.clicks);
    entry.bingImpr = Number(p.impressions);
  }
}

// ----- 3. Trouver le fichier HTML et extraire le H1 -----
function findHtmlFile(pagePath) {
  let clean = pagePath.replace(/\/$/, "");
  if (!clean.startsWith("/")) clean = "/" + clean;
  const possible = [
    path.join(SRC_PAGES, clean.replace(/^\/pages\//, "") + ".html"),
    path.join(SRC_PAGES, clean.replace(/^\/pages\//, ""), "index.html"),
  ];
  for (const p of possible) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function extractH1(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const m = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (m) {
      return m[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
  } catch (e) {
    /* ignore */
  }
  return null;
}

function isQuestion(text) {
  return text && text.trim().endsWith("?");
}

// ----- 4. Analyser -----
const results = [];
for (const [page, traffic] of trafficMap) {
  const fp = findHtmlFile(page);
  const h1 = fp ? extractH1(fp) : null;
  const question = h1 ? isQuestion(h1) : false;
  results.push({ ...traffic, filePath: fp, h1, isQuestion: question });
}
results.sort((a, b) => b.totalClicks - a.totalClicks);

// ----- 5. Afficher -----
console.log("=".repeat(90));
console.log("  ANALYSE CLUSTER /pages/revenus/ + revenu-median-commune");
console.log("  Période: " + report.meta.period.start + " → " + report.meta.period.end);
console.log("=".repeat(90));
console.log("");

let totalClusterClicks = 0;
let questionCount = 0;
let h1Count = 0;

for (const r of results) {
  totalClusterClicks += r.totalClicks;
  if (r.h1) h1Count++;
  if (r.isQuestion) questionCount++;
}

for (let i = 0; i < results.length; i++) {
  const r = results[i];
  const rank = String(i + 1).padStart(2);
  const page = r.page.padEnd(55);
  const clicks = String(r.totalClicks).padStart(4);
  const icon = r.isQuestion ? "❓" : "📄";
  const status = r.totalClicks > 0 ? (r.isQuestion ? "QUESTION ✓" : "PAS QUESTION ✗") : "0 clic";
  const color = r.totalClicks > 0 ? "" : "(sans trafic)";

  console.log(`  ${rank}. ${icon} ${page} | ${clicks} clics | ${status} ${color}`);
  if (r.h1) {
    const d = r.h1.length > 75 ? r.h1.slice(0, 72) + "..." : r.h1;
    console.log(`      H1: "${d}"`);
  } else if (r.filePath) {
    console.log(`      ⚠ H1 non trouvé dans: ${r.filePath}`);
  } else {
    console.log(`      ⚠ Fichier HTML introuvable`);
  }
  console.log("");
}

console.log("─".repeat(90));
console.log("  RÉSUMÉ DU CLUSTER");
console.log("─".repeat(90));
console.log("");
console.log(`  Pages dans le cluster: ${results.length}`);
console.log(`  Trafic total du cluster: ${totalClusterClicks} clics (28j)`);
console.log(`  Pages avec trafic > 0: ${results.filter((r) => r.totalClicks > 0).length}`);
console.log(`  H1 extraits: ${h1Count}/${results.length}`);
console.log(
  `  H1 questions: ${questionCount}/${h1Count} (${h1Count > 0 ? ((questionCount / h1Count) * 100).toFixed(1) : 0}%)`,
);

const withTraffic = results.filter((r) => r.totalClicks > 0 && r.h1);
const withTrafficQ = withTraffic.filter((r) => r.isQuestion);
console.log(
  `  Parmi les pages avec trafic: ${withTrafficQ.length}/${withTraffic.length} H1-questions (${withTraffic.length > 0 ? ((withTrafficQ.length / withTraffic.length) * 100).toFixed(1) : 0}%)`,
);
console.log("");
console.log("  Détail des pages avec H1-question:");
for (const r of results.filter((r) => r.isQuestion)) {
  console.log(`    ${r.page} (${r.totalClicks} clics)`);
}
console.log("");
console.log("=".repeat(90));
