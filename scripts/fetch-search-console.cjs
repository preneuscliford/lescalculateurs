#!/usr/bin/env node

/**
 * Script pour accéder aux APIs Google Search Console + Bing Webmaster Tools
 *
 * Google: Service account indexing-bot@mes-sass.iam.gserviceaccount.com
 * Bing:   API Key depuis .env (BING_API_KEY)
 */

const fs = require("fs");
const path = require("path");
const { GoogleAuth } = require("google-auth-library");
const { loadEnvFile } = require("./lib/load-env.cjs");

loadEnvFile();

// ============================================================
// CONFIG
// ============================================================
const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const SEARCH_CONSOLE_API = "https://www.googleapis.com/webmasters/v3";
const SITE_URL = "https://www.lescalculateurs.fr";
const SITE_DOMAIN = "sc-domain:lescalculateurs.fr";
const CREDS_PATH = path.resolve(__dirname, "..", "mes-sass-a09ffa66ca74.json");

const BING_API_KEY = process.env.BING_API_KEY || "";
const BING_API_BASE = "https://ssl.bing.com/webmaster/api.svc/json";

const END_DATE = "2026-06-17";
const START_DATE = "2026-05-21";

// ============================================================
// GOOGLE SEARCH CONSOLE
// ============================================================

async function getGoogleAuthClient() {
  if (!fs.existsSync(CREDS_PATH)) {
    throw new Error(`Credentials file not found: ${CREDS_PATH}`);
  }
  const auth = new GoogleAuth({ keyFile: CREDS_PATH, scopes: [SEARCH_CONSOLE_SCOPE] });
  return auth.getClient();
}

async function googleListSites(client) {
  try {
    const res = await client.request({ url: `${SEARCH_CONSOLE_API}/sites`, method: "GET" });
    return res.data;
  } catch (err) {
    console.log(`  ⚠ Liste des sites Google: ${err.message}`);
    return null;
  }
}

