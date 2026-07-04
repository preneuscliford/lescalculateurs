#!/usr/bin/env node
/**
 * Récupère les données AdSense pour lescalculateurs.fr
 * Utilise l'API AdSense v2 (seule version active)
 *
 * Note: l'endpoint reports:generate n'est pas disponible pour les comptes
 * AdSense individuels (réservé aux comptes MCM/AdSense for Platforms).
 * En attendant, on récupère les données disponibles (compte, payments, channels).
 *
 * Pour les revenus quotidiens, utiliser l'interface AdSense directement :
 *   https://www.google.com/adsense/new/u/0/pub-2209781252231399/reporting/dashboard
 */

const fs = require("fs");
const path = require("path");
const { loadEnvFile } = require("./lib/load-env.cjs");
const { OAuth2Client } = require("google-auth-library");

loadEnvFile();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.ADSENSE_REFRESH_TOKEN;
const ACCOUNT_ID = "pub-2209781252231399";

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error(
    "❌ GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET ou ADSENSE_REFRESH_TOKEN manquant dans .env",
  );
  process.exit(1);
}

function formatC(micros) {
  return (Number(micros) / 1_000_000).toFixed(2) + " €";
}

async function main() {
  console.log("=".repeat(70));
  console.log("  ADSENSE DATA - lescalculateurs.fr");
  console.log(`  Compte: accounts/${ACCOUNT_ID}`);
  console.log("=".repeat(70));

  const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  console.log("\n✅ OAuth2Client prêt");

  // ── Compte ──────────────────────────────────────────────────
  console.log("\n🔍 Account info...");
  let accountInfo = null;
  try {
    const accRes = await oauth2Client.request({
      url: `https://adsense.googleapis.com/v2/accounts/${ACCOUNT_ID}`,
      method: "GET",
    });
    accountInfo = accRes.data;
    console.log(`   ✅ ${accountInfo.displayName} (${accountInfo.state})`);
  } catch (e) {
    console.log(`   ❌ ${e.message}`);
  }

  // ── Payments ─────────────────────────────────────────────────
  console.log("\n💶 Payments...");
  let payments = null;
  try {
    const payRes = await oauth2Client.request({
      url: `https://adsense.googleapis.com/v2/accounts/${ACCOUNT_ID}/payments`,
      method: "GET",
    });
    payments = payRes.data.payments || [];
    for (const p of payments) console.log(`   - ${p.name}: ${p.amount || "N/A"}`);
  } catch (e) {
    console.log(`   ❌ ${e.message}`);
  }

  // ── AdClients ────────────────────────────────────────────────
  console.log("\n📋 AdClients...");
  let adClients = [];
  try {
    const acRes = await oauth2Client.request({
      url: `https://adsense.googleapis.com/v2/accounts/${ACCOUNT_ID}/adclients`,
      method: "GET",
    });
    adClients = acRes.data.adClients || [];
    for (const ac of adClients) console.log(`   - ${ac.name} (${ac.productCode}, ${ac.state})`);
  } catch (e) {
    console.log(`   ❌ ${e.message}`);
  }

  // ── URL Channels ─────────────────────────────────────────────
  console.log("\n🔗 URL Channels...");
  let urlChannels = [];
  if (adClients.length > 0) {
    const clientName = adClients[0].name.split("/").pop();
    try {
      const ucRes = await oauth2Client.request({
        url: `https://adsense.googleapis.com/v2/accounts/${ACCOUNT_ID}/adclients/${clientName}/urlchannels`,
        method: "GET",
      });
      urlChannels = ucRes.data.urlChannels || [];
      for (const uc of urlChannels) console.log(`   - ${uc.uriPattern} (${uc.name})`);
    } catch (e) {
      console.log(`   ❌ ${e.message}`);
    }
  }

  // ── EXPORT ─────────────────────────────────────────────────────
  console.log("\n─".repeat(70));
  console.log("  EXPORT JSON");
  console.log("─".repeat(70));

  const report = {
    meta: {
      account: `accounts/${ACCOUNT_ID}`,
      site: "lescalculateurs.fr",
      generatedAt: new Date().toISOString(),
      note: "API Reporting (reports:generate) non disponible pour compte éditeur individuel. Les revenus quotidiens ne sont pas accessibles via API.",
    },
    account: accountInfo,
    payments,
    adClients,
    urlChannels,
  };

  const reportsDir = path.resolve(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const ds = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(
    path.join(reportsDir, `adsense-report-${ds}.json`),
    JSON.stringify(report, null, 2),
    "utf-8",
  );
  fs.writeFileSync(
    path.join(reportsDir, "adsense-report-latest.json"),
    JSON.stringify(report, null, 2),
    "utf-8",
  );
  console.log(`  ✓ reports/adsense-report-${ds}.json`);
  console.log(`  ✓ reports/adsense-report-latest.json`);

  console.log("\n⚠ L'API AdSense Reporting n'est pas accessible pour ce compte.");
  console.log("  Pour comparer les revenus avec le trafic Search Console, utilise :");
  console.log("  https://www.google.com/adsense/new/u/0/pub-2209781252231399/reporting/dashboard");

  console.log("\n" + "=".repeat(70));
  console.log("  Fin");
  console.log("=".repeat(70));
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
