#!/usr/bin/env node
/**
 * Fusionne les données AdSense (adsense-report-latest.json)
 * avec les données Search Console + Bing (search-console-multi-engine-latest.json)
 * Génère reports/merged-analytics-latest.json
 */

const fs = require("fs");
const path = require("path");

const reportsDir = path.resolve(process.cwd(), "reports");
const scPath = path.join(reportsDir, "search-console-multi-engine-latest.json");
const adsensePath = path.join(reportsDir, "adsense-report-latest.json");

// Charger les rapports
function loadReport(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Fichier introuvable: ${filePath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const sc = loadReport(scPath);
const ad = loadReport(adsensePath);

if (!sc) {
  console.error("❌ Rapport Search Console manquant. Lance d'abord:");
  console.error("   node scripts/fetch-search-console.cjs");
  process.exit(1);
}

// ============================================================
// FORMATAGE
// ============================================================
function parseCurrency(str) {
  return parseFloat(String(str).replace(/[€%\s]/g, "")) || 0;
}

function parseClicks(val) {
  return Number(val) || 0;
}

// ============================================================
// AFFICHAGE
// ============================================================
console.log("=".repeat(80));
console.log("  FUSION ANALYTICS - lescalculateurs.fr");
console.log("=".repeat(80));

// ── SECTION 1 : Search Console ────────────────────────────────
console.log("\n─── SEARCH CONSOLE ───");
console.log(`  Période: ${sc.meta.period.start} → ${sc.meta.period.end} (${sc.meta.period.days}j)`);
if (sc.google.globalStats) {
  const g = sc.google.globalStats;
  console.log(
    `  Google : ${g.clicks} clics | ${g.impressions} impressions | CTR ${g.ctr} | Pos ${g.avgPosition}`,
  );
}
if (sc.bing.globalStats) {
  const b = sc.bing.globalStats;
  console.log(
    `  Bing   : ${b.clicks} clics | ${b.impressions} impressions | CTR ${b.ctr} | Pos ${b.avgPosition}`,
  );
}
if (sc.comparison) {
  console.log(`  Ratio Bing/Google: ${sc.comparison.ratioBingVsGoogle || "N/A"}`);
}

// ── SECTION 2 : AdSense ──────────────────────────────────────
console.log("\n─── ADSENSE ───");
if (ad && ad.totals) {
  console.log(
    `  Période: ${ad.meta.period.start} → ${ad.meta.period.end} (${ad.meta.period.days}j)`,
  );
  console.log(`  Revenus : ${ad.totals.estimatedEarnings}`);
  console.log(`  Pages vues : ${ad.totals.pageViews.toLocaleString()}`);
  console.log(`  Clics ads  : ${ad.totals.adClicks.toLocaleString()}`);
  console.log(`  Impressions ads : ${ad.totals.adImpressions.toLocaleString()}`);
  console.log(`  RPM page : ${ad.totals.pageRPM}`);
  console.log(`  CTR ads  : ${ad.totals.adCTR}`);
} else {
  console.log("  ⚠ Aucune donnée AdSense disponible.");
  console.log("    Lance d'abord: node scripts/fetch-adsense-report.cjs");
  console.log("    Puis vérifie que l'API AdSense est activée dans Google Cloud Console");
}

// ── SECTION 3 : COMPARAISON ────────────────────────────────────
console.log("\n─── COMPARAISON TRAFIC VS REVENUS ───");

const googleClicks = parseClicks(sc.google.globalStats?.clicks);
const bingClicks = parseClicks(sc.bing.globalStats?.clicks);
const totalSearchClicks = googleClicks + bingClicks;
const totalSearchImpr =
  (sc.google.globalStats?.impressions || 0) + (sc.bing.globalStats?.impressions || 0);

console.log(`  Trafic total Search (Google + Bing) : ${totalSearchClicks.toLocaleString()} clics`);
console.log(`  Impressions totales Search          : ${totalSearchImpr.toLocaleString()}`);

if (ad && ad.totals) {
  const adEarnings = parseCurrency(ad.totals.estimatedEarnings);
  const adPageViews = ad.totals.pageViews;
  const adClicks = ad.totals.adClicks;
  const adImpr = ad.totals.adImpressions;
  const adRPM = parseCurrency(ad.totals.pageRPM);

  console.log(`  Revenus AdSense    : ${adEarnings.toFixed(2)} €`);
  console.log(`  Pages vues AdSense : ${adPageViews.toLocaleString()}`);
  console.log(`  Clics ads          : ${adClicks.toLocaleString()}`);
  console.log(`  Impressions ads    : ${adImpr.toLocaleString()}`);
  console.log(`  RPM page           : ${adRPM.toFixed(2)} €`);

  // KPIs croisés
  const rpmBySearchClick =
    totalSearchClicks > 0 ? ((adEarnings / totalSearchClicks) * 1000).toFixed(2) : "N/A";
  const revenuePerSearchClick =
    totalSearchClicks > 0 ? (adEarnings / totalSearchClicks).toFixed(4) : "N/A";
  const adCTRvsSearchCTR =
    totalSearchImpr > 0
      ? `Ad: ${((adClicks / adPageViews) * 100).toFixed(2)}% vs Search: ${((totalSearchClicks / totalSearchImpr) * 100).toFixed(2)}%`
      : "N/A";

  console.log(`\n  KPI croisés :`);
  console.log(`  Revenu par clic Search (RPC)   : ${revenuePerSearchClick} €`);
  console.log(`  RPM pour 1000 clics Search     : ${rpmBySearchClick} €`);
  console.log(
    `  Ratio pages vues / clics Search: ${totalSearchClicks > 0 ? (adPageViews / totalSearchClicks).toFixed(2) : "N/A"}`,
  );
  console.log(
    `  Taux de conversion (ads/pv)    : ${adPageViews > 0 ? ((adClicks / adPageViews) * 100).toFixed(2) : "0.00"}%`,
  );
  console.log(`  CTR comparé ${adCTRvsSearchCTR}`);

  // ── Top pages Search Console les plus monétisées (si dispo) ──
  if (ad.byPage && ad.byPage.length > 0 && sc.google.topPages && sc.google.topPages.length > 0) {
    console.log("\n─── CROSS-REFERENCE PAGES ───");
    console.log("  (Pages dans le top 30 AdSense ET dans le top 30 Search Console)");

    // Créer un map des pages AdSense
    const adPageMap = new Map();
    for (const p of ad.byPage) {
      adPageMap.set(p.page, p);
    }

    // Chercher les correspondances
    const matches = [];
    for (const scPage of sc.google.topPages) {
      const adPage = adPageMap.get(scPage.page);
      if (adPage) {
        matches.push({
          page: scPage.page,
          scClicks: scPage.clicks,
          earnings: parseCurrency(adPage.earnings),
          adPageViews: adPage.pageViews || 0,
          adClicks: adPage.adClicks || 0,
          rpm: parseCurrency(adPage.rpm),
        });
      }
    }

    // Trier par earnings
    matches.sort((a, b) => b.earnings - a.earnings);

    console.log(
      `  ${"Page".padEnd(45)} ${"SC Clics".padStart(8)} ${"€ Ads".padStart(10)} ${"RPM".padStart(8)}`,
    );
    console.log(`  ${"─".repeat(45)} ${"─".repeat(8)} ${"─".repeat(10)} ${"─".repeat(8)}`);
    for (const m of matches.slice(0, 20)) {
      console.log(
        `  ${m.page.padEnd(45).slice(0, 45)} ${String(m.scClicks).padStart(8)} ${m.earnings.toFixed(2).padStart(8)} € ${m.rpm.toFixed(2).padStart(6)} €`,
      );
    }

    if (matches.length === 0) {
      console.log(
        "  (aucune correspondance trouvée — les URL channels AdSense sont peut-être nommés différemment)",
      );
    }
  }
}

// ── EXPORT JSON ──────────────────────────────────────────────────
console.log("\n─── EXPORT RAPPORT FUSIONNÉ ───");

const mergedReport = {
  meta: {
    site: "lescalculateurs.fr",
    generatedAt: new Date().toISOString(),
    sources: {
      searchConsole: sc.meta,
      adsense: ad ? ad.meta : null,
    },
  },
  searchTraffic: {
    google: sc.google.globalStats || null,
    bing: sc.bing.globalStats || null,
    totalClicks: totalSearchClicks,
    totalImpressions: totalSearchImpr,
    comparison: sc.comparison || null,
  },
  adRevenue: ad
    ? {
        totals: ad.totals,
        daily: ad.daily || [],
        topPages: ad.byPage || [],
        topDomains: ad.byDomain || [],
      }
    : {
        error:
          "AdSense data not available. Enable AdSense Management API in Google Cloud Console and run scripts/fetch-adsense-report.cjs",
      },
  crossReference:
    ad && ad.byPage && sc.google.topPages
      ? (() => {
          const adPageMap = new Map();
          for (const p of ad.byPage) adPageMap.set(p.page, p);
          const matches = [];
          for (const scPage of sc.google.topPages) {
            const adPage = adPageMap.get(scPage.page);
            if (adPage) {
              matches.push({
                page: scPage.page,
                searchClicks: scPage.clicks,
                searchImpressions: scPage.impressions,
                searchCTR: scPage.ctr,
                searchPosition: scPage.position,
                adEarnings: adPage.earnings,
                adPageViews: adPage.pageViews || 0,
                adClicks: adPage.adClicks || 0,
                adRPM: adPage.rpm,
              });
            }
          }
          return matches;
        })()
      : [],
  kpi:
    ad && ad.totals
      ? {
          revenuePerSearchClick:
            totalSearchClicks > 0
              ? (parseCurrency(ad.totals.estimatedEarnings) / totalSearchClicks).toFixed(4) + " €"
              : "N/A",
          rpmPer1000SearchClicks:
            totalSearchClicks > 0
              ? ((parseCurrency(ad.totals.estimatedEarnings) / totalSearchClicks) * 1000).toFixed(
                  2,
                ) + " €"
              : "N/A",
          pageViewsPerSearchClick:
            totalSearchClicks > 0 ? (ad.totals.pageViews / totalSearchClicks).toFixed(2) : "N/A",
        }
      : null,
};

const mergedDateStamp = new Date().toISOString().slice(0, 10);
const mergedPath = path.join(reportsDir, `merged-analytics-${mergedDateStamp}.json`);
const mergedLatestPath = path.join(reportsDir, "merged-analytics-latest.json");

fs.writeFileSync(mergedPath, JSON.stringify(mergedReport, null, 2), "utf-8");
fs.writeFileSync(mergedLatestPath, JSON.stringify(mergedReport, null, 2), "utf-8");

console.log(`  ✓ ${path.relative(process.cwd(), mergedPath)}`);
console.log(`  ✓ ${path.relative(process.cwd(), mergedLatestPath)}`);

console.log("\n" + "=".repeat(80));
console.log("  Fin de la fusion analytics");
console.log("=".repeat(80));
