#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

function parseArgs(argv) {
  const out = {};
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [k, ...rest] = arg.slice(2).split("=");
    out[k] = rest.length ? rest.join("=") : "true";
  }
  return out;
}

function parseCsv(content) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];
    const next = content[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(current);
      current = "";
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      continue;
    }

    current += ch;
  }

  if (current.length || row.length) {
    row.push(current);
    rows.push(row);
  }

  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    for (let i = 0; i < headers.length; i += 1) {
      obj[headers[i]] = (r[i] || "").trim();
    }
    return obj;
  });
}

function safeInt(value) {
  if (!value) return 0;
  const n = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function fixMojibake(text) {
  if (!text) return "";
  return text
    .replaceAll("Ã©", "é")
    .replaceAll("Ã¨", "è")
    .replaceAll("Ãª", "ê")
    .replaceAll("Ã ", "à")
    .replaceAll("Ã¢", "â")
    .replaceAll("Ã§", "ç")
    .replaceAll("Ã¹", "ù")
    .replaceAll("Ã»", "û")
    .replaceAll("Ã´", "ô")
    .replaceAll("Ã®", "î")
    .replaceAll("Ã¯", "ï")
    .replaceAll("â€™", "’")
    .replaceAll("â€“", "–")
    .replaceAll("â€”", "—");
}

function normalizeKeyword(k) {
  return fixMojibake(String(k || ""))
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isFrenchFocus(keyword, targetUrl) {
  const k = normalizeKeyword(keyword);
  const frHints = [
    "apl",
    "rsa",
    "prime",
    "activite",
    "impot",
    "notaire",
    "plus value",
    "plus-value",
    "salaire",
    "chomage",
    "caf",
    "simulateur",
    "simulation",
    "taxe",
    "pret",
    "loyer",
    "aide",
    "asf",
    "aah",
    "are",
  ];
  const frIntentHints = [
    "simulation",
    "simulateur",
    "calcul",
    "montant",
    "conditions",
    "aide",
    "revenu",
    "allocation",
    "brut",
    "net",
    "smic",
  ];

  const url = String(targetUrl || "").toLowerCase();
  const urlHints = [
    "/pages/apl",
    "/pages/rsa",
    "/pages/prime-activite",
    "/pages/impot",
    "/pages/notaire",
    "/pages/crypto-bourse",
    "/pages/salaire",
    "/pages/are",
    "/pages/asf",
    "/pages/plusvalue",
    "/pages/pret",
    "/pages/taxe",
    "/pages/financement",
    "/pages/ik",
    "/pages/simulateurs",
  ];

  const englishHeavy = [
    "how ",
    "what ",
    "when ",
    "why ",
    "can ",
    "is ",
    "are ",
    "do ",
    "does ",
    "meaning ",
    "government ",
    "government",
    "app ",
    "solver",
    "sid",
    "calculate ",
    "capital gains",
    "taxes",
    "tax ",
    "loan",
    "car ",
    "property",
    "software",
    "explained",
    "credit ",
    "advisor",
    "french ",
    "current ",
    "annual ",
    "rate ",
    "rates",
    "self ",
    "employment",
    "overtime",
    "brackets",
    "calculadora",
    "calculator",
    "tax return",
    "inflation rate",
    "self employment",
    "car loan",
  ];

  const offTopic = [
    "solutionneur",
    "mathematique",
    "mathématique",
    "equation",
    "geometry",
  ];

  const hasFrHint = frHints.some((token) => k.includes(token));
  const hasFrIntentHint = frIntentHints.some((token) => k.includes(token));
  const hasUrlHint = urlHints.some((token) => url.includes(token));
  const hasEnglishHeavy = englishHeavy.some((token) => k.includes(token));
  const hasOffTopic = offTopic.some((token) => k.includes(token));

  if (hasOffTopic) return false;
  if (hasEnglishHeavy && !/[éèêàùôîç]/i.test(fixMojibake(keyword))) return false;
  if ((hasFrHint || hasFrIntentHint) && hasUrlHint && !hasEnglishHeavy) return true;

  // Permet les requêtes FR sans token métier.
  return /[éèêàùôîç]/i.test(fixMojibake(keyword)) && hasUrlHint;
}

function detectCluster(targetUrl, keyword) {
  const url = String(targetUrl || "").toLowerCase();
  const k = normalizeKeyword(keyword);
  if (url.includes("/pages/apl") || k.includes("apl")) return "APL";
  if (url.includes("/pages/rsa") || k.includes("rsa")) return "RSA";
  if (url.includes("/pages/prime-activite") || k.includes("prime") || k.includes("activite")) return "Prime activité";
  if (url.includes("/pages/are") || k.includes("are")) return "ARE";
  if (url.includes("/pages/asf") || k.includes("asf")) return "ASF";
  if (url.includes("/pages/impot") || k.includes("impot") || k.includes("fiscal")) return "Impôt";
  if (url.includes("/pages/salaire") || k.includes("salaire") || k.includes("smic")) return "Salaire";
  if (url.includes("/pages/crypto-bourse") || k.includes("crypto") || k.includes("bitcoin")) return "Crypto";
  if (url.includes("/pages/notaire") || k.includes("notaire")) return "Notaire";
  if (url.includes("/pages/plusvalue") || k.includes("plus value") || k.includes("plus-value")) return "Plus-value";
  if (url.includes("/pages/pret") || k.includes("pret")) return "Prêt";
  if (url.includes("/pages/taxe") || k.includes("taxe")) return "Taxe";
  return "Autres";
}

function loadSemrushPositions(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const json = JSON.parse(raw);
  const map = new Map();
  for (const row of json.rows || []) {
    const keyword = fixMojibake(row[0] || "");
    const position = safeInt(row[1] || "0");
    const volume = safeInt(row[2] || "0");
    const url = row[4] || "";
    if (!keyword) continue;
    map.set(normalizeKeyword(keyword), {
      keyword,
      position,
      volume,
      url,
    });
  }
  return map;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const today = new Date().toISOString().slice(0, 10);

  const csvPath = path.resolve(
    process.cwd(),
    args.input || "C:/Users/prene/Downloads/www_lescalculateurs_fr_-_keyword_strategy.csv"
  );
  const semrushPath = path.resolve(
    process.cwd(),
    args.positions || "reports/semrush-positions-lescalculateurs.fr-fr-2026-04-12.json"
  );
  const outPath = path.resolve(
    process.cwd(),
    args.output || `reports/keyword-priority-fr-${today}.json`
  );
  const topN = safeInt(args.top || "20") || 20;

  if (!fs.existsSync(csvPath)) {
    console.error(`Fichier introuvable: ${csvPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(semrushPath)) {
    console.error(`Fichier introuvable: ${semrushPath}`);
    process.exit(1);
  }

  const csvRaw = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvRaw);
  const semrushMap = loadSemrushPositions(semrushPath);

  const candidates = [];
  for (const row of rows) {
    const keyword = fixMojibake(row.keyword || "");
    if (!keyword || !isFrenchFocus(keyword, row.url || "")) continue;
    const volume = safeInt(row.volume);
    if (volume <= 0) continue;
    const kd = safeInt(row["keyword difficulty"]);
    const intent = row.intent || "";
    const type = row["keyword type"] || "";
    const url = row.url || "";
    const normalized = normalizeKeyword(keyword);
    const rank = semrushMap.get(normalized);
    const baseScore = Number((volume * (1 - Math.min(kd, 100) / 100)).toFixed(2));
    candidates.push({
      keyword,
      normalizedKeyword: normalized,
      volume,
      kd,
      intent,
      type,
      targetUrl: url,
      currentRanked: Boolean(rank),
      currentPosition: rank ? rank.position : null,
      currentUrl: rank ? rank.url : null,
      opportunityScore: baseScore,
      cluster: detectCluster(url, keyword),
      action:
        !rank ? "create_or_optimize_target_page" : rank.position > 10 ? "optimize_existing_page" : "defend_and_improve_ctr",
    });
  }

  const dedup = new Map();
  for (const c of candidates) {
    const prev = dedup.get(c.normalizedKeyword);
    if (!prev || c.opportunityScore > prev.opportunityScore) dedup.set(c.normalizedKeyword, c);
  }
  const all = [...dedup.values()].sort((a, b) => b.opportunityScore - a.opportunityScore);
  const top = all.slice(0, topN);

  const grouped = {
    create_or_optimize_target_page: top.filter((x) => x.action === "create_or_optimize_target_page"),
    optimize_existing_page: top.filter((x) => x.action === "optimize_existing_page"),
    defend_and_improve_ctr: top.filter((x) => x.action === "defend_and_improve_ctr"),
  };
  const byCluster = {};
  for (const item of top) {
    if (!byCluster[item.cluster]) byCluster[item.cluster] = [];
    byCluster[item.cluster].push(item);
  }
  const executionPlanTop20 = [
    ...top.filter((x) => x.action === "optimize_existing_page"),
    ...top.filter((x) => x.action === "create_or_optimize_target_page"),
    ...top.filter((x) => x.action === "defend_and_improve_ctr"),
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    source: {
      keywordCsv: csvPath,
      semrushPositions: semrushPath,
    },
    summary: {
      totalCsvRows: rows.length,
      frenchFocusCandidates: all.length,
      topN,
    },
    topKeywords: top,
    groupedTopKeywords: grouped,
    groupedByCluster: byCluster,
    executionPlanTop20,
    recommendedNextStep: [
      "Optimiser d’abord les keywords en action optimize_existing_page (positions > 10).",
      "Créer ou renforcer les pages pour create_or_optimize_target_page.",
      "Sur les pages déjà top 10, travailler le CTR (title/meta/H1/intro) et le maillage interne.",
    ],
  };

  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`Rapport généré: ${outPath}`);
  console.log(`Top ${topN} opportunités FR:`);
  for (const item of top.slice(0, 12)) {
    const pos = item.currentPosition ? `pos ${item.currentPosition}` : "non classé";
    console.log(`- ${item.keyword} | vol ${item.volume} | KD ${item.kd} | ${pos} | ${item.action}`);
  }
}

main();
