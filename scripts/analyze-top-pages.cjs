#!/usr/bin/env node
/**
 * Analyse les pages les plus rentables
 * Basé sur le trafic Search Console (Google + Bing)
 * Pondération : clics (valeur directe) + impressions (potentiel) + CTR (qualité)
 *
 * Note: Les données AdSense par page ne sont pas disponibles via API
 * pour les comptes éditeurs individuels. Cette analyse se base sur le
 * trafic search organique comme proxy de la monétisation.
 */

const fs = require("fs");
const path = require("path");

const reportsDir = path.resolve(process.cwd(), "reports");
const scPath = path.join(reportsDir, "search-console-multi-engine-latest.json");

if (!fs.existsSync(scPath)) {
  console.error("❌ search-console-multi-engine-latest.json introuvable");
  console.error("   Lance: node scripts/fetch-search-console.cjs");
  process.exit(1);
}

const sc = JSON.parse(fs.readFileSync(scPath, "utf8"));

// ============================================================
// Fusion des pages Google + Bing
// ============================================================
const pageMap = new Map();

// Pages Google
for (const page of sc.google.topPages || []) {
  pageMap.set(page.page, {
    page: page.page,
    googleClicks: page.clicks || 0,
    googleImpressions: page.impressions || 0,
    googleCTR: parseFloat(page.ctr) || 0,
    googlePosition: parseFloat(page.position) || 0,
    bingClicks: 0,
    bingImpressions: 0,
  });
}

// Pages Bing
for (const page of sc.bing.topPages || []) {
  const existing = pageMap.get(page.page);
  if (existing) {
    existing.bingClicks = page.clicks || 0;
    existing.bingImpressions = page.impressions || 0;
  } else {
    pageMap.set(page.page, {
      page: page.page,
      googleClicks: 0,
      googleImpressions: 0,
      googleCTR: 0,
      googlePosition: 0,
      bingClicks: page.clicks || 0,
      bingImpressions: page.impressions || 0,
    });
  }
}

// ============================================================
// Calcul du score de "rentabilité"
// ============================================================
const pages = [];

for (const [pagePath, data] of pageMap) {
  const totalClicks = data.googleClicks + data.bingClicks;
  const totalImpr = data.googleImpressions + data.bingImpressions;
  const avgCTR = totalImpr > 0 ? (totalClicks / totalImpr) * 100 : 0;

  // Score de rentabilité pondéré
  // Clics = valeur directe (poids 1.0)
  // Impressions * CTR = potentiel de conversion (poids 0.05)
  // CTR élevé = audience qualifiée (bonus multiplicateur)
  const ctrBonus = avgCTR > 3 ? 1.5 : avgCTR > 1.5 ? 1.2 : 1.0;
  const score = (totalClicks * 1.0 + ((totalImpr * avgCTR) / 100) * 0.05) * ctrBonus;

  // Catégoriser la page
  const category = pagePath.split("/")[2] || "racine";
  const subCategory = pagePath.split("/").slice(2, 4).join("/") || "home";

  pages.push({
    page: pagePath,
    category,
    subCategory,
    googleClicks: data.googleClicks,
    bingClicks: data.bingClicks,
    totalClicks,
    totalImpr,
    avgCTR: avgCTR.toFixed(2),
    googlePos: data.googlePosition.toFixed(1),
    score: Math.round(score * 100) / 100,
  });
}

// Trier par score décroissant
pages.sort((a, b) => b.score - a.score);

// ============================================================
// Analyse par catégorie
// ============================================================
const categoryStats = new Map();
for (const p of pages) {
  const cat = categoryStats.get(p.category) || {
    category: p.category,
    totalClicks: 0,
    totalImpr: 0,
    pageCount: 0,
    totalScore: 0,
  };
  cat.totalClicks += p.totalClicks;
  cat.totalImpr += p.totalImpr;
  cat.pageCount++;
  cat.totalScore += p.score;
  categoryStats.set(p.category, cat);
}

const categories = [...categoryStats.values()].sort((a, b) => b.totalScore - a.totalScore);

// ============================================================
// Analyse par sous-catégorie
// ============================================================
const subCategoryStats = new Map();
for (const p of pages) {
  const sub = subCategoryStats.get(p.subCategory) || {
    subCategory: p.subCategory,
    totalClicks: 0,
    totalImpr: 0,
    pageCount: 0,
    totalScore: 0,
  };
  sub.totalClicks += p.totalClicks;
  sub.totalImpr += p.totalImpr;
  sub.pageCount++;
  sub.totalScore += p.score;
  subCategoryStats.set(p.subCategory, sub);
}

