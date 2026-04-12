#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const [k, ...rest] = raw.slice(2).split("=");
    args[k] = rest.length ? rest.join("=") : "true";
  }
  return args;
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    env[key] = value;
  }
  return env;
}

function ensureReportsDir() {
  const reportsDir = path.resolve(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  return reportsDir;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const envFile = readEnvFile(path.resolve(process.cwd(), ".env"));
  const apiKey = process.env.SEMRUSH_API_KEY || envFile.SEMRUSH_API_KEY;

  if (!apiKey) {
    console.error("Erreur: SEMRUSH_API_KEY introuvable (env ou .env).");
    process.exit(1);
  }

  const preset = args.preset || "overview";
  const now = new Date().toISOString().slice(0, 10);
  const domain = args.domain || "lescalculateurs.fr";
  const database = args.database || "fr";

  const params = new URLSearchParams();
  params.set("key", apiKey);
  params.set("database", database);

  if (preset === "overview") {
    params.set("type", "domain_ranks");
    params.set("domain", domain);
    params.set("display_limit", args.display_limit || "10");
    params.set("export_columns", args.export_columns || "Dn,Rk,Or,Ot,Oc,Ad,At,Ac");
  } else if (preset === "positions") {
    params.set("type", "domain_organic");
    params.set("domain", domain);
    params.set("display_limit", args.display_limit || "20");
    params.set("export_columns", args.export_columns || "Ph,Po,Nq,Cp,Ur,Tr,Tc");
  } else {
    if (!args.type) {
      console.error("Erreur: --type est requis avec --preset=custom.");
      process.exit(1);
    }
    params.set("type", args.type);
    if (args.domain) params.set("domain", args.domain);
    for (const [key, value] of Object.entries(args)) {
      if (
        [
          "preset",
          "type",
          "domain",
          "database",
          "save",
          "format",
          "output"
        ].includes(key)
      ) {
        continue;
      }
      params.set(key, value);
    }
  }

  const url = `https://api.semrush.com/?${params.toString()}`;
  const response = await fetch(url);
  const text = await response.text();

  if (!response.ok) {
    console.error(`Erreur HTTP ${response.status}`);
    console.error(text);
    process.exit(1);
  }

  if (/^ERROR/i.test(text.trim())) {
    console.error("Erreur API Semrush:");
    console.error(text);
    process.exit(1);
  }

  const rows = text.trim().split(/\r?\n/);
  const header = rows[0] || "";
  const dataRows = rows.slice(1);

  console.log(`Semrush OK | preset=${preset} | domain=${domain} | database=${database}`);
  console.log(header);
  for (const row of dataRows.slice(0, 10)) {
    console.log(row);
  }
  if (dataRows.length > 10) {
    console.log(`... ${dataRows.length - 10} lignes supplémentaires`);
  }

  const shouldSave = (args.save || "true").toLowerCase() !== "false";
  if (shouldSave) {
    const reportsDir = ensureReportsDir();
    const format = args.format || "csv";
    const defaultName = `semrush-${preset}-${domain}-${database}-${now}.${format}`;
    const outputPath = path.resolve(process.cwd(), args.output || path.join("reports", defaultName));

    if (format === "json") {
      const payload = {
        preset,
        domain,
        database,
        fetchedAt: new Date().toISOString(),
        header: header.split(";"),
        rows: dataRows.map((line) => line.split(";")),
      };
      fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf8");
    } else {
      fs.writeFileSync(outputPath, text, "utf8");
    }
    console.log(`Rapport enregistré: ${outputPath}`);
  }
}

main().catch((error) => {
  console.error("Erreur inattendue:", error.message || error);
  process.exit(1);
});
