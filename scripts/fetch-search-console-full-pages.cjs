#!/usr/bin/env node
/**
 * Recupere la liste COMPLETE des pages (dimension "page") vues par Google
 * Search Console sur une fenetre large (par defaut 90 jours), sans se
 * limiter a un top N — necessaire pour detecter les pages a zero
 * impression, invisibles dans un rapport "top pages".
 *
 * Reutilise l'auth deja en place dans fetch-search-console.cjs.
 * Lecture seule : n'ecrit que reports/search-console-all-pages-latest.json.
 */
const fs = require("fs");
const path = require("path");
const { GoogleAuth } = require("google-auth-library");
const { loadEnvFile } = require("./lib/load-env.cjs");

loadEnvFile();

const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const SEARCH_CONSOLE_API = "https://www.googleapis.com/webmasters/v3";
const SITE_DOMAIN = "sc-domain:lescalculateurs.fr";
const { resolveGoogleCredentials } = require("./lib/google-credentials.cjs");
const CREDS_PATH = resolveGoogleCredentials();

function isoDateMinusDays(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

const WINDOW_DAYS = Number(process.argv.find((a) => a.startsWith("--days="))?.split("=")[1] || 90);
const END_DATE = isoDateMinusDays(3);
const START_DATE = isoDateMinusDays(3 + WINDOW_DAYS);

async function getClient() {
  const auth = new GoogleAuth({ keyFile: CREDS_PATH, scopes: [SEARCH_CONSOLE_SCOPE] });
  return auth.getClient();
}

async function fetchAllPages(client) {
  const all = [];
  let startRow = 0;
  const rowLimit = 25000;
  for (;;) {
    const body = {
      startDate: START_DATE,
      endDate: END_DATE,
      dimensions: ["page"],
      rowLimit,
      startRow,
      aggregationType: "auto",
    };
    const res = await client.request({
      url: `${SEARCH_CONSOLE_API}/sites/${encodeURIComponent(SITE_DOMAIN)}/searchAnalytics/query`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: body,
    });
    const rows = res.data.rows || [];
    all.push(...rows);
    console.log(`  page ${startRow / rowLimit + 1}: ${rows.length} lignes (total cumule ${all.length})`);
    if (rows.length < rowLimit) break;
    startRow += rowLimit;
  }
  return all;
}

async function main() {
  console.log(`Fenetre : ${START_DATE} -> ${END_DATE} (${WINDOW_DAYS} jours)`);
  const client = await getClient();
  const rows = await fetchAllPages(client);

  const pages = rows.map((r) => ({
    url: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));

  const output = {
    meta: {
      site: "lescalculateurs.fr",
      period: { start: START_DATE, end: END_DATE, days: WINDOW_DAYS },
      generatedAt: new Date().toISOString(),
      totalPagesWithImpressions: pages.length,
    },
    pages,
  };

  const outPath = path.resolve(process.cwd(), "reports", "search-console-all-pages-latest.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\n✅ ${pages.length} pages avec au moins 1 impression sur ${WINDOW_DAYS} jours.`);
  console.log(`Ecrit : ${path.relative(process.cwd(), outPath)}`);
}

main().catch((err) => {
  console.error("Echec:", err.message);
  process.exit(1);
});