const subCategories = [...subCategoryStats.values()]
  .sort((a, b) => b.totalScore - a.totalScore)
  .slice(0, 20);

// ============================================================
// AFFICHAGE
// ============================================================
console.log("=".repeat(100));
console.log("  ANALYSE DES PAGES LES PLUS RENTABLES - lescalculateurs.fr");
console.log(`  Période: ${sc.meta.period.start} → ${sc.meta.period.end} (${sc.meta.period.days}j)`);
console.log("=".repeat(100));

// ── Top Pages ──────────────────────────────────────────────────
console.log("\n─── TOP 30 PAGES (par score de rentabilité) ───");
console.log(`  Score = (Clics × 1.0 + Impr × CTR% × 0.05) × Bonus CTR`);
console.log("");
console.log(
  `${"#".padStart(3)} | ${"Page".padEnd(50)} | ${"Catégorie".padEnd(15)} | ${"Clics G+B".padStart(8)} | ${"Impr".padStart(8)} | ${"CTR".padStart(6)} | ${"Score".padStart(8)}`,
);
console.log(
  `${"─".repeat(3)}-+-${"─".repeat(50)}-+-${"─".repeat(15)}-+-${"─".repeat(8)}-+-${"─".repeat(8)}-+-${"─".repeat(6)}-+-${"─".repeat(8)}`,
);

for (let i = 0; i < Math.min(pages.length, 30); i++) {
  const p = pages[i];
  const displayPage = p.page.length > 48 ? "..." + p.page.slice(-45) : p.page;
  const displayCat = p.category.length > 13 ? p.category.slice(0, 12) + "…" : p.category;
  console.log(
    `${String(i + 1).padStart(3)} | ${displayPage.padEnd(50)} | ${displayCat.padEnd(15)} | ${String(p.totalClicks).padStart(8)} | ${String(p.totalImpr).padStart(8)} | ${(p.avgCTR + "%").padStart(6)} | ${String(p.score.toFixed(1)).padStart(8)}`,
  );
}

// ── Par Catégorie ──────────────────────────────────────────────
console.log("\n─── PERFORMANCE PAR CATÉGORIE ───");
console.log(
  `${"Catégorie".padEnd(18)} | ${"Pages".padStart(5)} | ${"Clics".padStart(8)} | ${"Impr".padStart(8)} | ${"Score".padStart(8)} | ${"Clics/Page".padStart(9)}`,
);
console.log(
  `${"─".repeat(18)}-+-${"─".repeat(5)}-+-${"─".repeat(8)}-+-${"─".repeat(8)}-+-${"─".repeat(8)}-+-${"─".repeat(9)}`,
);

for (const cat of categories) {
  console.log(
    `${cat.category.padEnd(18)} | ${String(cat.pageCount).padStart(5)} | ${String(cat.totalClicks).padStart(8)} | ${String(cat.totalImpr).padStart(8)} | ${String(Math.round(cat.totalScore).toLocaleString()).padStart(8)} | ${String((cat.totalClicks / Math.max(cat.pageCount, 1)).toFixed(1)).padStart(9)}`,
  );
}

// ── Top Sous-Catégories ────────────────────────────────────────
console.log("\n─── TOP SOUS-CATÉGORIES ───");
console.log(
  `${"Sous-catégorie".padEnd(35)} | ${"Pages".padStart(5)} | ${"Clics".padStart(8)} | ${"Impr".padStart(8)} | ${"Score".padStart(8)}`,
);
console.log(
  `${"─".repeat(35)}-+-${"─".repeat(5)}-+-${"─".repeat(8)}-+-${"─".repeat(8)}-+-${"─".repeat(8)}`,
);

for (const sub of subCategories) {
  console.log(
    `${sub.subCategory.padEnd(35)} | ${String(sub.pageCount).padStart(5)} | ${String(sub.totalClicks).padStart(8)} | ${String(sub.totalImpr).padStart(8)} | ${String(Math.round(sub.totalScore).toLocaleString()).padStart(8)}`,
  );
}

// ── Pages à fort CTR (les plus "chaudes") ──────────────────────
console.log("\n─── TOP 15 PAGES À FORT CTR (audience la plus engagée) ───");
const highCTR = [...pages]
  .filter((p) => p.totalClicks >= 5)
  .sort((a, b) => parseFloat(b.avgCTR) - parseFloat(a.avgCTR));

