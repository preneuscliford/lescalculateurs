#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = new Map();
  for (const raw of argv.slice(2)) {
    if (!raw.startsWith("--")) continue;
    const [k, ...rest] = raw.slice(2).split("=");
    args.set(k, rest.length ? rest.join("=") : "true");
  }

  return {
    input: args.get("input") || "seach-console-perf/www.lescalculateurs.fr_KeywordReport_4_19_2026.csv",
    top: Number.parseInt(args.get("top") || "40", 10),
    maxPosition: Number.parseFloat(args.get("max-position") || "12"),
    minImpressions: Number.parseInt(args.get("min-impressions") || "80", 10),
    output: args.get("output") || "",
  };
}

function parseCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  out.push(current);
  return out;
}

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] || "";
      return acc;
    }, {});
  });
}

function parsePct(value) {
  const cleaned = String(value || "")
    .replace("%", "")
    .replace(",", ".")
    .trim();
  return cleaned ? Number.parseFloat(cleaned) / 100 : 0;
}

function normalizeKeyword(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function scoreKeyword(item) {
  return item.impressions * (1 - Math.min(Math.max(item.ctr, 0), 1)) * (1 / Math.max(item.position, 1));
}

function classifyKeyword(keyword) {
  const text = normalizeKeyword(keyword);

  const rules = [
    { cluster: "impot", page: "/pages/impot", terms: ["impot", "impots", "decote", "quotient familial", "bareme impot", "tranches d impot"] },
    { cluster: "apl", page: "/pages/apl", terms: ["apl", "caf simulation apl", "simulation caf apl"] },
    { cluster: "prime-activite", page: "/pages/prime-activite", terms: ["prime activite", "prime d'activite", "prime d activite"] },
    { cluster: "rsa", page: "/pages/rsa", terms: ["rsa"] },
    { cluster: "are", page: "/pages/are", terms: ["chomage", "allocation retour emploi", "are"] },
    { cluster: "notaire", page: "/pages/notaire", terms: ["frais de notaire", "notaire"] },
    { cluster: "pret", page: "/pages/pret", terms: ["pret", "emprunt", "taux d'endettement", "mensualite"] },
    { cluster: "salaire", page: "/pages/salaire-brut-net-calcul-2026", terms: ["brut en net", "salaire brut", "salaire net"] },
    { cluster: "aah", page: "/pages/aah", terms: ["aah"] },
    { cluster: "asf", page: "/pages/asf", terms: ["asf", "allocation de soutien familial"] },
    { cluster: "taxe", page: "/pages/taxe", terms: ["taxe fonciere", "taxe habitation", "taxe"] },
    { cluster: "charges", page: "/pages/charges", terms: ["charges", "charges sociales"] },
    { cluster: "crypto-bourse", page: "/pages/crypto-bourse", terms: ["crypto", "bourse"] },
  ];

  for (const rule of rules) {
    if (rule.terms.some((term) => text.includes(term))) {
      return { cluster: rule.cluster, targetPage: rule.page };
    }
  }

  return { cluster: "autres", targetPage: null };
}

function buildMarkdown(report) {
  const lines = [];
  lines.push(`# Priorites Bing Keyword Report (${report.generatedAt})`);
  lines.push("");
  lines.push("## Parametres");
  lines.push(`- Source: \`${report.input}\``);
  lines.push(`- Impressions min: \`${report.thresholds.minImpressions}\``);
  lines.push(`- Position max: \`${report.thresholds.maxPosition}\``);
  lines.push(`- Top keywords retenus: \`${report.summary.totalKeywords}\``);
  lines.push("");
  lines.push("## Clusters prioritaires");
  lines.push("| Cluster | Page cible | Keywords | Impr | Clics | Score |");
  lines.push("|---|---|---:|---:|---:|---:|");
  for (const cluster of report.clusters) {
    lines.push(`| ${cluster.cluster} | ${cluster.targetPage || "-"} | ${cluster.keywordCount} | ${cluster.impressions} | ${cluster.clicks} | ${cluster.score.toFixed(2)} |`);
  }

  for (const cluster of report.clusters) {
    lines.push("");
    lines.push(`## ${cluster.cluster}`);
    lines.push(`- Page cible: ${cluster.targetPage || "a definir"}`);
    lines.push(`- Opportunite totale: ${cluster.score.toFixed(2)}`);
    lines.push(`- Impressions: ${cluster.impressions}`);
    lines.push(`- Clics: ${cluster.clicks}`);
    lines.push("");
    lines.push("| Keyword | Impr | Clics | CTR | Pos | Score |");
    lines.push("|---|---:|---:|---:|---:|---:|");
    for (const keyword of cluster.keywords) {
      lines.push(`| ${keyword.keyword} | ${keyword.impressions} | ${keyword.clicks} | ${(keyword.ctr * 100).toFixed(2)}% | ${keyword.position.toFixed(2)} | ${keyword.score.toFixed(2)} |`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

function main() {
  const options = parseArgs(process.argv);
  const inputPath = path.resolve(process.cwd(), options.input);
  const rows = readCsv(inputPath);

  const keywords = rows
    .map((row) => {
      const keyword = row.Keyword || "";
      const impressions = Number.parseInt(String(row.Impressions || "0").replace(/\s+/g, ""), 10) || 0;
      const clicks = Number.parseInt(String(row.Clicks || "0").replace(/\s+/g, ""), 10) || 0;
      const ctr = parsePct(row.CTR);
      const position = Number.parseFloat(String(row["Avg. Position"] || "0").replace(",", ".")) || 0;
      const classification = classifyKeyword(keyword);
      const score = impressions * (1 - Math.min(Math.max(ctr, 0), 1)) * (1 / Math.max(position, 1));

      return {
        keyword,
        impressions,
        clicks,
        ctr,
        position,
        score,
        cluster: classification.cluster,
        targetPage: classification.targetPage,
      };
    })
    .filter((item) => item.keyword)
    .filter((item) => item.impressions >= options.minImpressions)
    .filter((item) => item.position > 0 && item.position <= options.maxPosition)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.top);

  const byCluster = new Map();
  for (const item of keywords) {
    if (!byCluster.has(item.cluster)) {
      byCluster.set(item.cluster, {
        cluster: item.cluster,
        targetPage: item.targetPage,
        keywordCount: 0,
        impressions: 0,
        clicks: 0,
        score: 0,
        keywords: [],
      });
    }

    const cluster = byCluster.get(item.cluster);
    cluster.keywordCount += 1;
    cluster.impressions += item.impressions;
    cluster.clicks += item.clicks;
    cluster.score += item.score;
    cluster.keywords.push(item);
  }

  const clusters = [...byCluster.values()]
    .map((cluster) => ({
      ...cluster,
      keywords: cluster.keywords.sort((a, b) => b.score - a.score).slice(0, 12),
    }))
    .sort((a, b) => b.score - a.score);

  const report = {
    generatedAt: new Date().toISOString(),
    input: path.relative(process.cwd(), inputPath),
    thresholds: {
      minImpressions: options.minImpressions,
      maxPosition: options.maxPosition,
      top: options.top,
    },
    summary: {
      totalKeywords: keywords.length,
      totalClusters: clusters.length,
    },
    clusters,
    keywords,
  };

  const reportsDir = path.resolve(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const baseName = options.output || `bing-keyword-priority-${new Date().toISOString().slice(0, 10)}`;
  const jsonPath = path.join(reportsDir, `${baseName}.json`);
  const mdPath = path.join(reportsDir, `${baseName}.md`);

  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdPath, `${buildMarkdown(report)}\n`, "utf8");

  console.log(`Rapport JSON: ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Rapport Markdown: ${path.relative(process.cwd(), mdPath)}`);
  console.log(`Keywords retenus: ${report.summary.totalKeywords}`);
  console.log(`Clusters: ${report.summary.totalClusters}`);
}

main();
