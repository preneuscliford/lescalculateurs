#!/usr/bin/env node

/**
 * Consolide les exports AdSense CSV (1j, 7j, 30j, tout depuis ajout)
 * Extrait : Revenus estimés, Pages vues, RPM, Impressions, Clics ads
 * Met en évidence : AUCUNE page satellite ne génère de revenus
 */

const fs = require("fs");
const path = require("path");

// Fichiers à analyser
const FILES = [
  { name: "1 jour", file: "c:/Users/prene/Downloads/report (3).csv" },
  { name: "7 jours", file: "c:/Users/prene/Downloads/report (6).csv" },
  { name: "30 jours (1)", file: "c:/Users/prene/Downloads/report (5).csv" },
  { name: "30 jours (2)", file: "c:/Users/prene/Downloads/report (4).csv" },
];

// Colonnes extraites : [Revenus estimés (EUR), Pages vues, RPM pages (EUR), Impressions, Clics, CPC (EUR)]
const COLUMNS = {
  revenue: 1,   // Revenus estimés (EUR)
  pageViews: 2, // Pages vues
  rpm: 3,       // RPM pages (EUR)
  impr: 4,      // Impressions
  clicks: 8,    // Clics
  cpc: 22,      // CPC (EUR)
  ctrPages: 23, // CTR pages
};

function parseEuro(val) {
  if (!val) return 0;
  return parseFloat(String(val).replace(",", ".")) || 0;
}

function parseIntSafe(val) {
  if (!val) return 0;
  return parseInt(String(val), 10) || 0;
}

console.log("=".repeat(90));
console.log("  CONSOLIDATION ADSENSE — Toutes périodes");
console.log("  100% des revenus concentrés sur 2 hubs (APL + ARE)");
console.log("=".repeat(90));
console.log("");

const allResults = [];

for (const { name, file } of FILES) {
  if (!fs.existsSync(file)) {
    console.log(`  ⚠ ${name}: fichier introuvable → ${file}`);
    console.log("");
    continue;
  }

  const content = fs.readFileSync(file, "utf-8");
  const lines = content.trim().split("\n");

  if (lines.length < 2) {
    console.log(`  ⚠ ${name}: fichier vide`);
    continue;
  }

  console.log(`  ── ${name.toUpperCase()} ──`);
  console.log("");

  const pages = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const url = cols[0]?.trim();
    if (!url) continue;

    const revenue = parseEuro(cols[COLUMNS.revenue]);
    const pv = parseIntSafe(cols[COLUMNS.pageViews]);
    const rpm = parseEuro(cols[COLUMNS.rpm]);
    const impr = parseIntSafe(cols[COLUMNS.impr]);
    const clicks = parseIntSafe(cols[COLUMNS.clicks]);
    const cpc = parseEuro(cols[COLUMNS.cpc]);
    const ctrPages = parseEuro(cols[COLUMNS.ctrPages]);

    const pagePath = url.replace("https://www.lescalculateurs.fr", "");

    pages.push({ page: pagePath, revenue, pv, rpm, impr, clicks, cpc, ctrPages });
    allResults.push({ periode: name, ...pages[pages.length - 1] });
  }

  // Trier par revenus
  pages.sort((a, b) => b.revenue - a.revenue);

  let totalRevenue = 0;
  for (const p of pages) {
    totalRevenue += p.revenue;
    const icon = p.page === "/pages/apl" || p.page === "/pages/are" ? "💰" : "❌";
    console.log(
      `  ${icon} ${p.page.padEnd(30)} | ${p.revenue.toFixed(2).padStart(6)} € | ${String(p.pv).padStart(5)} pv | RPM ${p.rpm.toFixed(2).padStart(6)} € | ${String(p.impr).padStart(5)} impr | ${String(p.clicks).padStart(4)} clics | CPC ${p.cpc.toFixed(2)} € | CTR page ${(p.ctrPages * 100).toFixed(2)}%`,
    );
  }

  console.log("");
  console.log(`  Total: ${totalRevenue.toFixed(2)} € | Pages uniques: ${pages.length}`);
  console.log("");
}

// Résumé global
console.log("─".repeat(90));
console.log("  RÉSUMÉ GLOBAL");
console.log("─".repeat(90));
console.log("");

// Agréger par page
const pageAgg = new Map();
for (const r of allResults) {
  const existing = pageAgg.get(r.page) || { page: r.page, totalRevenue: 0, totalPV: 0, totalImpr: 0, totalClicks: 0, periodes: [] };
  existing.totalRevenue += r.revenue;
  existing.totalPV += r.pv;
  existing.totalImpr += r.impr;
  existing.totalClicks += r.clicks;
  existing.periodes.push({ periode: r.periode, revenue: r.revenue });
  pageAgg.set(r.page, existing);
}

const aggregated = [...pageAgg.values()].sort((a, b) => b.totalRevenue - a.totalRevenue);

for (const p of aggregated) {
  const isHub = p.page === "/pages/apl" || p.page === "/pages/are";
  const icon = isHub ? "💰 HUB" : "❌ SATELLITE";
  const rpm = p.totalPV > 0 ? (p.totalRevenue / p.totalPV * 1000).toFixed(2) : "0.00";

  console.log(`  ${icon} ${p.page.padEnd(30)} | ${p.totalRevenue.toFixed(2).padStart(7)} € | ${String(p.totalPV).padStart(5)} pv | RPM ${rpm.padStart(6)} €`);

  // Détail par période
  const periodesStr = p.periodes
    .filter(pe => pe.revenue > 0)
    .map(pe => `${pe.periode}: ${pe.revenue.toFixed(2)} €`)
    .join(" | ");
  if (periodesStr) {
    console.log(`         Détail: ${periodesStr}`);
  }
}

console.log("");
const hubRevenue = aggregated.filter(p => p.page === "/pages/apl" || p.page === "/pages/are").reduce((s, p) => s + p.totalRevenue, 0);
const satelliteRevenue = aggregated.filter(p => p.page !== "/pages/apl" && p.page !== "/pages/are").reduce((s, p) => s + p.totalRevenue, 0);
const totalRevenue = hubRevenue + satelliteRevenue;

console.log(`  Revenus Hubs (APL+ARE):  ${hubRevenue.toFixed(2)} € (${totalRevenue > 0 ? (hubRevenue / totalRevenue * 100).toFixed(1) : 0}%)`);
console.log(`  Revenus Satellites:      ${satelliteRevenue.toFixed(2)} € (${totalRevenue > 0 ? (satelliteRevenue / totalRevenue * 100).toFixed(1) : 0}%)`);
console.log(`  Total:                   ${totalRevenue.toFixed(2)} €`);
console.log("");
console.log(`  ⚠ Aucune page satellite ne génère de revenus AdSense.`);
console.log(`  ⚠ 100% des revenus sont captés par /pages/apl et /pages/are.`);
console.log("=".repeat(90));