console.log(
  `${"#".padStart(3)} | ${"Page".padEnd(50)} | ${"Clics".padStart(8)} | ${"CTR".padStart(6)} | ${"Score".padStart(8)}`,
);
console.log(
  `${"─".repeat(3)}-+-${"─".repeat(50)}-+-${"─".repeat(8)}-+-${"─".repeat(6)}-+-${"─".repeat(8)}`,
);

for (let i = 0; i < Math.min(highCTR.length, 15); i++) {
  const p = highCTR[i];
  const displayPage = p.page.length > 48 ? "..." + p.page.slice(-45) : p.page;
  console.log(
    `${String(i + 1).padStart(3)} | ${displayPage.padEnd(50)} | ${String(p.totalClicks).padStart(8)} | ${(p.avgCTR + "%").padStart(6)} | ${String(p.score.toFixed(1)).padStart(8)}`,
  );
}

// ── Revenus estimés (basé sur 107,13 € de solde) ──────────────────
console.log("\n─── ESTIMATION REVENUS PAR CATÉGORIE ───");
console.log("  (basé sur le solde AdSense de 107,13 €, réparti au prorata des clics)");
console.log("");

const knownPayout = 107.13;
const totalAllClicks = pages.reduce((s, p) => s + p.totalClicks, 0);

console.log(
  `${"Catégorie".padEnd(18)} | ${"Clics".padStart(8)} | ${"% Clics".padStart(7)} | ${"€ estimé".padStart(10)}`,
);
console.log(`${"─".repeat(18)}-+-${"─".repeat(8)}-+-${"─".repeat(7)}-+-${"─".repeat(10)}`);

for (const cat of categories) {
  const pct = totalAllClicks > 0 ? (cat.totalClicks / totalAllClicks) * 100 : 0;
  const revenue = knownPayout * (pct / 100);
  console.log(
    `${cat.category.padEnd(18)} | ${String(cat.totalClicks).padStart(8)} | ${pct.toFixed(1).padStart(6)}% | ${revenue.toFixed(2).padStart(8)} €`,
  );
}

console.log(`\n${"─".repeat(18)}-+-${"─".repeat(8)}-+-${"─".repeat(7)}-+-${"─".repeat(10)}`);
console.log(
  `${"TOTAL".padEnd(18)} | ${String(totalAllClicks).padStart(8)} | 100.0% | ${knownPayout.toFixed(2).padStart(8)} €`,
);

// ── EXPORT ─────────────────────────────────────────────────────
console.log("\n─── EXPORT ───");

const report = {
  meta: {
    site: "lescalculateurs.fr",
    period: sc.meta.period,
    generatedAt: new Date().toISOString(),
    methodology: {
      score: "Clicks * 1.0 + Impressions * CTR * 0.05, weighted by CTR bonus factor",
      revenueEstimation: "Solde AdSense (107.13 €) réparti au prorata des clics search organiques",
      note: "Les revenus AdSense par page ne sont pas disponibles via API pour les comptes éditeurs individuels",
    },
  },
  topPages: pages.slice(0, 50),
  byCategory: categories.map((c) => ({
    ...c,
    pctClicks:
      totalAllClicks > 0 ? ((c.totalClicks / totalAllClicks) * 100).toFixed(1) + "%" : "0%",
    estimatedRevenue:
      (knownPayout * (totalAllClicks > 0 ? c.totalClicks / totalAllClicks : 0)).toFixed(2) + " €",
  })),
  bySubCategory: subCategories,
  highCTRPages: highCTR.slice(0, 30),
  totals: {
    totalPages: pages.length,
    totalClicks: totalAllClicks,
    totalImpressions: pages.reduce((s, p) => s + p.totalImpr, 0),
    averageCTR:
      totalAllClicks > 0
        ? ((totalAllClicks / pages.reduce((s, p) => s + p.totalImpr, 0)) * 100).toFixed(2) + "%"
        : "0%",
    knownAdSensePayout: knownPayout + " €",
  },
};

const ds = new Date().toISOString().slice(0, 10);
const reportPath = path.join(reportsDir, `top-pages-analysis-${ds}.json`);
const latestPath = path.join(reportsDir, "top-pages-analysis-latest.json");

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
fs.writeFileSync(latestPath, JSON.stringify(report, null, 2), "utf-8");

console.log(`  ✓ ${path.relative(process.cwd(), reportPath)}`);
console.log(`  ✓ ${path.relative(process.cwd(), latestPath)}`);

console.log("\n" + "=".repeat(100));
console.log("  Fin de l'analyse des pages les plus rentables");
console.log("=".repeat(100));
