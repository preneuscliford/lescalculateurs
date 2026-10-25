#!/usr/bin/env node
/**
 * Requêtes Google Search Console par page (dimensions « page » et « query »), filtrées sur un préfixe
 * d'URL. Sert à vérifier le critère 1 des pages de questions (formulation réellement recherchée).
 *
 * Usage : node scripts/fetch-search-console-queries.cjs --prefix=/pages/apl [--days=90] [--out=fichier.json]
 * Lecture seule. Auth : même compte de service que fetch-search-console.cjs.
 */
const fs = require("fs");
const path = require("path");
const { GoogleAuth } = require("google-auth-library");
const { loadEnvFile } = require("./lib/load-env.cjs");
const { resolveGoogleCredentials } = require("./lib/google-credentials.cjs");

loadEnvFile();

const SITE_DOMAIN = "sc-domain:lescalculateurs.fr";
const arg = (nom, defaut) => process.argv.find((a) => a.startsWith(`--${nom}=`))?.split("=").slice(1).join("=") ?? defaut;
const PREFIXE = arg("prefix", "/pages/apl");
const JOURS = Number(arg("days", 90));
const SORTIE = path.resolve(arg("out", `reports/search-console-queries-${PREFIXE.replace(/\W+/g, "-").replace(/^-|-$/g, "")}-latest.json`));

const jour = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};

async function main() {
  const auth = new GoogleAuth({ keyFile: resolveGoogleCredentials(), scopes: ["https://www.googleapis.com/auth/webmasters.readonly"] });
  const client = await auth.getClient();
  const debut = jour(3 + JOURS);
  const fin = jour(3);
  const lignes = [];
  for (let startRow = 0; ; startRow += 25000) {
    const res = await client.request({
      url: `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_DOMAIN)}/searchAnalytics/query`,
      method: "POST",
      data: {
        startDate: debut,
        endDate: fin,
        dimensions: ["page", "query"],
        dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "contains", expression: PREFIXE }] }],
        rowLimit: 25000,
        startRow,
      },
    });
    const rows = res.data.rows || [];
    lignes.push(...rows.map((r) => ({ page: r.keys[0].replace("https://www.lescalculateurs.fr", ""), query: r.keys[1], clicks: r.clicks, impressions: r.impressions, position: Math.round(r.position * 10) / 10 })));
    if (rows.length < 25000) break;
  }
  fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
  fs.writeFileSync(SORTIE, JSON.stringify({ meta: { prefixe: PREFIXE, debut, fin, generatedAt: new Date().toISOString(), lignes: lignes.length }, lignes }, null, 2) + "\n", "utf8");
  console.log(`${lignes.length} lignes page × requête (${debut} → ${fin}) → ${path.relative(process.cwd(), SORTIE)}`);
}

main().catch((e) => {
  console.error(e.response?.data?.error?.message || e.message);
  process.exit(1);
});