async function googlePerformanceData(client, startDate, endDate, dimensions, rowLimit) {
  const body = { startDate, endDate, dimensions, rowLimit, aggregationType: "auto" };
  const url = `${SEARCH_CONSOLE_API}/sites/${encodeURIComponent(SITE_DOMAIN)}/searchAnalytics/query`;

  try {
    const res = await client.request({
      url,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: body,
    });
    return res.data;
  } catch (err) {
    const url2 = `${SEARCH_CONSOLE_API}/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;
    const res2 = await client.request({
      url: url2,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: body,
    });
    return res2.data;
  }
}

// ============================================================
// BING WEBMASTER TOOLS
// ============================================================

function bingApiUrl(endpoint, params = {}) {
  const qs = new URLSearchParams(params);
  return `${BING_API_BASE}/${endpoint}?apikey=${BING_API_KEY}&${qs.toString()}`;
}

async function bingFetch(endpoint, params = {}) {
  if (!BING_API_KEY) throw new Error("BING_API_KEY manquant dans .env");
  const url = bingApiUrl(endpoint, params);
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bing HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function bingGetQueryStats(siteUrl) {
  return bingFetch("GetQueryStats", { siteUrl });
}

async function bingGetPageStats(siteUrl) {
  return bingFetch("GetPageStats", { siteUrl });
}

// ============================================================
// FORMATTING
// ============================================================

function formatGoogleRow(row) {
  const keys = (row.keys || []).map((k) => k.replace(/^https?:\/\/www\.lescalculateurs\.fr/, ""));
  return `${(keys[0] || "").padEnd(55)} | clics=${String(row.clicks).padStart(4)} | impr=${String(row.impressions).padStart(6)} | ctr=${(row.ctr * 100).toFixed(2).padStart(6)}% | pos=${row.position.toFixed(1).padStart(5)}`;
}

function formatBingRow(prefix, clicks, impressions, ctr, position) {
  const pct = ctr ? ctr.toFixed(2) : "0.00";
  const pos = position ? position.toFixed(1) : "-";
  return `${(prefix || "").padEnd(55)} | clics=${String(clicks).padStart(4)} | impr=${String(impressions).padStart(6)} | ctr=${pct.padStart(6)}% | pos=${String(pos).padStart(5)}`;
}

/**
 * Agrège les résultats Bing (les rows sont par date seule, pas de dimension device).
 * L'API Bing utilise "Query" comme champ pour les requêtes ET pour les pages (URL).
 * Positions: AvgImpressionPosition (moy pondérée). Pas de champ CTR natif → recalculé.
 */
function aggregateBingRows(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = row.Query || "(inconnu)";
    const clicks = Number(row.Clicks) || 0;
    const impr = Number(row.Impressions) || 0;
    const pos = Number(row.AvgImpressionPosition) || 0;
    const entry = map.get(key) || { key, clicks: 0, impressions: 0, posWeightedSum: 0 };
    entry.clicks += clicks;
    entry.impressions += impr;
    if (pos > 0 && impr > 0) {
      entry.posWeightedSum += pos * impr;
    }
    map.set(key, entry);
  }
  const result = [];
  for (const [key, e] of map) {
    const ctr = e.impressions > 0 ? (e.clicks / e.impressions) * 100 : 0;
    const pos = e.impressions > 0 ? e.posWeightedSum / e.impressions : 0;
    result.push({ key, clicks: e.clicks, impressions: e.impressions, ctr, position: pos });
  }
  return result.sort((a, b) => b.clicks - a.clicks);
}

function sortByClicks(arr, keyFn) {
  return [...arr].sort((a, b) => keyFn(b) - keyFn(a));
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log("=".repeat(70));
  console.log("  ANALYSE MULTI-MOTEURS - lescalculateurs.fr");
  console.log("  Période: " + START_DATE + " → " + END_DATE + " (28 jours)");
  console.log("=".repeat(70));
  console.log("");

  // ── GOOGLE ────────────────────────────────────────────────
  console.log("─".repeat(70));
  console.log("  GOOGLE SEARCH CONSOLE");
  console.log("  Service account: indexing-bot@mes-sass.iam.gserviceaccount.com");
  console.log("─".repeat(70));
  console.log("");

  let googleClient;
  try {
    googleClient = await getGoogleAuthClient();
    console.log("  ✓ Google Auth OK");
  } catch (err) {
    console.error("  ✗ Google Auth error:", err.message);
  }

  if (googleClient) {
    // Sites
    const sites = await googleListSites(googleClient);
    if (sites && sites.siteEntry) {
      for (const s of sites.siteEntry) {
        console.log(`  Site: ${s.siteUrl} (${s.permissionLevel})`);
      }
    }
    console.log("");

    // Requêtes
    console.log("  ◆ Top 15 requêtes Google :");
    try {
      const qd = await googlePerformanceData(googleClient, START_DATE, END_DATE, ["query"], 15);
      if (qd && qd.rows) {
        for (const row of qd.rows) {
          console.log("    " + formatGoogleRow(row));
        }
      }
    } catch (err) {
      console.error("  ✗ Erreur requêtes:", err.message);
    }
    console.log("");

    // Pages
    console.log("  ◆ Top 15 pages Google :");
    try {
      const pd = await googlePerformanceData(googleClient, START_DATE, END_DATE, ["page"], 15);
      if (pd && pd.rows) {
        for (const row of pd.rows) {
          console.log("    " + formatGoogleRow(row));
        }
      }
    } catch (err) {
      console.error("  ✗ Erreur pages:", err.message);
    }
    console.log("");

    // Stats globales
    console.log("  ◆ Stats globales Google (28j) :");
    try {
      const stats = await googlePerformanceData(googleClient, START_DATE, END_DATE, [], 1);
      if (stats && stats.rows && stats.rows.length) {
        const r = stats.rows[0];
        console.log(
          `    Clics: ${r.clicks} | Impr: ${r.impressions} | CTR: ${(r.ctr * 100).toFixed(2)}% | Pos: ${r.position.toFixed(1)}`,
        );
      }
    } catch (err) {
      // ignore
    }
    console.log("");
  }

  // ── BING ───────────────────────────────────────────────────
  console.log("─".repeat(70));
  console.log("  BING WEBMASTER TOOLS");
  console.log("─".repeat(70));
  console.log("");

  if (!BING_API_KEY) {
    console.log("  ⚠ BING_API_KEY non configuré dans .env");
  } else {
    // Requêtes Bing
    console.log("  ◆ Top 15 requêtes Bing (agrégées) :");
    try {
      const bq = await bingGetQueryStats(SITE_URL);
      if (bq && bq.d && bq.d.length) {
        const aggregated = aggregateBingRows(bq.d);
        for (const row of aggregated.slice(0, 15)) {
          const kw = (row.key || "").slice(0, 52);
          console.log(
            "    " + formatBingRow(kw, row.clicks, row.impressions, row.ctr, row.position),
          );
        }
      } else {
        console.log("    (aucune donnée)");
      }
    } catch (err) {
      console.error("  ✗ Erreur requêtes Bing:", err.message);
    }
    console.log("");

    // Pages Bing
    console.log("  ◆ Top 15 pages Bing (agrégées) :");
    try {
      const bp = await bingGetPageStats(SITE_URL);
      if (bp && bp.d && bp.d.length) {
        const aggregated = aggregateBingRows(bp.d);
        for (const row of aggregated.slice(0, 15)) {
          const pagePath = (row.key || "")
            .replace(/^https?:\/\/www\.lescalculateurs\.fr/, "")
            .slice(0, 52);
          console.log(
            "    " + formatBingRow(pagePath, row.clicks, row.impressions, row.ctr, row.position),
          );
        }
      } else {
        console.log("    (aucune donnée)");
      }
    } catch (err) {
      console.error("  ✗ Erreur pages Bing:", err.message);
    }
    console.log("");
  }

  // ── COMPARAISON GOOGLE vs BING ─────────────────────────────
  console.log("─".repeat(70));
  console.log("  COMPARAISON GOOGLE vs BING");
  console.log("─".repeat(70));
  console.log("");

  try {
    const [gStats, bqStats, bpStats] = await Promise.all([
      googleClient ? googlePerformanceData(googleClient, START_DATE, END_DATE, [], 1) : null,
      BING_API_KEY ? bingGetQueryStats(SITE_URL) : null,
      BING_API_KEY ? bingGetPageStats(SITE_URL) : null,
    ]);

    const gClicks = gStats?.rows?.[0]?.clicks || 0;
    const gImpr = gStats?.rows?.[0]?.impressions || 0;
    const gCtr = (gStats?.rows?.[0]?.ctr || 0) * 100;

    const bClicks = (bqStats?.d || []).reduce((s, r) => s + (r.Clicks || 0), 0);
    const bImpr = (bqStats?.d || []).reduce((s, r) => s + (r.Impressions || 0), 0);
    const bCtr = bImpr > 0 ? (bClicks / bImpr) * 100 : 0;

    console.log(`  Google : ${gClicks} clics | ${gImpr} impr | CTR ${gCtr.toFixed(2)}%`);
    console.log(`  Bing   : ${bClicks} clics | ${bImpr} impr | CTR ${bCtr.toFixed(2)}%`);
    if (gClicks > 0) {
      const ratio = ((bClicks / gClicks) * 100).toFixed(1);
      console.log(`  Ratio Bing/Google: ${ratio}% du trafic Google`);
    }
    console.log("");
  } catch (err) {
    // ignore
  }

  // ── EXPORT JSON ──────────────────────────────────────────────
  console.log("─".repeat(70));
  console.log("  EXPORT RAPPORT JSON");
  console.log("─".repeat(70));
  console.log("");

  try {
    // Récupérer toutes les données pour le rapport complet
    const [gQueries, gPages, gStats, bQueries, bPages] = await Promise.all([
      googleClient
        ? googlePerformanceData(googleClient, START_DATE, END_DATE, ["query"], 100)
        : null,
      googleClient
        ? googlePerformanceData(googleClient, START_DATE, END_DATE, ["page"], 100)
        : null,
      googleClient ? googlePerformanceData(googleClient, START_DATE, END_DATE, [], 1) : null,
      BING_API_KEY ? bingGetQueryStats(SITE_URL) : null,
      BING_API_KEY ? bingGetPageStats(SITE_URL) : null,
    ]);

    const report = {
      meta: {
        site: "lescalculateurs.fr",
        period: { start: START_DATE, end: END_DATE, days: 28 },
        generatedAt: new Date().toISOString(),
        engines: ["google", "bing"],
      },
      google: {
        auth: "service_account: indexing-bot@mes-sass.iam.gserviceaccount.com",
        globalStats: gStats?.rows?.[0]
          ? {
              clicks: gStats.rows[0].clicks,
              impressions: gStats.rows[0].impressions,
              ctr: (gStats.rows[0].ctr * 100).toFixed(2) + "%",
              avgPosition: gStats.rows[0].position.toFixed(1),
            }
          : null,
        topQueries: (gQueries?.rows || []).map((r) => ({
          query: (r.keys || [])[0] || "",
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: (r.ctr * 100).toFixed(2) + "%",
          position: r.position.toFixed(1),
        })),
        topPages: (gPages?.rows || []).map((r) => ({
          page: ((r.keys || [])[0] || "").replace(/^https?:\/\/www\.lescalculateurs\.fr/, ""),
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: (r.ctr * 100).toFixed(2) + "%",
          position: r.position.toFixed(1),
        })),
      },
      bing: {
        auth: "api_key: BING_API_KEY",
        globalStats: bQueries?.d
          ? (() => {
              const all = aggregateBingRows(bQueries.d);
              const totalClicks = all.reduce((s, r) => s + r.clicks, 0);
              const totalImpr = all.reduce((s, r) => s + r.impressions, 0);
              const avgPos =
                all.reduce((s, r) => s + r.position * r.impressions, 0) / Math.max(totalImpr, 1);
              return {
                clicks: totalClicks,
                impressions: totalImpr,
                ctr: totalImpr > 0 ? ((totalClicks / totalImpr) * 100).toFixed(2) + "%" : "0.00%",
                avgPosition: avgPos.toFixed(1),
                distinctQueries: all.length,
              };
            })()
          : null,
        topQueries: bQueries?.d
          ? aggregateBingRows(bQueries.d)
              .slice(0, 100)
              .map((r) => ({
                query: r.key,
                clicks: r.clicks,
                impressions: r.impressions,
                ctr: r.ctr.toFixed(2) + "%",
                position: r.position.toFixed(1),
              }))
          : [],
        topPages: bPages?.d
          ? aggregateBingRows(bPages.d)
              .slice(0, 100)
              .map((r) => ({
                page: r.key.replace(/^https?:\/\/www\.lescalculateurs\.fr/, ""),
                clicks: r.clicks,
                impressions: r.impressions,
                ctr: r.ctr.toFixed(2) + "%",
                position: r.position.toFixed(1),
              }))
          : [],
      },
      comparison: {
        note: "Période identique 28j pour les deux moteurs.",
        google: {
          clicks: gStats?.rows?.[0]?.clicks || 0,
          impressions: gStats?.rows?.[0]?.impressions || 0,
          ctr: ((gStats?.rows?.[0]?.ctr || 0) * 100).toFixed(2) + "%",
        },
        bing: bQueries?.d
          ? (() => {
              const all = aggregateBingRows(bQueries.d);
              const c = all.reduce((s, r) => s + r.clicks, 0);
              const i = all.reduce((s, r) => s + r.impressions, 0);
              return {
                clicks: c,
                impressions: i,
                ctr: i > 0 ? ((c / i) * 100).toFixed(2) + "%" : "0.00%",
              };
            })()
          : { clicks: 0, impressions: 0, ctr: "0.00%" },
        ratioBingVsGoogle:
          gStats?.rows?.[0]?.clicks > 0 && bQueries?.d
            ? (
                (aggregateBingRows(bQueries.d).reduce((s, r) => s + r.clicks, 0) /
                  gStats.rows[0].clicks) *
                100
              ).toFixed(1) + "%"
            : "N/A",
      },
    };

    const reportsDir = path.resolve(process.cwd(), "reports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const dateStamp = new Date().toISOString().slice(0, 10);
    const reportPath = path.join(reportsDir, `search-console-multi-engine-${dateStamp}.json`);
    const latestPath = path.join(reportsDir, "search-console-multi-engine-latest.json");

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2), "utf-8");

    console.log(`  ✓ Rapport JSON: ${path.relative(process.cwd(), reportPath)}`);
    console.log(`  ✓ Rapport latest: ${path.relative(process.cwd(), latestPath)}`);
    console.log(`    Top 100 requêtes + pages par moteur`);
    console.log(`    Prêt à donner à GPT pour analyse`);
    console.log("");
  } catch (err) {
    console.error("  ✗ Erreur export:", err.message);
  }

  console.log("=".repeat(70));
  console.log("  Fin de l'analyse");
  console.log("=".repeat(70));
}

main().catch((error) => {
  console.error("Script error:", error?.message || error);
  process.exit(1);
});
